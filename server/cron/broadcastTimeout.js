import Booking from '../models/Booking.js';

export const checkBroadcastTimeouts = async () => {
    console.log('Checking for expired service requests...');
    const now = new Date();

    // Check Guides
    const expiredGuides = await Booking.find({
        guideStatus: 'Pending',
        guideBroadcastTimeoutAt: { $lt: now }
    });

    for (const booking of expiredGuides) {
        booking.guideStatus = 'Declined';
        // In a real app, create a Refund record for booking.pricing.guideCost here
        console.log(`Guide request expired for booking ${booking._id}`);
        await booking.save();
        // Send notification to Tourist "Guide unavailable, refund initiated"
    }

    // Check Transport
    const expiredTransport = await Booking.find({
        transportStatus: 'Pending',
        transportBroadcastTimeoutAt: { $lt: now }
    });

    for (const booking of expiredTransport) {
        booking.transportStatus = 'Declined';
        // Refund transport cost
        console.log(`Transport request expired for booking ${booking._id}`);
        await booking.save();
    }
};