import express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', protect, addFavorite);
router.delete('/remove/:activityId', protect, removeFavorite);
router.get('/list', protect, getFavorites);

export default router;