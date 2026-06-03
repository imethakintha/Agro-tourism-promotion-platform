import express from 'express';
import { registerTransport, getTransportProfile, getPendingRequests, respondToRequest, getMyTransportJobs } from '../controllers/transportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, authorize('TransportProvider'), registerTransport);
router.get('/profile', protect, authorize('TransportProvider'), getTransportProfile);

// Request Management
router.get('/requests', protect, authorize('TransportProvider'), getPendingRequests);
router.put('/requests/:bookingId/respond', protect, authorize('TransportProvider'), respondToRequest);
router.get('/jobs', protect, authorize('TransportProvider'), getMyTransportJobs);

export default router;