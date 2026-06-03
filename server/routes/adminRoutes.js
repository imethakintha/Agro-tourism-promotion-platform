import express from 'express';
import { 
    getPendingVerifications, 
    verifyProvider,
    createCategory,
    createTag,
    getCategoriesAdmin,
    getPendingReviews,
    moderateReview,
    manualGeneratePayouts,
    getDashboardStats,
    getRevenueReports,
    getUserGrowth,
    getAllUsers,
    updateUserStatus,
    getAuditLogs,
    getSystemLogs,
    getActivityRevenueDistribution,
    getBookingStats,
    getProviderLeaderboard,
    getGeographicStats,
    getFinancialStats,
    getRevenueForecast
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes restricted to Administrator
router.use(protect, authorize('Administrator'));

// Dashboard
router.get('/stats', getDashboardStats);

// Verification routes
router.get('/verifications/pending', getPendingVerifications);
router.put('/verify/:providerId', verifyProvider);

// Category & Tag routes
router.post('/categories/create', createCategory);
router.post('/tags/create', createTag);
router.get('/categories', getCategoriesAdmin);

// Review Moderation
router.get('/reviews/pending', getPendingReviews);
router.put('/reviews/:reviewId/moderate', moderateReview);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);

router.post('/payouts/generate', manualGeneratePayouts);

// Reports
router.get('/reports/revenue', getRevenueReports);
router.get('/reports/users', getUserGrowth);
router.get('/reports/activity-revenue', getActivityRevenueDistribution);
router.get('/reports/bookings', getBookingStats);
router.get('/reports/leaderboard', getProviderLeaderboard);
router.get('/reports/geographic', getGeographicStats);
router.get('/reports/financial', getFinancialStats);
router.get('/reports/forecast', getRevenueForecast);

// Logs
router.get('/logs/audit', getAuditLogs);
router.get('/logs/system', getSystemLogs);

export default router;