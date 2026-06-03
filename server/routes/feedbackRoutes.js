import express from 'express';
import { 
    createFeedback, 
    getAllFeedbacks, 
    updateFeedbackStatus,
    deleteFeedback 
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Route (ඕනෑම කෙනෙක්ට feedback දාන්න පුළුවන්)
router.post('/', createFeedback);

// Admin Routes
router.get('/', protect, authorize('Administrator'), getAllFeedbacks);
router.put('/:id', protect, authorize('Administrator'), updateFeedbackStatus);
router.delete('/:id', protect, authorize('Administrator'), deleteFeedback);

export default router;