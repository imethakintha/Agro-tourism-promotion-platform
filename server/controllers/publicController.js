import Activity from '../models/Activity.js';
import Farm from '../models/Farm.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { geocodeAddress } from '../services/googleMapsService.js';


export const getPublicStats = async (req, res, next) => {
  try {
    const totalFarms = await Farm.countDocuments({ verificationStatus: 'Approved' });
    const totalActivities = await Activity.countDocuments({ status: 'Active' });
    const totalReviews = await Review.countDocuments({ moderationStatus: 'Approved' });
    
    // Calculate total happiness score (avg rating)
    const avgRatingAgg = await Review.aggregate([
        { $match: { moderationStatus: 'Approved' } },
        { $group: { _id: null, avg: { $avg: '$ratings.overall' } } }
    ]);
    const averageRating = avgRatingAgg.length > 0 ? Math.round(avgRatingAgg[0].avg * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalFarms,
        totalActivities,
        totalReviews,
        averageRating
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExchangeRates = async (req, res, next) => {

  const rates = global.exchangeRates || { USD: 1, LKR: 305.5, EUR: 0.92 };
  
  res.status(200).json({
      success: true,
      data: rates
  });
};

export const getGeocode = async (req, res, next) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ message: 'Address is required' });

        const coords = await geocodeAddress(address);
        res.status(200).json({ success: true, data: coords });
    } catch (error) {
        next(error);
    }
};