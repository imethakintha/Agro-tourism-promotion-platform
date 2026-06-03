import express from 'express';
import { createPromotion, validatePromotion } from '../controllers/promotionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, authorize('Administrator'), createPromotion);
router.post('/validate', protect, validatePromotion);

export default router;