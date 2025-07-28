import { Router } from 'express';
import { getCoachById } from '../controllers/coachController';

const router = Router();

router.get('/coach/:id', getCoachById);

export default router; 