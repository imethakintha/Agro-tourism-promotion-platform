import express from 'express';
import { searchActivities, getSuggestions, getFarmPublicProfile } from '../controllers/searchController.js';

const router = express.Router();

router.get('/activities', searchActivities);
router.get('/suggestions', getSuggestions);
router.get('/farms/:farmId', getFarmPublicProfile);

export default router;