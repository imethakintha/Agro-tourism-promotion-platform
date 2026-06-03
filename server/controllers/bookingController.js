import Booking from '../models/Booking.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import TourGuide from '../models/TourGuide.js';
import TransportProvider from '../models/TransportProvider.js';
import Promotion from '../models/Promotion.js';
import { calculateDistance, geocodeAddress } from '../services/googleMapsService.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import { processStripeRefund } from '../services/stripeService.js';

export const checkAvailability = async (req, res, next) => {
  try {
    const { activityId, date, participants } = req.body;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Find calendar entry for the date
    const requestDate = new Date(date).toDateString();
    const calendarEntry = activity.availabilityCalendar.find(
      entry => new Date(entry.date).toDateString() === requestDate
    );

    if (!calendarEntry) {
      return res.status(200).json({ success: true, available: false, message: 'No slots available for this date' });
    }

    // Filter slots with enough capacity
    const availableSlots = calendarEntry.timeSlots.filter(slot =>
      slot.status === 'Available' && slot.availableSlots >= participants
    );

    res.status(200).json({
      success: true,
      available: availableSlots.length > 0,
      slots: availableSlots
    });
  } catch (error) {
    next(error);
  }
};


export const createBooking = async (req, res, next) => {
  try {
    const {
      activityId,
      activityDate,
      timeSlot,
      numberOfParticipants,
      contactName,
      contactPhone,
      participantDetails,
      needsGuide,
      needsTransport,
      pickupAddress,
      pickupCoordinates,
      promoCode
    } = req.body;

    const activity = await Activity.findById(activityId).populate('farmId');
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const dateStr = new Date(activityDate).toDateString();

    const calendarIndex = activity.availabilityCalendar.findIndex(
      c => new Date(c.date).toDateString() === dateStr
    );

    if (calendarIndex === -1) {
      return res.status(400).json({ success: false, message: 'Date not available' });
    }

    const slotIndex = activity.availabilityCalendar[calendarIndex].timeSlots.findIndex(
      s => s.startTime === timeSlot.startTime && s.endTime === timeSlot.endTime
    );

    if (slotIndex === -1) {
      return res.status(400).json({ success: false, message: 'Time slot not found' });
    }

    const slot = activity.availabilityCalendar[calendarIndex].timeSlots[slotIndex];


    const existingBookings = await Booking.find({
      activityId: activityId,
      activityDate: new Date(activityDate), 
      'activityTime.startTime': timeSlot.startTime,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    const totalUsed = existingBookings.reduce((sum, booking) => sum + booking.numberOfParticipants, 0);
    const maxParticipants = activity.maxParticipants || 20; // Default fallback

    if (totalUsed + numberOfParticipants > maxParticipants) {
      // Sync the availableSlots just in case it was off
      slot.availableSlots = Math.max(0, maxParticipants - totalUsed);
      if (slot.availableSlots === 0) slot.status = 'Full';
      await activity.save();

      return res.status(400).json({
        success: false,
        message: `Not enough spots available. Only ${maxParticipants - totalUsed} spots left.`
      });
    }

    slot.availableSlots = Math.max(0, maxParticipants - (totalUsed + numberOfParticipants));
    slot.bookedSlots = totalUsed + numberOfParticipants;
    if (slot.availableSlots === 0) slot.status = 'Full';

    await activity.save();

    const activityCost = activity.pricePerPerson * numberOfParticipants;
    let guideCost = 0;
    let transportCost = 0;

    if (needsGuide) {
      const guides = await TourGuide.find({ verificationStatus: 'Approved' });
      if (guides.length > 0) {
        const totalRate = guides.reduce((sum, g) => sum + g.pricing.rate, 0);
        const avgRate = totalRate / guides.length;
        guideCost = Math.ceil(avgRate);
      } else {
        guideCost = 3000;
      }
    }


    let pickupLocationData = null;

    if (needsTransport && (pickupAddress || pickupCoordinates)) {
      let pickupCoords = null;

      if (pickupCoordinates) {
        pickupCoords = pickupCoordinates;
        pickupLocationData = {
          address: pickupAddress,
          coordinates: pickupCoords
        };
      }

      else if (pickupAddress) {
        pickupCoords = await geocodeAddress(pickupAddress);
        if (pickupCoords) {
          pickupLocationData = {
            address: pickupAddress,
            coordinates: pickupCoords
          };
        } else {
          console.warn("Could not geocode pickup address, Transport cost set to 0");
        }
      }

      if (pickupCoords) {
        const farmLoc = activity.farmId.location.coordinates;

        const farmCoordsObj = Array.isArray(farmLoc)
          ? { lat: farmLoc[1], lng: farmLoc[0] }
          : farmLoc;

        const distanceKm = await calculateDistance(pickupCoords, farmCoordsObj);

        // Get Average Rates
        const drivers = await TransportProvider.find({ verificationStatus: 'Approved' });
        let avgPricePerKm = 100;
        let avgBasePrice = 500;

        if (drivers.length > 0) {
          const totalPerKm = drivers.reduce((sum, d) => sum + d.pricePerKm, 0);
          const totalBase = drivers.reduce((sum, d) => sum + d.basePrice, 0);
          avgPricePerKm = totalPerKm / drivers.length;
          avgBasePrice = totalBase / drivers.length;
        }
        const dist = distanceKm || 0;
        transportCost = Math.ceil((avgBasePrice + (avgPricePerKm * dist)) * 2);

        if (isNaN(transportCost)) transportCost = 0;
      }
    }

    let totalCost = activityCost + guideCost + transportCost;
    let discountAmount = 0;
    let promotionId = null;

    if (promoCode) {
      const promo = await Promotion.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() }
      });

      if (promo) {

        if (promo.usageLimit === null || promo.usedCount < promo.usageLimit) {
          if (totalCost >= promo.minPurchaseAmount) {
            if (promo.type === 'Percentage') {
              discountAmount = (totalCost * promo.value) / 100;
            } else {
              discountAmount = promo.value;
            }

            if (discountAmount > totalCost) discountAmount = totalCost;

            totalCost -= discountAmount;
            promotionId = promo._id;

            // Increment usage
            promo.usedCount += 1;
            await promo.save();
          }
        }
      }
    }

    const booking = await Booking.create({
      touristId: req.user.id,
      activityId,
      farmId: activity.farmId._id,
      activityDate,
      activityTime: timeSlot,
      numberOfParticipants,
      participantDetails,
      contactName,
      contactPhone,

      // Service Request Flags
      guideStatus: needsGuide ? 'NotRequested' : 'NotRequested',
      transportStatus: needsTransport ? 'NotRequested' : 'NotRequested',
      pickupLocation: pickupLocationData,

      pricing: {
        activityCost,
        guideCost,
        transportCost,
        discountAmount,
        promotionId,
        totalCost: Math.round(totalCost)
      },
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'Farmer') {
      const farm = await import('../models/Farm.js').then(m => m.default.findOne({ userId: req.user.id }));
      if (!farm) return res.status(200).json({ success: true, data: [] });
      query = { farmId: farm._id };
    } else if (req.user.role === 'Tourist') {
      query = { touristId: req.user.id };
    } else if (req.user.role === 'TourGuide') {
      const guide = await TourGuide.findOne({ userId: req.user.id });
      if (!guide) return res.status(200).json({ success: true, data: [] });
      query = { guideId: guide._id };
    } else if (req.user.role === 'TransportProvider') {
      const transport = await TransportProvider.findOne({ userId: req.user.id });
      if (!transport) return res.status(200).json({ success: true, data: [] });
      query = { transportProviderId: transport._id };
    }

    const bookings = await Booking.find(query)
      .populate('activityId', 'customTitle images pricePerPerson')
      .populate('touristId', 'fullName email')
      .populate('farmId', 'farmName location')
      .populate('guideId', 'userId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('activityId')
      .populate('farmId')
      .populate('touristId', 'fullName email phoneNumber');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};


export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.touristId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['Cancelled', 'Completed', 'Declined', 'Refunded'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel booking in ${booking.status} state` });
    }

    const activityDate = new Date(booking.activityDate);

    const now = new Date();
    const timeDifference = activityDate.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    if (hoursDifference < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation failed. You must cancel at least 24 hours before the activity date.'
      });
    }


    const activity = await Activity.findById(booking.activityId);
    if (activity) {
      const dateStr = new Date(booking.activityDate).toDateString();
      const calendarIndex = activity.availabilityCalendar.findIndex(c => new Date(c.date).toDateString() === dateStr);

      if (calendarIndex > -1) {
        const slotIndex = activity.availabilityCalendar[calendarIndex].timeSlots.findIndex(
          s => s.startTime === booking.activityTime.startTime
        );
        if (slotIndex > -1) {
          const slot = activity.availabilityCalendar[calendarIndex].timeSlots[slotIndex];
          slot.availableSlots += booking.numberOfParticipants;
          slot.bookedSlots -= booking.numberOfParticipants;
          if (slot.status === 'Full' && slot.availableSlots > 0) slot.status = 'Available';
          await activity.save();
        }
      }
    }

    let refundStatus = 'NotApplicable';

    const payment = await Payment.findOne({ bookingId: booking._id, status: 'Success' });

    if (payment && booking.pricing.totalCost > 0) {

      if (payment.stripePaymentIntentId) {
        try {
          console.log(`Processing refund for Payment ID: ${payment._id}`);

          const refund = await processStripeRefund(payment.stripePaymentIntentId, booking.pricing.totalCost);

          await Refund.create({
            paymentId: payment._id,
            bookingId: booking._id,
            amount: booking.pricing.totalCost,
            reason: 'CustomerRequest',
            status: 'Processed',
            refundTransactionId: refund.id
          });

          refundStatus = 'Refunded';

          payment.status = 'Refunded';
          await payment.save();

          console.log("Refund Successful");

        } catch (err) {
          console.error("Refund Failed:", err);
          refundStatus = 'RefundFailed';
        }
      }
    } else {
      console.log("No successful payment found to refund.");
    }

    booking.status = refundStatus === 'Refunded' ? 'Refunded' : 'Cancelled';
    booking.cancellation = {
      cancelledBy: req.user.id,
      reason,
      cancelledAt: Date.now()
    };

    if (booking.guideStatus === 'Pending' || booking.guideStatus === 'Confirmed') booking.guideStatus = 'Declined';
    if (booking.transportStatus === 'Pending' || booking.transportStatus === 'Confirmed') booking.transportStatus = 'Declined';

    await booking.save();

    res.status(200).json({
      success: true,
      message: refundStatus === 'Refunded' ? 'Booking cancelled and amount refunded.' : 'Booking cancelled.',
      data: booking
    });

  } catch (error) {
    next(error);
  }
};

export const getTransportEstimate = async (req, res, next) => {
  try {
    const { activityId, pickupAddress } = req.body;

    if (!pickupAddress) {
      return res.status(200).json({ success: true, estimatedCost: 0, distance: 0 });
    }


    const activity = await Activity.findById(activityId).populate('farmId');
    if (!activity) return res.status(404).json({ message: 'Activity not found' });


    const pickupCoords = await geocodeAddress(pickupAddress);
    if (!pickupCoords) {
      return res.status(400).json({ success: false, message: 'Invalid address' });
    }

    const farmLoc = activity.farmId.location.coordinates;
    const farmCoordsObj = Array.isArray(farmLoc) ? { lat: farmLoc[1], lng: farmLoc[0] } : farmLoc;

    const distanceKm = await calculateDistance(pickupCoords, farmCoordsObj);

    const drivers = await TransportProvider.find({ verificationStatus: 'Approved' });

    let avgPricePerKm = 100;
    let avgBasePrice = 500;  

    if (drivers.length > 0) {
      const totalPerKm = drivers.reduce((sum, d) => sum + d.pricePerKm, 0);
      const totalBase = drivers.reduce((sum, d) => sum + d.basePrice, 0);
      avgPricePerKm = totalPerKm / drivers.length;
      avgBasePrice = totalBase / drivers.length;
    }

    // Round Trip Calculation
    const estimatedCost = Math.ceil((avgBasePrice + (avgPricePerKm * distanceKm)) * 2);

    res.status(200).json({
      success: true,
      estimatedCost,
      distance: distanceKm
    });

  } catch (error) {
    next(error);
  }
};

export const createExpeditionBooking = async (req, res, next) => {
  try {
    const { itinerary, totalPrice, contactName, contactPhone, participantCount, needTransport, needGuide, pickupLocation, guideCost, transportCost } = req.body;

    console.log('createExpeditionBooking Body Keys:', Object.keys(req.body));
    console.log('Costs Received:', { guideCost, transportCost });

    const userId = req.user.id;
    const bookings = [];
    const count = participantCount || 1;


    let isFirstBooking = true;

    for (const item of itinerary) {
      for (const act of item.activities) {

        let activityId = act.activityId;
        let farmId = act.farmId;

        if (!activityId) {
          const found = await Activity.findOne({ customTitle: act.title });
          if (found) {
            activityId = found._id;
            farmId = found.farmId;
          }
        }

        if (activityId) {

          let currentGuideStatus = 'NotRequested';
          let currentTransportStatus = 'NotRequested';
          let currentGuideCost = 0;
          let currentTransportCost = 0;
          let currentPickup = null;


          if (isFirstBooking) {
            if (needGuide) {
              currentGuideCost = guideCost || 0; 
            }
            if (needTransport) {
              currentTransportCost = transportCost || 0; 
            }
            isFirstBooking = false; // Only for the first one
          }

          if (needGuide) currentGuideStatus = 'Pending';
          if (needTransport) {
            currentTransportStatus = 'Pending';
            if (pickupLocation && pickupLocation.coords && pickupLocation.coords.length === 2) {
              currentPickup = {
                address: pickupLocation.address,
                coordinates: {
                  lng: pickupLocation.coords[0],
                  lat: pickupLocation.coords[1]
                }
              };
            } else {
              console.warn("Invalid pickup location received (skipping location save):", pickupLocation);
            }
          }

          try {
            const booking = await Booking.create({
              touristId: userId,
              activityId: activityId,
              farmId: farmId,
              activityDate: item.date,
              activityTime: { startTime: '09:00', endTime: '12:00' }, // Default window for AI plan
              numberOfParticipants: count,
              pricing: {
                activityCost: Number(act.price) || 0,
                guideCost: Number(currentGuideCost) || 0,
                transportCost: Number(currentTransportCost) || 0,
                discountAmount: 0,
                totalCost: (Number(act.price) || 0) + (Number(currentGuideCost) || 0) + (Number(currentTransportCost) || 0)
              },

              // Service Flags
              guideStatus: currentGuideStatus,
              transportStatus: currentTransportStatus,
              pickupLocation: currentPickup,

              status: 'Pending',
              notes: 'AI Expedition Booking',
              contactName: contactName || 'Tourist test',
              contactPhone: contactPhone || '0771243212'
            });
            bookings.push(booking);
          } catch (createError) {
            console.error(`Failed to create booking for activity ${act.title}:`, createError);
            throw createError; // Re-throw to trigger main error handler
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully booked ${bookings.length} items for your expedition!`,
      bookingsCount: bookings.length,
      bookingIds: bookings.map(b => b._id)
    });

  } catch (error) {
    console.error("Expedition Booking Error:", error);
    next(error);
  }
};


