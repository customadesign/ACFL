import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { validationResult, body } from 'express-validator';
import { Request, Response } from 'express';

const router = Router();

// Get client appointments
router.get('/client/appointments', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Client role required.' 
      });
    }

    const { filter = 'upcoming' } = req.query;

    // Get client profile first
    const { data: clientProfile, error: profileError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !clientProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Client profile not found' 
      });
    }

    let query = supabase
      .from('sessions')
      .select(`
        *,
        coaches (
          id,
          first_name,
          last_name,
          specialties,
          users (email)
        )
      `)
      .eq('client_id', clientProfile.id)
      .order('scheduled_at', { ascending: true });

    // Apply filters
    const now = new Date().toISOString();
    if (filter === 'upcoming') {
      query = query.gte('scheduled_at', now).in('status', ['scheduled', 'confirmed']);
    } else if (filter === 'past') {
      query = query.or(`scheduled_at.lt.${now},status.eq.completed`);
    } else if (filter === 'pending') {
      query = query.eq('status', 'scheduled');
    }

    const { data: appointments, error: appointmentsError } = await query;

    if (appointmentsError) {
      throw appointmentsError;
    }

    res.json({
      success: true,
      data: appointments || []
    });
  } catch (error) {
    console.error('Get client appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get appointments' 
    });
  }
});

// Get saved coaches
router.get('/client/saved-coaches', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Client role required.' 
      });
    }

    // Get client profile first
    const { data: clientProfile, error: profileError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !clientProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Client profile not found' 
      });
    }

    // Get saved coaches
    const { data: savedCoaches, error: savedError } = await supabase
      .from('saved_coaches')
      .select(`
        *,
        coaches (
          id,
          first_name,
          last_name,
          bio,
          specialties,
          languages,
          hourly_rate,
          experience,
          rating,
          is_available,
          created_at,
          users (email)
        )
      `)
      .eq('client_id', clientProfile.id);

    if (savedError) {
      throw savedError;
    }

    // Format the response
    const formattedCoaches = savedCoaches?.map((saved: any) => {
      const coach = saved.coaches;
      return {
        id: coach.id,
        name: `${coach.first_name} ${coach.last_name}`,
        specialties: coach.specialties || [],
        languages: coach.languages || [],
        bio: coach.bio || '',
        sessionRate: coach.hourly_rate ? `$${coach.hourly_rate}/session` : 'Rate not specified',
        experience: coach.experience ? `${coach.experience} years` : 'Experience not specified',
        rating: coach.rating || 0,
        savedDate: coach.created_at, // Use coach's creation date as fallback
        virtualAvailable: coach.is_available,
        inPersonAvailable: coach.is_available,
        email: coach.users?.email
      };
    }) || [];

    res.json({
      success: true,
      data: formattedCoaches
    });
  } catch (error) {
    console.error('Get saved coaches error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get saved coaches' 
    });
  }
});

// Save a coach
router.post('/client/saved-coaches', [
  authenticate,
  body('coachId').notEmpty().withMessage('Coach ID is required')
], async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Client role required.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { coachId } = req.body;

    // Get client profile first
    const { data: clientProfile, error: profileError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !clientProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Client profile not found' 
      });
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_coaches')
      .select('id')
      .eq('client_id', clientProfile.id)
      .eq('coach_id', coachId)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Coach already saved'
      });
    }

    // Save the coach
    const { data: savedCoach, error: saveError } = await supabase
      .from('saved_coaches')
      .insert({
        client_id: clientProfile.id,
        coach_id: coachId
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    res.json({
      success: true,
      message: 'Coach saved successfully',
      data: savedCoach
    });
  } catch (error) {
    console.error('Save coach error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save coach' 
    });
  }
});

// Remove saved coach
router.delete('/client/saved-coaches/:coachId', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Client role required.' 
      });
    }

    const { coachId } = req.params;

    // Get client profile first
    const { data: clientProfile, error: profileError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !clientProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Client profile not found' 
      });
    }

    // Remove the saved coach
    const { error: removeError } = await supabase
      .from('saved_coaches')
      .delete()
      .eq('client_id', clientProfile.id)
      .eq('coach_id', coachId);

    if (removeError) {
      throw removeError;
    }

    res.json({
      success: true,
      message: 'Coach removed from saved list'
    });
  } catch (error) {
    console.error('Remove saved coach error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove saved coach' 
    });
  }
});

// Search coaches
router.post('/client/search-coaches', [
  authenticate,
  body('preferences').isObject().withMessage('Preferences object is required')
], async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Client role required.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { preferences } = req.body;

    // Build query based on preferences
    let query = supabase
      .from('coaches')
      .select(`
        id,
        first_name,
        last_name,
        bio,
        specialties,
        languages,
        hourly_rate,
        experience,
        rating,
        is_available,
        created_at,
        users (email)
      `)
      .eq('is_available', true);

    // Apply filters based on preferences
    if (preferences.specialties && preferences.specialties.length > 0) {
      query = query.overlaps('specialties', preferences.specialties);
    }

    if (preferences.languages && preferences.languages.length > 0) {
      query = query.overlaps('languages', preferences.languages);
    }

    const { data: coaches, error: coachesError } = await query;

    if (coachesError) {
      throw coachesError;
    }

    // Calculate match scores and format response
    const formattedCoaches = coaches?.map((coach: any) => {
      let matchScore = 50; // Base score

      // Calculate match score based on preferences
      if (preferences.specialties && preferences.specialties.length > 0) {
        const matchingSpecialties = coach.specialties?.filter((s: string) => 
          preferences.specialties.includes(s)
        ).length || 0;
        matchScore += (matchingSpecialties / preferences.specialties.length) * 30;
      }

      if (preferences.languages && preferences.languages.length > 0) {
        const matchingLanguages = coach.languages?.filter((l: string) => 
          preferences.languages.includes(l)
        ).length || 0;
        matchScore += (matchingLanguages / preferences.languages.length) * 20;
      }

      return {
        id: coach.id,
        name: `${coach.first_name} ${coach.last_name}`,
        specialties: coach.specialties || [],
        languages: coach.languages || [],
        bio: coach.bio || '',
        sessionRate: coach.hourly_rate ? `$${coach.hourly_rate}/session` : 'Rate not specified',
        experience: coach.experience ? `${coach.experience} years` : 'Experience not specified',
        rating: coach.rating || 0,
        matchScore: Math.min(Math.round(matchScore), 100),
        virtualAvailable: coach.is_available,
        inPersonAvailable: coach.is_available,
        email: coach.users?.email
      };
    }) || [];

    // Sort by match score
    formattedCoaches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: formattedCoaches
    });
  } catch (error) {
    console.error('Search coaches error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search coaches' 
    });
  }
});

export default router;