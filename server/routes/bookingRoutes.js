import express from 'express';
import {
    checkAvailability,
    createBooking,
    getMyBookings,
    getBookingDetails,
    cancelBooking,
    getTransportEstimate,
    createExpeditionBooking,
    acceptExpeditionService
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Semi-public (Activity page)
router.post('/check-availability', checkAvailability);

// Tourist routes
router.post('/create', protect, authorize('Tourist'), createBooking);
router.get('/my-bookings', protect, getMyBookings); // Shared by Tourist and Farmer logic
router.get('/:bookingId', protect, getBookingDetails);
router.put('/:bookingId/cancel', protect, authorize('Tourist'), cancelBooking);
router.post('/estimate-transport', protect, getTransportEstimate);
router.post('/expedition', protect, authorize('Tourist'), createExpeditionBooking);

// Provider Routes
router.post('/accept-expedition', protect, authorize('TourGuide', 'TransportProvider'), acceptExpeditionService);

export default router;