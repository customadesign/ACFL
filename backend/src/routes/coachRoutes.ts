import { Router } from 'express';
import { getCoachById } from '../controllers/coachController';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { validationResult, body } from 'express-validator';
import { Request, Response } from 'express';

const router = Router();

// Get coach profile (put specific routes before parameterized ones)
router.get('/coach/profile', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Coach role required.' 
      });
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get coach profile
    const { data: coachProfile, error: profileError } = await supabase
      .from('coaches')
      .select('*')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !coachProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coach profile not found' 
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        ...coachProfile
      }
    });
  } catch (error) {
    console.error('Get coach profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile' 
    });
  }
});

// Update coach profile
router.put('/coach/profile', [
  authenticate,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone('any'),
  body('bio').optional().isLength({ max: 1000 }),
  body('specialties').optional().isArray({ min: 1 }),
  body('languages').optional().isArray({ min: 1 }),
  body('qualifications').optional().isArray(),
  body('experience').optional().isInt({ min: 0 }),
  body('hourlyRate').optional().isFloat({ min: 0 }),
  body('isAvailable').optional().isBoolean()
], async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Coach role required.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      firstName,
      lastName,
      phone,
      bio,
      specialties,
      languages,
      qualifications,
      experience,
      hourlyRate,
      isAvailable
    } = req.body;

    // Update coaches table
    const coachUpdates: any = { updated_at: new Date().toISOString() };
    if (firstName) coachUpdates.first_name = firstName;
    if (lastName) coachUpdates.last_name = lastName;
    if (phone !== undefined) coachUpdates.phone = phone;
    if (bio !== undefined) coachUpdates.bio = bio;
    if (specialties) coachUpdates.specialties = specialties;
    if (languages) coachUpdates.languages = languages;
    if (qualifications !== undefined) coachUpdates.qualifications = qualifications;
    if (experience !== undefined) coachUpdates.experience = experience;
    if (hourlyRate !== undefined) coachUpdates.hourly_rate = hourlyRate;
    if (isAvailable !== undefined) coachUpdates.is_available = isAvailable;

    const { data: updatedCoach, error: coachError } = await supabase
      .from('coaches')
      .update(coachUpdates)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (coachError) {
      throw coachError;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCoach
    });
  } catch (error) {
    console.error('Update coach profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// Get coach dashboard stats
router.get('/coach/dashboard', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Coach role required.' 
      });
    }

    // Get coach profile first
    const { data: coachProfile, error: profileError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !coachProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coach profile not found' 
      });
    }

    const coachId = coachProfile.id;

    // Get today's appointments
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAppointments, error: appointmentsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('coach_id', coachId)
      .gte('scheduled_at', `${today}T00:00:00`)
      .lt('scheduled_at', `${today}T23:59:59`)
      .in('status', ['scheduled', 'confirmed']);

    // Get total active clients
    const { data: activeClients, error: clientsError } = await supabase
      .from('sessions')
      .select('client_id')
      .eq('coach_id', coachId)
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    const uniqueClientIds = [...new Set(activeClients?.map(s => s.client_id) || [])];

    // Get this week's sessions
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const { data: weekSessions, error: weekError } = await supabase
      .from('sessions')
      .select('*')
      .eq('coach_id', coachId)
      .gte('scheduled_at', weekStart.toISOString())
      .in('status', ['scheduled', 'confirmed', 'completed']);

    // Get coach rating from profile
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('rating')
      .eq('id', coachId)
      .single();

    // Get recent clients with their last sessions
    const { data: recentSessions, error: recentError } = await supabase
      .from('sessions')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          users (email)
        )
      `)
      .eq('coach_id', coachId)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          todayAppointments: todayAppointments?.length || 0,
          activeClients: uniqueClientIds.length,
          weekSessions: weekSessions?.length || 0,
          rating: coachData?.rating || 0
        },
        todayAppointments: todayAppointments || [],
        recentClients: recentSessions || []
      }
    });
  } catch (error) {
    console.error('Get coach dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get dashboard data' 
    });
  }
});

// Get coach appointments
router.get('/coach/appointments', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Coach role required.' 
      });
    }

    const { filter = 'upcoming' } = req.query;

    // Get coach profile first
    const { data: coachProfile, error: profileError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !coachProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coach profile not found' 
      });
    }

    let query = supabase
      .from('sessions')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          phone,
          users (email)
        )
      `)
      .eq('coach_id', coachProfile.id)
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
    console.error('Get coach appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get appointments' 
    });
  }
});

