import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Refund from '../models/Refund.js';
import { createStripePaymentIntent, processStripeRefund } from '../services/stripeService.js';
import { broadcastToGuides, broadcastToTransport } from '../services/broadcastService.js';

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, bookingIds } = req.body;
    let totalAmount = 0;
    let mainBookingId = bookingId;
    let allBookingIds = [];

    // Handle Multiple Bookings (Expedition)
    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      const bookings = await Booking.find({ _id: { $in: bookingIds } });
      if (bookings.length === 0) return res.status(404).json({ message: 'Bookings not found' });

      totalAmount = bookings.reduce((sum, b) => sum + b.pricing.totalCost, 0);
      mainBookingId = bookings[0]._id;
      allBookingIds = bookingIds;
    } else {
      // Handle Single Booking
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      if (booking.status !== 'Pending') return res.status(400).json({ message: 'Booking is not in Pending state' });

      totalAmount = booking.pricing.totalCost;
      mainBookingId = booking._id;
      allBookingIds = [bookingId];
    }

    // Create Intent
    const paymentIntent = await createStripePaymentIntent(
      totalAmount,
      'lkr',
      {
        bookingId: mainBookingId.toString(),
        userId: req.user.id,
        allBookingIds: JSON.stringify(allBookingIds)
      }
    );

    // Create pending Payment record
    await Payment.create({
      bookingId: mainBookingId,
      userId: req.user.id,
      amount: totalAmount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'Pending',
      metadata: { allBookingIds }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
};


export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    payment.status = 'Success';
    await payment.save();

    // Confirm ALL linked bookings
    let bookingIdsToConfirm = [payment.bookingId];
    if (payment.metadata && payment.metadata.allBookingIds) {
      bookingIdsToConfirm = payment.metadata.allBookingIds;
    }

    const bookings = await Booking.find({ _id: { $in: bookingIdsToConfirm } }).populate('farmId');

    // Create Route Summary for Expedition
    if (bookings.length > 1) {
      // This is an expedition. We want to show all farms in the "Destination" field.
      const farmNames = [...new Set(bookings.map(b => b.farmId.farmName))].join(' ➔ '); // "Farm A ➔ Farm B"
      const finalBooking = bookings[bookings.length - 1];

      // Find the Master Booking (the one holding the transport request)
      // Usually it's the first one, or one with transportStatus 'Pending'.
      const masterBooking = bookings.find(b => b.transportStatus === 'Pending' || b.pricing.transportCost > 0);

      if (masterBooking) {
        masterBooking.dropoffLocation = {
          address: `Route: ${farmNames}`,
          coordinates: finalBooking.farmId.location.coordinates // Set coords to final destination
        };
        await masterBooking.save(); // Save the summary so frontend can fetch it
      }
    }

    await Booking.updateMany(
      { _id: { $in: bookingIdsToConfirm } },
      { status: 'Confirmed' }
    );

    let guideBroadcastSent = false;
    let transportBroadcastSent = false;

    // Trigger Broadcasts
    for (const booking of bookings) {
      try {
        // If guide was requested (Pending or explicitly set cost > 0)
        if ((booking.pricing.guideCost > 0 || booking.guideStatus === 'Pending') && !guideBroadcastSent) {
          if (booking.farmId) {
            await broadcastToGuides(booking, booking.farmId);
            guideBroadcastSent = true;
          } else {
            console.warn(`Booking ${booking._id} has needGuide but no farmId populated.`);
          }
        }

        // If transport was requested
        if ((booking.pricing.transportCost > 0 || booking.transportStatus === 'Pending') && !transportBroadcastSent) {
          await broadcastToTransport(booking);
          transportBroadcastSent = true;
        }
      } catch (broadcastError) {
        console.error(`Broadcast failed for booking ${booking._id}:`, broadcastError);
        // Do not fail the whole response if broadcast fails, just log it.
      }
    }

    res.status(200).json({ success: true, message: 'Payment confirmed' });
  } catch (error) {
    next(error);
  }
};


export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate({
        path: 'bookingId',
        populate: { path: 'activityId', select: 'customTitle' }
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};