import Payout from '../models/Payout.js';
import Booking from '../models/Booking.js';
import Farm from '../models/Farm.js';
import TourGuide from '../models/TourGuide.js';
import TransportProvider from '../models/TransportProvider.js';


export const getEarnings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        console.log(`[Earnings Debug] Calculating for User: ${userId} | Role: ${role}`);

        let totalEarned = 0;
        let pendingPayout = 0;
        let bookingsQuery = { status: 'Completed' }; // We only count COMPLETED bookings
        let commissionRate = 0;
        let amountField = '';

        // 1. Role එක අනුව Provider ID එක සහ Commission එක තෝරාගැනීම
        if (role === 'Farmer') {
            const farm = await Farm.findOne({ userId });
            if (!farm) {
                console.log('[Earnings Debug] Farm profile not found');
                return res.status(200).json({ success: true, data: { totalEarned: 0, pendingPayout: 0, history: [] } });
            }
            bookingsQuery.farmId = farm._id;
            commissionRate = 0.85; // 85% for Farmer
            amountField = 'activityCost';

        } else if (role === 'TourGuide') {
            const guide = await TourGuide.findOne({ userId });
            if (!guide) {
                return res.status(200).json({ success: true, data: { totalEarned: 0, pendingPayout: 0, history: [] } });
            }
            bookingsQuery.guideId = guide._id;
            commissionRate = 0.90; // 90% for Guide
            amountField = 'guideCost';

        } else if (role === 'TransportProvider') {
            const transport = await TransportProvider.findOne({ userId });
            if (!transport) {
                return res.status(200).json({ success: true, data: { totalEarned: 0, pendingPayout: 0, history: [] } });
            }
            bookingsQuery.transportProviderId = transport._id;
            commissionRate = 0.90; // 90% for Transport
            amountField = 'transportCost';
        }

        // 2. Database එකෙන් Completed Bookings ටික ගන්න
        const completedBookings = await Booking.find(bookingsQuery);
        console.log(`[Earnings Debug] Found ${completedBookings.length} completed bookings`);

        // 3. මුළු ආදායම ගණනය කිරීම (Live Loop)
        totalEarned = completedBookings.reduce((sum, booking) => {
            // අදාළ Provider ට අදාළ ගාන (pricing object එකෙන්) ගන්න
            const rawAmount = booking.pricing ? booking.pricing[amountField] : 0;

            // Commission එක අඩු කරලා එකතු කරන්න
            return sum + (rawAmount * commissionRate);
        }, 0);

        console.log(`[Earnings Debug] Calculated Total Earned: ${totalEarned}`);

        // 4. දැනටමත් ගෙවා ඇති මුදල් (Payout History) අඩු කිරීම
        const payoutHistory = await Payout.find({ userId }).sort('-createdAt');

        const alreadyPaid = payoutHistory
            .filter(p => ['Completed', 'Processing'].includes(p.status))
            .reduce((sum, p) => sum + p.amount, 0);

        // Pending Payout = (මුළු ඉපැයීම) - (දැනටමත් බැංකුවට දැමූ ගණන්)
        pendingPayout = totalEarned - alreadyPaid;
        if (pendingPayout < 0) pendingPayout = 0;

        res.status(200).json({
            success: true,
            data: {
                totalEarned: Math.round(totalEarned),
                pendingPayout: Math.round(pendingPayout),
                history: payoutHistory
            }
        });

    } catch (error) {
        console.error("[Earnings Debug] Error:", error);
        next(error);
    }
};


// --- Admin Functions (එලෙසම තියන්න) ---
export const getAllPayouts = async (req, res, next) => {
    try {
        const payouts = await Payout.find({})
            .populate('userId', 'fullName role email')
            .sort('-createdAt');
        res.status(200).json({ success: true, data: payouts });
    } catch (error) {
        next(error);
    }
};

