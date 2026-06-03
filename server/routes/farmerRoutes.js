import express from 'express';
import { registerFarm, getMyFarm, updateFarm, updateBookingStatus } from '../controllers/farmerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register-farm', protect, authorize('Farmer'), registerFarm);
router.get('/my-farm', protect, authorize('Farmer'), getMyFarm);
router.put('/update-farm', protect, authorize('Farmer'), updateFarm);
router.put('/booking/:bookingId/status', protect, authorize('Farmer'), updateBookingStatus);

export default router;