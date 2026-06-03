import TourGuide from '../models/TourGuide.js';
import TransportProvider from '../models/TransportProvider.js';
import Notification from '../models/Notification.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const GUIDE_SEARCH_RADIUS_KM = 15;
const TRANSPORT_SEARCH_RADIUS_KM = 10;
const BROADCAST_TIMEOUT_MS = 3 * 60 * 60 * 1000;

export const broadcastToGuides = async (booking, farm) => {
    const [lng, lat] = farm.location.coordinates;
    console.log(`Broadcasting to guides near: ${lng}, ${lat}`);

    const guides = await TourGuide.find({
        verificationStatus: 'Approved',
        isActive: true,
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: 50000
            }
        }
    }).populate('userId', 'email fullName');

    console.log(`Found ${guides.length} guides`);

    const validGuides = guides.filter(guide => guide.userId != null);

    if (guides.length > 0) {
        console.log('--- Guide Broadcast List ---');
        guides.forEach((guide, index) => {
            if (guide.userId) {
                console.log(`${index + 1}. Sending to Guide: ${guide.userId.fullName} | Email: ${guide.userId.email}`);
            } else {
                console.log(`${index + 1}. Guide found (ID: ${guide._id}) but User data missing.`);
            }
        });
        console.log('----------------------------');
    }

    if (validGuides.length === 0) {
        booking.guideStatus = 'Declined';
        return;
    }

    const notifications = validGuides.map(guide => ({
        userId: guide.userId._id,
        type: 'ServiceRequest',
        priority: 'High',
        title: 'New Guide Opportunity',
        message: `Tour requested at ${farm.farmName}. Fixed Price: LKR ${booking.pricing.guideCost}. Date: ${new Date(booking.activityDate).toLocaleDateString()}.`,
        relatedEntityId: booking._id,
        actionUrl: `/dashboard/guide`
    }));

    await Notification.insertMany(notifications);
    console.log(`Sent ${notifications.length} guide notifications`);

    booking.guideStatus = 'Pending';
    booking.guideBroadcastSentAt = new Date();
    booking.guideBroadcastTimeoutAt = new Date(Date.now() + BROADCAST_TIMEOUT_MS);
    await booking.save();
};

export const broadcastToTransport = async (booking) => {
    if (!booking.pickupLocation || !booking.pickupLocation.coordinates) return;

    const loc = booking.pickupLocation.coordinates;
    const lat = loc.lat || loc[1];
    const lng = loc.lng || loc[0];
    console.log(`Broadcasting to transport near: ${lng}, ${lat}`);

    const providers = await TransportProvider.find({
        verificationStatus: 'Approved',
        isActive: true,
        maxPassengers: { $gte: booking.numberOfParticipants },
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: 50000
            }
        }
    }).populate('userId', 'email fullName');

    console.log(`Found ${providers.length} transport providers`);

    const validProviders = providers.filter(p => p.userId != null);

    if (providers.length > 0) {
        console.log('--- Transport Broadcast List ---');
        providers.forEach((provider, index) => {
            if (provider.userId) {
                console.log(`${index + 1}. Sending to Driver: ${provider.userId.fullName} | Email: ${provider.userId.email}`);
            } else {
                console.log(`${index + 1}. Provider found (ID: ${provider._id}) but User data missing.`);
            }
        });
        console.log('--------------------------------');
    }

    if (validProviders.length === 0) {
        booking.transportStatus = 'Declined';
        return;
    }

    const notifications = validProviders.map(p => {
        const isExpedition = booking.notes === 'AI Expedition Booking';
        const title = isExpedition ? 'New Multi-Day Expedition Request' : 'New Trip Request';
        const msg = isExpedition
            ? `Multi-Day Expedition starting from ${booking.pickupLocation.address}. Total Trip Value: LKR ${booking.pricing.transportCost}.`
            : `Trip from ${booking.pickupLocation.address}. Fixed Price: LKR ${booking.pricing.transportCost}.`;

        return {
            userId: p.userId._id,
            type: 'ServiceRequest',
            priority: 'High',
            title: title,
            message: msg,
            relatedEntityId: booking._id,
            actionUrl: `/dashboard/transport`
        };
    });

    await Notification.insertMany(notifications);

    booking.transportStatus = 'Pending';
    booking.transportBroadcastSentAt = new Date();
    booking.transportBroadcastTimeoutAt = new Date(Date.now() + BROADCAST_TIMEOUT_MS);
    await booking.save();
};