export const generateWeeklyPayouts = async (req, res, next) => {
    try {
        console.log("Starting Payout Generation...");
        let processedCount = 0;

        // Helper function to process each provider type
        const processProviderBatch = async (role, commissionRate, statusField, query) => {
            const bookings = await Booking.find(query).populate('farmId guideId transportProviderId');
            
            if (bookings.length === 0) return;

            const providerMap = {};

            bookings.forEach(booking => {
                let providerId, userId;
                
                if (role === 'Farmer' && booking.farmId) {
                    providerId = booking.farmId._id.toString();
                    userId = booking.farmId.userId;
                } else if (role === 'TourGuide' && booking.guideId) {
                    providerId = booking.guideId._id.toString();
                    userId = booking.guideId.userId;
                } else if (role === 'TransportProvider' && booking.transportProviderId) {
                    providerId = booking.transportProviderId._id.toString();
                    userId = booking.transportProviderId.userId;
                }

                if (!providerId) return;

                if (!providerMap[providerId]) {
                    providerMap[providerId] = { userId, bookings: [], totalAmount: 0 };
                }

                let cost = 0;
                if (role === 'Farmer') cost = booking.pricing.activityCost || 0;
                else if (role === 'TourGuide') cost = booking.pricing.guideCost || 0;
                else if (role === 'TransportProvider') cost = booking.pricing.transportCost || 0;

                const payoutAmount = cost * commissionRate;
                providerMap[providerId].bookings.push(booking._id);
                providerMap[providerId].totalAmount += payoutAmount;
            });

            // 2. Loop through Providers
            for (const [pId, data] of Object.entries(providerMap)) {
                if (data.totalAmount > 0) {
                    
                    // Check for Existing Pending Payout
                    let payout = await Payout.findOne({ 
                        userId: data.userId, 
                        status: 'Pending',
                        userRole: role 
                    });

                    if (payout) {
                        // Update Existing
                        payout.amount += data.totalAmount;
                        
                        // Merge Booking IDs (No Duplicates)
                        const uniqueBookings = new Set([
                            ...payout.bookingIds.map(id => id.toString()),
                            ...data.bookings.map(id => id.toString())
                        ]);
                        payout.bookingIds = Array.from(uniqueBookings);

                        // Recalculate Breakdown
                        payout.breakdown.netAmount = payout.amount;
                        payout.breakdown.totalEarnings = Math.round(payout.amount / commissionRate);
                        payout.breakdown.platformCommission = payout.breakdown.totalEarnings - payout.amount;
                        
                        await payout.save();
                    } else {
                        // Create New
                        await Payout.create({
                            userId: data.userId,
                            userRole: role,
                            amount: Math.round(data.totalAmount),
                            bookingIds: data.bookings,
                            status: 'Pending',
                            breakdown: {
                                totalEarnings: Math.round(data.totalAmount / commissionRate),
                                platformCommission: Math.round((data.totalAmount / commissionRate) * (1 - commissionRate)),
                                netAmount: Math.round(data.totalAmount)
                            }
                        });
                    }

                    const updateQuery = { $set: {} };
                    updateQuery.$set[statusField] = 'Processing';
                    
                    await Booking.updateMany(
                        { _id: { $in: data.bookings } },
                        updateQuery
                    );
                    
                    processedCount++;
                }
            }
        };

        // --- Execute for each role ---

        // 1. Farmers (85%)
        const farmBookings = await Booking.find({
            status: 'Completed',
            farmerPayoutStatus: 'Pending'
        }).populate('farmId');
        await processProviderBatch(farmBookings, 'Farmer', 0.85, 'farmerPayoutStatus');

        // 2. Tour Guides (90%)
        const guideBookings = await Booking.find({
            status: 'Completed',
            guidePayoutStatus: 'Pending',
            guideId: { $ne: null }
        }).populate('guideId');
        await processProviderBatch(guideBookings, 'TourGuide', 0.90, 'guidePayoutStatus');

        // 3. Transport (90%)
        const transportBookings = await Booking.find({
            status: 'Completed',
            transportPayoutStatus: 'Pending',
            transportProviderId: { $ne: null }
        }).populate('transportProviderId');
        await processProviderBatch(transportBookings, 'TransportProvider', 0.90, 'transportPayoutStatus');

        res.status(200).json({
            success: true,
            message: `Payout generation complete. Processed batches: ${processedCount}`
        });

    } catch (error) {
        console.error("Payout Generation Error:", error);
        next(error);
    }
};

export const processPayout = async (req, res, next) => {
    try {
        console.log(`Processing Payout ID: ${req.params.payoutId}`);
        
        const payout = await Payout.findById(req.params.payoutId);
        if(!payout) return res.status(404).json({message: 'Payout not found'});
        
        // 1. Mark Payout as Completed
        payout.status = 'Completed';
        payout.processedAt = new Date();
        payout.transactionId = `tx_${Date.now()}`;
        await payout.save();
        console.log(`Payout ${payout._id} marked as Completed.`);
        
        // 2. Mark Bookings as Paid
        const bookingIds = payout.bookingIds;
        const role = payout.userRole;
        let updateField = null;

        if (role === 'Farmer') updateField = 'farmerPayoutStatus';
        else if (role === 'TourGuide') updateField = 'guidePayoutStatus';
        else if (role === 'TransportProvider') updateField = 'transportPayoutStatus';

        if (updateField && bookingIds.length > 0) {
            console.log(`Updating ${bookingIds.length} bookings to 'Paid' for field: ${updateField}`);
            
            const updateQuery = { $set: {} };
            updateQuery.$set[updateField] = 'Paid';

            const result = await Booking.updateMany(
                { _id: { $in: bookingIds } },
                updateQuery
            );
            
            console.log(`Update Result: Modified ${result.modifiedCount} bookings.`);
        } else {
            console.log("No bookings to update or invalid role.");
        }
        
        res.status(200).json({ success: true, message: 'Payout processed successfully' });
    } catch (error) {
        console.error("Process Payout Error:", error);
        next(error);
    }
};