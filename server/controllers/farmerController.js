import Farm from '../models/Farm.js';
import Booking from '../models/Booking.js';
import Activity from '../models/Activity.js';
import { broadcastToGuides, broadcastToTransport } from '../services/broadcastService.js';
import { geocodeAddress } from '../services/googleMapsService.js';

export const registerFarm = async (req, res, next) => {
  try {
    const existingFarm = await Farm.findOne({ userId: req.user.id });
    if (existingFarm) {
      return res.status(400).json({ success: false, message: 'Farm already registered for this user' });
    }

    let coordinates = [79.8612, 6.9271];

    if (req.body.location && req.body.location.address) {
      try {
        const fullAddress = `${req.body.location.address}, ${req.body.location.city}, Sri Lanka`;
        console.log("Geocoding Full Address:", fullAddress);

        const coords = await geocodeAddress(fullAddress);

        if (coords && typeof coords.lng === 'number' && typeof coords.lat === 'number') {
          coordinates = [coords.lng, coords.lat];
        }

      } catch (geoError) {
        console.error("Geocoding Error:", geoError.message);
      }
    }
    const farm = await Farm.create({
      userId: req.user.id,
      ...req.body,
      location: {
        ...req.body.location,
        type: 'Point',
        coordinates: coordinates
      },
      verificationStatus: 'Pending',
      isActive: false
    });

    res.status(201).json({
      success: true,
      message: 'Farm registered successfully. Awaiting verification.',
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ userId: req.user.id });

    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm profile not found' });
    }

    res.status(200).json({
      success: true,
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

export const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findOne({ userId: req.user.id });

    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm profile not found' });
    }

    // Prevent updating verification status via this endpoint
    if (req.body.verificationStatus) {
      delete req.body.verificationStatus;
    }

    farm = await Farm.findOneAndUpdate({ userId: req.user.id }, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      data: farm
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body; // status: 'Confirmed' or 'Declined'

    if (!['Confirmed', 'Declined', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.bookingId).populate('farmId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Check ownership
    if (booking.farmId.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // If declining, restore slots
    if (status === 'Declined') {
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
      booking.cancellation = {
        cancelledBy: req.user.id,
        reason: reason || 'Declined by farmer',
        cancelledAt: Date.now()
      };
    }

    booking.status = status;
    await booking.save();

    if (status === 'Confirmed') {
      if (booking.pricing.guideCost > 0) {
        await broadcastToGuides(booking, booking.farmId);
      }
      if (booking.pricing.transportCost > 0) {
        await broadcastToTransport(booking);
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status}`,
      data: booking
    });

  } catch (error) {
    next(error);
  }
};