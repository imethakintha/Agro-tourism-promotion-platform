import express from 'express';
import multer from 'multer';
import path from 'path';
import { identifyPlant, chatBot, getChatHistory, getRecommendations, checkLanguageAvailability, generateTripPlan, getAgroWisdom, getSmartPrice } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for Image Upload
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `ai-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 5000000 } // 5MB
});

// Plant Identification
router.post('/identify-plant', protect, upload.single('image'), identifyPlant);

// Chatbot
router.post('/chatbot', protect, chatBot);
router.get('/conversation-history/:sessionId', protect, getChatHistory);

// AI Recommendations
router.get('/recommendations', protect, getRecommendations);

// Language Prediction
router.post('/predict-language', checkLanguageAvailability);

// Trip Planner
router.post('/generate-trip', generateTripPlan);

// AgroLK Wisdom Hub (RAG)
router.post('/agro-guide', getAgroWisdom);

// Smart Pricing Route
router.post('/smart-price', getSmartPrice);

export default router;