import Activity from '../models/Activity.js';
import ActivityCategory from '../models/ActivityCategory.js';
import Farm from '../models/Farm.js';
import mongoose from 'mongoose';


export const searchActivities = async (req, res, next) => {
  try {
    const {
      q, // search query
      category,
      priceMin,
      priceMax,
      rating,
      lat,
      lng,
      radius = 50, // km
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const pipeline = [];

    
    if (q) {
      pipeline.push({
        $match: {
          $text: { $search: q },
          status: 'Active'
        }
      });
    } else {

      pipeline.push({ $match: { status: 'Active' } });
    }
    
    pipeline.push({
      $lookup: {
        from: 'farms',
        localField: 'farmId',
        foreignField: '_id',
        as: 'farm'
      }
    });
    pipeline.push({ $unwind: '$farm' });

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {

      
      const farmsInRadius = await Farm.find({
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius) * 1000 // meters
          }
        }
      }).select('_id');
      
      const farmIds = farmsInRadius.map(f => f._id);

      if (farmIds.length === 0) {
          pipeline.push({ $match: { farmId: new mongoose.Types.ObjectId() } }); // Force empty result
      } else {
          pipeline.push({ $match: { farmId: { $in: farmIds } } });
      }
    }

    // 3. Category Filter
    if (category) {
      pipeline.push({
        $match: { categoryId: new mongoose.Types.ObjectId(category) }
      });
    }

    // 4. Price Filter
    if (priceMin || priceMax) {
      const priceMatch = {};
      if (priceMin) priceMatch.$gte = parseInt(priceMin);
      if (priceMax) priceMatch.$lte = parseInt(priceMax);
      pipeline.push({ $match: { pricePerPerson: priceMatch } });
    }

    // 5. Rating Filter
    if (rating) {
      pipeline.push({ $match: { averageRating: { $gte: parseInt(rating) } } });
    }

    // 6. Sorting
    let sortStage = {};
    if (sort === 'price_asc') sortStage = { pricePerPerson: 1 };
    else if (sort === 'price_desc') sortStage = { pricePerPerson: -1 };
    else if (sort === 'rating') sortStage = { averageRating: -1 };
    else if (sort === 'newest') sortStage = { createdAt: -1 };
    else {
      // Relevance (if text search used, sort by score)
      if (q) sortStage = { score: { $meta: 'textScore' } };
      else sortStage = { createdAt: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // 7. Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Count total before slicing
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Activity.aggregate(countPipeline);
    const totalItems = totalResult.length > 0 ? totalResult[0].total : 0;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Lookup Category info for display
    pipeline.push({
      $lookup: {
        from: 'activitycategories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categoryData'
      }
    });
    pipeline.push({ $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true } });

    const activities = await Activity.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems,
          totalPages: Math.ceil(totalItems / parseInt(limit))
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, data: [] });

    // Find matching titles
    const activities = await Activity.find(
      { customTitle: { $regex: q, $options: 'i' }, status: 'Active' }
    ).select('customTitle').limit(5);

    const categories = await ActivityCategory.find(
      { categoryName: { $regex: q, $options: 'i' } }
    ).select('categoryName').limit(3);

    const suggestions = [
      ...activities.map(a => a.customTitle),
      ...categories.map(c => c.categoryName)
    ];

    res.status(200).json({
      success: true,
      data: [...new Set(suggestions)] // Remove duplicates
    });

  } catch (error) {
    next(error);
  }
};

export const getFarmPublicProfile = async (req, res, next) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findOne({ _id: farmId, verificationStatus: 'Approved' })
        .populate('userId', 'fullName profilePic');

    if (!farm) return res.status(404).json({ message: 'Farm not found' });

    const activities = await Activity.find({ farmId: farm._id, status: 'Active' })
        .select('customTitle pricePerPerson durationHours images averageRating totalReviews difficulty');

    res.status(200).json({
      success: true,
      data: {
        farm,
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};