// Get coach clients
router.get('/coach/clients', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Coach role required.' 
      });
    }

    // Get coach profile first
    const { data: coachProfile, error: profileError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !coachProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coach profile not found' 
      });
    }

    // Get all clients who have had sessions with this coach
    const { data: clientSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        client_id,
        scheduled_at,
        status,
        clients (
          id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          preferences,
          created_at,
          users (email)
        )
      `)
      .eq('coach_id', coachProfile.id)
      .order('scheduled_at', { ascending: false });

    if (sessionsError) {
      throw sessionsError;
    }

    // Process clients data
    const clientsMap = new Map();
    
    clientSessions?.forEach((session: any) => {
      const clientId = session.client_id;
      const client = session.clients as any;
      
      if (!client) return; // Skip if client data is null
      
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          id: client.id,
          name: `${client.first_name} ${client.last_name}`,
          email: client.users?.email || '',
          phone: client.phone || '',
          totalSessions: 0,
          lastSession: null,
          nextSession: null,
          status: 'inactive' as 'active' | 'inactive',
          startDate: client.created_at,
          sessions: []
        });
      }
      
      const clientData = clientsMap.get(clientId);
      clientData.sessions.push(session);
      
      if (session.status === 'completed') {
        clientData.totalSessions++;
        if (!clientData.lastSession || new Date(session.scheduled_at) > new Date(clientData.lastSession)) {
          clientData.lastSession = session.scheduled_at;
        }
      }
      
      if (session.status === 'scheduled' || session.status === 'confirmed') {
        if (!clientData.nextSession || new Date(session.scheduled_at) < new Date(clientData.nextSession)) {
          clientData.nextSession = session.scheduled_at;
        }
        clientData.status = 'active';
      }
    });

    const clients = Array.from(clientsMap.values()).map((client: any) => {
      // Add concerns from preferences
      const preferences = client.sessions[0]?.clients?.preferences;
      client.concerns = preferences?.specialties || [];
      delete client.sessions; // Remove sessions array from response
      return client;
    });

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Get coach clients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get clients' 
    });
  }
});

// Update appointment status
router.put('/coach/appointments/:id', [
  authenticate,
  body('status').isIn(['scheduled', 'confirmed', 'cancelled', 'completed'])
], async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Coach role required.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Get coach profile first
    const { data: coachProfile, error: profileError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !coachProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coach profile not found' 
      });
    }

    // Update appointment status
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('sessions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('coach_id', coachProfile.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update appointment status' 
    });
  }
});

// Get coach profile stats
router.get('/coach/profile/stats', authenticate, async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Coach role required.' 
      });
    }

    // Get coach profile first
    const { data: coachProfile, error: profileError } = await supabase
      .from('coaches')
      .select('id, rating')
      .eq('user_id', req.user.userId)
      .single();

    if (profileError || !coachProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Coach profile not found' 
      });
    }

    const coachId = coachProfile.id;

    // Get all sessions for this coach
    const { data: allSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('coach_id', coachId);

    if (sessionsError) {
      throw sessionsError;
    }

    // Get unique clients
    const uniqueClientIds = [...new Set(allSessions?.map(s => s.client_id) || [])];
    
    // Calculate stats
    const totalSessions = allSessions?.filter(s => s.status === 'completed').length || 0;
    const totalClients = uniqueClientIds.length;
    const completedSessions = allSessions?.filter(s => s.status === 'completed').length || 0;
    const totalScheduled = allSessions?.length || 0;
    const completionRate = totalScheduled > 0 ? Math.round((completedSessions / totalScheduled) * 100) : 0;
    const averageRating = coachProfile.rating || 0;

    res.json({
      success: true,
      data: {
        totalClients,
        totalSessions,
        averageRating,
        completionRate
      }
    });
  } catch (error) {
    console.error('Get coach profile stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile stats' 
    });
  }
});

// Get coach by ID (put parameterized routes after specific ones)
router.get('/coach/:id', getCoachById);

export default router; 