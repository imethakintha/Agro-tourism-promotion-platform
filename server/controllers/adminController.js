import Farm from '../models/Farm.js';
import TourGuide from '../models/TourGuide.js';
import TransportProvider from '../models/TransportProvider.js';
import VerificationLog from '../models/VerificationLog.js';
import ActivityCategory from '../models/ActivityCategory.js';
import ActivityTag from '../models/ActivityTag.js';
import Review from '../models/Review.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js'
import AuditLog from '../models/AuditLog.js';
import SystemLog from '../models/SystemLog.js';
import { logAudit } from '../utils/auditLogger.js';
import { generateWeeklyPayouts } from '../cron/weeklyPayouts.js';

export const getPendingVerifications = async (req, res, next) => {
  try {
    const pendingFarms = await Farm.find({ verificationStatus: 'Pending' }).populate('userId', 'fullName email phoneNumber');
    const pendingGuides = await TourGuide.find({ verificationStatus: 'Pending' }).populate('userId', 'fullName email phoneNumber');
    const pendingTransport = await TransportProvider.find({ verificationStatus: 'Pending' }).populate('userId', 'fullName email phoneNumber');

    const verifications = [
      ...pendingFarms.map(f => ({ ...f.toObject(), providerType: 'Farmer' })),
      ...pendingGuides.map(g => ({ ...g.toObject(), providerType: 'TourGuide' })),
      ...pendingTransport.map(t => ({ ...t.toObject(), providerType: 'TransportProvider' }))
    ];

    res.status(200).json({
      success: true,
      data: verifications
    });
  } catch (error) {
    next(error);
  }
};

export const verifyProvider = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { action, comments, providerType } = req.body;

    let Model;
    switch (providerType) {
      case 'Farmer': Model = Farm; break;
      case 'TourGuide': Model = TourGuide; break;
      case 'TransportProvider': Model = TransportProvider; break;
      default: return res.status(400).json({ success: false, message: 'Invalid provider type' });
    }

    const provider = await Model.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    provider.verificationStatus = action; 
    if (action === 'Approved') {
      provider.isActive = true;
    }
    await provider.save();

    await VerificationLog.create({
      providerUserId: provider.userId,
      providerType,
      adminUserId: req.user.id,
      action,
      comments
    });

    await logAudit(`Provider ${action}`, req.user.id, providerId, providerType, { comments }, req.ip);

    res.status(200).json({
      success: true,
      message: 'Verification completed'
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { categoryName, description, icon } = req.body;
    const category = await ActivityCategory.create({ categoryName, description, icon });
    await logAudit('Create Category', req.user.id, category._id, 'ActivityCategory', { categoryName }, req.ip);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const { categoryId, tagName, description } = req.body;
    const tag = await ActivityTag.create({ categoryId, tagName, description });
    await logAudit('Create Tag', req.user.id, tag._id, 'ActivityTag', { tagName }, req.ip);
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    next(error);
  }
};

export const getCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await ActivityCategory.find({});
    const tags = await ActivityTag.find({});
    
    // Combine for easy frontend consumption
    const data = categories.map(cat => ({
      ...cat.toObject(),
      tags: tags.filter(tag => tag.categoryId.toString() === cat._id.toString())
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPendingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ moderationStatus: 'Pending' })
      .populate('reviewerId', 'fullName email')
      .populate('targetId', 'customTitle farmName licenseNumber vehicleRegistrationNo'); // Populate possible target fields
      
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body; // Approved or Rejected
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) return res.status(404).json({message: 'Review not found'});
    
    review.moderationStatus = status;
    await review.save();

    if (status === 'Approved') {
        await updateEntityRating(review.targetId, review.targetType);
    }

    await logAudit(`Review ${status}`, req.user.id, review._id, 'Review', { status }, req.ip);

    res.status(200).json({ success: true, message: `Review ${status}` });
  } catch (error) {
    next(error);
  }
};

