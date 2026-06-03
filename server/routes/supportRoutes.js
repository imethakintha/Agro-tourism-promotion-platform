import express from 'express';
import { 
    createTicket, 
    getUserTickets, 
    getTicketDetails, 
    replyToTicket,
    getAllTickets,
    updateTicketStatus
} from '../controllers/supportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Routes
router.post('/create', protect, createTicket);
router.get('/my-tickets', protect, getUserTickets);
router.get('/:ticketId', protect, getTicketDetails);
router.post('/:ticketId/reply', protect, replyToTicket);

// Admin Routes
router.get('/admin/all', protect, authorize('Administrator'), getAllTickets);
router.put('/admin/:ticketId/status', protect, authorize('Administrator'), updateTicketStatus);

export default router;