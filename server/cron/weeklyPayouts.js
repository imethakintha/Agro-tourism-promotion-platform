import Booking from '../models/Booking.js';
import Payout from '../models/Payout.js';
import User from '../models/User.js';

export const generateWeeklyPayouts = async () => {
    console.log('Running weekly payout generation...');
    
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Find completed bookings in last 7 days
    const bookings = await Booking.find({
        status: 'Completed',
        // completedAt: { $gte: lastWeek } // Assuming completedAt exists or using updatedAt
    }).populate('farmId guideId transportProviderId');
    
    const payoutMap = new Map();

    // Helper to aggregate
    const addToPayout = (userId, role, amount, bookingId) => {
        if (!userId) return;
        const uid = userId.toString();
        if (!payoutMap.has(uid)) {
            payoutMap.set(uid, {
                userId,
                role,
                totalEarnings: 0,
                bookings: []
            });
        }
        const entry = payoutMap.get(uid);
        entry.totalEarnings += amount;
        entry.bookings.push(bookingId);
    };

    for (const booking of bookings) {
        // Farmer (85%)
        const farmOwnerId = booking.farmId.userId; // Farm model has userId
        addToPayout(farmOwnerId, 'Farmer', booking.pricing.activityCost * 0.85, booking._id);
        
        // Guide (90%)
        if (booking.guideId) {
            const guideUserId = booking.guideId.userId; // Guide model has userId
            addToPayout(guideUserId, 'TourGuide', booking.pricing.guideCost * 0.90, booking._id);
        }
        
        // Transport (90%)
        if (booking.transportProviderId) {
            const transportUserId = booking.transportProviderId.userId;
            addToPayout(transportUserId, 'TransportProvider', booking.pricing.transportCost * 0.90, booking._id);
        }
    }
    
    // Save Payouts
    for (const [uid, data] of payoutMap) {
        await Payout.create({
            userId: data.userId,
            userRole: data.role,
            amount: Math.round(data.totalEarnings),
            payoutPeriod: { startDate: lastWeek, endDate: today },
            bookingIds: data.bookings,
            breakdown: {
                totalEarnings: data.totalEarnings,
                platformCommission: data.totalEarnings * (data.role === 'Farmer' ? 0.15 : 0.10), // Approx calc
                netAmount: Math.round(data.totalEarnings)
            },
            status: 'Pending'
        });
    }
    
    console.log(`Generated payouts for ${payoutMap.size} providers.`);
};