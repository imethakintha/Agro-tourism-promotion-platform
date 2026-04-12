import express from 'express';
import { getPublicStats, getExchangeRates, getGeocode } from '../controllers/publicController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/statistics', apiLimiter, getPublicStats);
router.get('/rates', apiLimiter, getExchangeRates);
router.get('/geocode', apiLimiter, getGeocode);

export default router;