export const acceptExpeditionService = async (req, res, next) => {
  try {
    const { bookingIds } = req.body;
    const providerId = req.user.id;
    const role = req.user.role; // 'TourGuide' or 'TransportProvider'

    if (!bookingIds || bookingIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No bookings provided.' });
    }

    // 1. Fetch all requested bookings to get their Dates
    const requestedBookings = await Booking.find({ _id: { $in: bookingIds } });
    if (requestedBookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Bookings not found.' });
    }


    let profileId = null;
    let serviceField = '';
    let statusField = '';

    if (role === 'TourGuide') {
      const guide = await TourGuide.findOne({ userId: providerId });
      if (!guide) return res.status(404).json({ message: 'Guide profile not found.' });
      profileId = guide._id;
      serviceField = 'guideId';
      statusField = 'guideStatus';
    } else if (role === 'TransportProvider') {
      const transport = await TransportProvider.findOne({ userId: providerId });
      if (!transport) return res.status(404).json({ message: 'Transport profile not found.' });
      profileId = transport._id;
      serviceField = 'transportProviderId';
      statusField = 'transportStatus';
    } else {
      return res.status(403).json({ message: 'Unauthorized role.' });
    }

    // 3. Extract Dates from the Request
    const tripDates = requestedBookings.map(b => new Date(b.activityDate).toDateString());
    const uniqueTripDates = [...new Set(tripDates)];


    const conflictingBookings = await Booking.find({
      [serviceField]: profileId,
      [statusField]: 'Confirmed', 
      _id: { $nin: bookingIds } 
    });

    // Check overlaps
    const busyDates = [];
    for (const booking of conflictingBookings) {
      const bDate = new Date(booking.activityDate).toDateString();
      if (uniqueTripDates.includes(bDate)) {
        busyDates.push(bDate);
      }
    }

    if (busyDates.length > 0) {
      return res.status(409).json({ // 409 Conflict
        success: false,
        message: `You are already booked on ${busyDates[0]}. You must be available for the entire trip to accept this request.`,
        busyDates
      });
    }

    await Booking.updateMany(
      { _id: { $in: bookingIds } },
      {
        [serviceField]: profileId,
        [statusField]: 'Confirmed'
      }
    );

    res.status(200).json({
      success: true,
      message: 'You have accepted the entire expedition! Have a safe journey.',
      count: bookingIds.length
    });

  } catch (error) {
    next(error);
  }
};