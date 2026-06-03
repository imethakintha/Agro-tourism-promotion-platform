import express from 'express';
import {
    createActivity,
    getMyActivities,
    updateActivity,
    updateAvailability,
    getCategories,
    getTagsByCategory,
    getActivityDetails,
    getActivityById,
    bulkUpdateAvailability
} from '../controllers/activityController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/tags/:categoryId', getTagsByCategory);
router.get('/details/:activityId', getActivityDetails);

// Protected Farmer routes
router.post('/create', protect, authorize('Farmer'), createActivity);
router.get('/my-activities', protect, authorize('Farmer'), getMyActivities);
router.put('/:activityId/availability', protect, authorize('Farmer'), updateAvailability);
router.put('/:activityId/availability/bulk', protect, authorize('Farmer'), bulkUpdateAvailability);

router.post('/', protect, authorize('Farmer'), createActivity);

router.get('/:id', getActivityById);
router.put('/:id', protect, authorize('Farmer'), updateActivity);

export default router;