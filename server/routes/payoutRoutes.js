import express from 'express';
import { getEarnings, getAllPayouts, processPayout, generateWeeklyPayouts } from '../controllers/payoutController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Provider
router.get('/earnings', protect, getEarnings);

// Admin
router.get('/', protect, authorize('Administrator'), getAllPayouts);
router.post('/generate', protect, authorize('Administrator'), generateWeeklyPayouts);
router.put('/:payoutId/process', protect, authorize('Administrator'), processPayout);

export default router;