const updateEntityRating = async (targetId, targetType) => {
    const stats = await Review.aggregate([
        { $match: { targetId: targetId, moderationStatus: 'Approved' } },
        { $group: { _id: '$targetId', avgRating: { $avg: '$ratings.overall' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
        const { avgRating, count } = stats[0];
        const roundedRating = Math.round(avgRating * 10) / 10;

        if (targetType === 'Activity') {
            await Activity.findByIdAndUpdate(targetId, { averageRating: roundedRating, totalReviews: count });
        } 
    }
};

export const manualGeneratePayouts = async (req, res, next) => {
    try {
        console.log("Admin triggered manual payout generation...");
        await generateWeeklyPayouts();
        res.status(200).json({ success: true, message: 'Weekly payouts generated successfully!' });
    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async (req, res, next) => {
    try {
        // අපි Promise.all භාවිතා කරන්නේ එකවර queries කිහිපයක් run කරලා වේගය වැඩි කරගන්නයි
        const [
            totalUsers,
            touristCount,
            farmerCount,
            guideCount,
            transportCount,
            pendingFarms,
            pendingGuides,
            pendingTransport,
            revenueAgg,
            activeActivities
        ] = await Promise.all([
            // 1. Total Users සහ Role අනුව වෙන් වූ ගණන්
            User.countDocuments(),
            User.countDocuments({ role: 'Tourist' }),
            User.countDocuments({ role: 'Farmer' }),
            User.countDocuments({ role: 'TourGuide' }),
            User.countDocuments({ role: 'TransportProvider' }),

            // 2. Pending Verifications (පරණ ලොජික් එකමයි)
            Farm.countDocuments({ verificationStatus: 'Pending' }),
            TourGuide.countDocuments({ verificationStatus: 'Pending' }),
            TransportProvider.countDocuments({ verificationStatus: 'Pending' }),

            // 3. Revenue Calculation (පරණ ලොජික් එකමයි)
            Payment.aggregate([
                { $match: { status: 'Success' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // 4. Active Activities
            Activity.countDocuments({ status: 'Active' })
        ]);

        // Pending ගණන් එකතු කිරීම
        const pendingVerifications = pendingFarms + pendingGuides + pendingTransport;
        
        // Revenue එක extract කර ගැනීම
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                // අලුතෙන් එකතු කළ User Breakdown කොටස
                userBreakdown: {
                    tourist: touristCount,
                    farmer: farmerCount,
                    guide: guideCount,
                    transport: transportCount
                },
                pendingVerifications,
                totalRevenue,
                activeActivities
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getRevenueReports = async (req, res, next) => {
    try {
        const { range = 'month' } = req.query; 

        let groupByFormat = '%Y-%m-%d'; 
        if (range === 'year') groupByFormat = '%Y-%m'; 

        const reports = await Payment.aggregate([
            { $match: { status: 'Success' } },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: '$createdAt' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        next(error);
    }
};

export const getUserGrowth = async (req, res, next) => {
    try {
        const reports = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort('-createdAt');

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body; // 'Active', 'Suspended', 'Deleted'
        const user = await User.findById(req.params.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.accountStatus = status;
        await user.save();

        await logAudit(`Update User Status to ${status}`, req.user.id, user._id, 'User', {}, req.ip);

        res.status(200).json({ success: true, message: `User ${status}` });
    } catch (error) {
        next(error);
    }
};

export const getAuditLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.find()
            .populate('performedBy', 'fullName email role')
            .sort('-timestamp')
            .limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        next(error);
    }
};

export const getSystemLogs = async (req, res, next) => {
    try {
        const logs = await SystemLog.find()
            .sort('-timestamp')
            .limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        next(error);
    }
};

export const getActivityRevenueDistribution = async (req, res, next) => {
    try {
        const distribution = await Payment.aggregate([
            // 1. සාර්ථක ගෙවීම් පමණක් තෝරා ගැනීම
            { $match: { status: 'Success' } },
            // 2. Booking table එක සමඟ සම්බන්ධ කිරීම
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            { $unwind: '$booking' }, // Array එක object එකක් බවට පත් කිරීම
            // 3. Activity table එක සමඟ සම්බන්ධ කිරීම
            {
                $lookup: {
                    from: 'activities',
                    localField: 'booking.activityId',
                    foreignField: '_id',
                    as: 'activity'
                }
            },
            { $unwind: '$activity' },
            // 4. Category table එක සමඟ සම්බන්ධ කිරීම (Category නම ලබා ගැනීමට)
            {
                $lookup: {
                    from: 'activitycategories',
                    localField: 'activity.categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            // 5. Category නම අනුව ගොනු කර මුදල එකතු කිරීම
            {
                $group: {
                    _id: '$category.categoryName',
                    value: { $sum: '$amount' } // Recharts වලට අවශ්‍ය විදියට 'value' ලෙස නම් කළා
                }
            },
            // 6. Output එක ලස්සනට format කිරීම
            {
                $project: {
                    name: '$_id', // Recharts වලට අවශ්‍ය විදියට 'name' ලෙස නම් කළා
                    value: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({ success: true, data: distribution });
    } catch (error) {
        next(error);
    }
};

// ... (වෙනත් imports සහ functions)

export const getBookingStats = async (req, res, next) => {
    try {
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status', // Status අනුව ගොනු කරන්න (Pending, Confirmed, Completed, Cancelled...)
                    count: { $sum: 1 } // එම status එකේ ඇති ප්‍රමාණය ගණනය කරන්න
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

export const getProviderLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await Activity.aggregate([
            // 1. Farm ID එක අනුව Activities ගොනු කිරීම
            {
                $group: {
                    _id: '$farmId',
                    avgRating: { $avg: '$averageRating' },
                    totalBookings: { $sum: '$totalBookings' },
                    totalActivities: { $sum: 1 }
                }
            },
            // 2. Rating සහ Bookings අනුව Sort කිරීම (වැඩිම එක උඩට)
            { 
                $sort: { 
                    avgRating: -1, 
                    totalBookings: -1 
                } 
            },
            // 3. Top 5 දෙනා පමණක් ගැනීම
            { $limit: 5 },
            // 4. Farm විස්තර ලබා ගැනීම
            {
                $lookup: {
                    from: 'farms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'farm'
                }
            },
            { $unwind: '$farm' },
            // 5. User විස්තර (නම) ලබා ගැනීම
            {
                $lookup: {
                    from: 'users',
                    localField: 'farm.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            // 6. අවසාන Output එක සැකසීම
            {
                $project: {
                    _id: 1,
                    farmName: '$farm.farmName',
                    providerName: '$user.fullName',
                    avgRating: { $round: ['$avgRating', 1] }, // දශම ස්ථාන 1කට
                    totalBookings: 1,
                    totalActivities: 1,
                    image: '$user.profilePicture' // (Optional if available)
                }
            }
        ]);

        res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        next(error);
    }
};

export const getGeographicStats = async (req, res, next) => {
    try {
        const stats = await Farm.aggregate([
            // 1. දිස්ත්‍රික්කය තිබෙන Farms පමණක් ගන්න (Validation)
            { $match: { 'location.district': { $exists: true, $ne: null } } },
            // 2. දිස්ත්‍රික්කය අනුව ගොනු කරන්න
            {
                $group: {
                    _id: '$location.district',
                    count: { $sum: 1 } // Farm ගණන
                }
            },
            // 3. වැඩිම Farms ඇති දිස්ත්‍රික්ක උඩට ගන්න
            { $sort: { count: -1 } },
            // 4. මුල් 10 පමණක් ගන්න (ප්‍රස්ථාරය ලස්සනට තියාගන්න)
            { $limit: 10 },
            // 5. Output එක Format කරන්න
            {
                $project: {
                    district: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

// ... (imports)

export const getFinancialStats = async (req, res, next) => {
    try {
        // 1. මුළු ආදායම ගණනය කිරීම (සාර්ථක ගෙවීම් පමණි)
        const revenueStats = await Payment.aggregate([
            { $match: { status: 'Success' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);

        const totalRevenue = revenueStats[0]?.totalRevenue || 0;

        // 2. ගෙවිය යුතු මුදල් (Pending Payouts) සහ වියදම් ගණනය කිරීම
        const payoutStats = await Booking.aggregate([
            { 
                $match: { 
                    status: { $in: ['Confirmed', 'Completed'] } // අවලංගු නොවුණු bookings පමණයි
                } 
            },
            {
                $group: {
                    _id: null,
                    // ගෙවීමට ඇති මුදල් (Pending)
                    pendingFarmer: { 
                        $sum: { 
                            $cond: [{ $eq: ['$farmerPayoutStatus', 'Pending'] }, '$pricing.activityCost', 0] 
                        } 
                    },
                    pendingGuide: { 
                        $sum: { 
                            $cond: [{ $eq: ['$guidePayoutStatus', 'Pending'] }, '$pricing.guideCost', 0] 
                        } 
                    },
                    pendingTransport: { 
                        $sum: { 
                            $cond: [{ $eq: ['$transportPayoutStatus', 'Pending'] }, '$pricing.transportCost', 0] 
                        } 
                    },
                    // සියලුම සේවා සපයන්නන්ගේ වියදම් (Total Provider Costs) - ලාභය සෙවීමට
                    totalProviderCosts: {
                        $sum: { $add: ['$pricing.activityCost', '$pricing.guideCost', '$pricing.transportCost'] }
                    }
                }
            }
        ]);

        const stats = payoutStats[0] || { pendingFarmer: 0, pendingGuide: 0, pendingTransport: 0, totalProviderCosts: 0 };
        
        const totalPending = stats.pendingFarmer + stats.pendingGuide + stats.pendingTransport;
        
        // දළ ලාභය = මුළු ආදායම - සේවා සපයන්නන්ගේ මුළු වියදම
        // (සටහන: මෙය සරල ගණනය කිරීමකි, වට්ටම් හෝ වෙනත් ගාස්තු තිබේ නම් වෙනස් විය හැක)
        const platformProfit = totalRevenue - stats.totalProviderCosts;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalPending,
                netProfit: platformProfit,
                breakdown: {
                    farmer: stats.pendingFarmer,
                    guide: stats.pendingGuide,
                    transport: stats.pendingTransport
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// ... (imports)

export const getRevenueForecast = async (req, res, next) => {
    try {
        // 1. පසුගිය මාස 6 ක දත්ත ලබා ගැනීම
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = await Payment.aggregate([
            {
                $match: {
                    status: 'Success',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // දත්ත සකස් කිරීම (Format Data)
        const formattedData = monthlyData.map((item, index) => ({
            index: index + 1, // x-axis calculation සඳහා
            name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            revenue: item.revenue
        }));

        // 2. Linear Regression (Simple Trend Line) ගණනය කිරීම
        // y = mx + c (m = slope, c = intercept)
        const n = formattedData.length;
        if (n < 2) {
            return res.status(200).json({ success: true, data: [] });
        }

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        formattedData.forEach(point => {
            sumX += point.index;
            sumY += point.revenue;
            sumXY += point.index * point.revenue;
            sumXX += point.index * point.index;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // 3. ඉදිරි මාස 3 පුරෝකථනය කිරීම
        const forecastData = [];
        const lastMonth = new Date();
        
        // දැනට තියෙන දත්ත ටික මුලින්ම add කරනවා (Actual Data)
        formattedData.forEach(item => {
            forecastData.push({
                name: item.name,
                actualRevenue: item.revenue,
                forecastRevenue: null // මේවාට forecast line එක අඳින්නේ නෑ
            });
        });

        // අනාගත දත්ත add කරනවා (Predicted Data)
        for (let i = 1; i <= 3; i++) {
            const nextIndex = n + i;
            const predictedRevenue = slope * nextIndex + intercept;
            
            // ඊළඟ මාසයේ නම හැදීම
            const nextDate = new Date();
            nextDate.setMonth(lastMonth.getMonth() + i);
            const monthName = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

            forecastData.push({
                name: monthName,
                actualRevenue: null, // මේවාට actual bar එක අඳින්නේ නෑ
                forecastRevenue: Math.max(0, Math.round(predictedRevenue)) // සෘණ අගයන් එන්න බෑ
            });
        }

        res.status(200).json({ success: true, data: forecastData });

    } catch (error) {
        next(error);
    }
};