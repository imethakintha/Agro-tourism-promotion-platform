import express from 'express';
import { registerGuide, getGuideProfile, getPendingRequests, respondToRequest, getMyJobs } from '../controllers/guideController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, authorize('TourGuide'), registerGuide);
router.get('/profile', protect, authorize('TourGuide'), getGuideProfile);

// Request Management
router.get('/requests', protect, authorize('TourGuide'), getPendingRequests);
router.put('/requests/:bookingId/respond', protect, authorize('TourGuide'), respondToRequest);

router.get('/jobs', protect, authorize('TourGuide'), getMyJobs);

export default router;