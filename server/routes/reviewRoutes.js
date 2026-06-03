import express from 'express';
import { createReview, getReviews, replyToReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createReview);
router.get('/target/:targetId', getReviews);
router.put('/:reviewId/reply', protect, replyToReview);

export default router;