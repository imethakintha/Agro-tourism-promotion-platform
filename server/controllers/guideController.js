import TourGuide from '../models/TourGuide.js';
import Booking from '../models/Booking.js';
import { geocodeAddress } from '../services/googleMapsService.js';

export const registerGuide = async (req, res, next) => {
  try {
    const existingGuide = await TourGuide.findOne({ userId: req.user.id });
    if (existingGuide) {
      return res.status(400).json({ success: false, message: 'Guide profile already exists' });
    }

    let locationData = { type: 'Point', coordinates: [0, 0] }; // Default
    if (req.body.address) {
      const coords = await geocodeAddress(req.body.address);
      if (coords) {
        locationData = { type: 'Point', coordinates: [coords.lng, coords.lat] };
      }
    }

    const guide = await TourGuide.create({
      userId: req.user.id,
      ...req.body,
      location: locationData,
      verificationStatus: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Guide registration submitted for verification',
      data: guide
    });
  } catch (error) {
    next(error);
  }
};

export const getGuideProfile = async (req, res, next) => {
  try {
    const guide = await TourGuide.findOne({ userId: req.user.id });

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    res.status(200).json({
      success: true,
      data: guide
    });
  } catch (error) {
    next(error);
  }
};


export const getPendingRequests = async (req, res, next) => {
  try {
    const now = new Date();
    const requests = await Booking.find({
      guideStatus: 'Pending',
      guideBroadcastTimeoutAt: { $gt: now }
    }).populate('activityId', 'customTitle').populate('farmId', 'farmName location');

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

export const respondToRequest = async (req, res, next) => {
  try {
    const { action } = req.body; // 'Accept' or 'Decline'
    const bookingId = req.params.bookingId;

    const guide = await TourGuide.findOne({ userId: req.user.id });
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (action === 'Accept') {
      // ATOMIC CHECK: Is it still pending?
      if (booking.guideStatus !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Request already taken or expired' });
      }

      booking.guideStatus = 'Confirmed';
      booking.guideId = guide._id;
      await booking.save();

      // Check if this is an expedition and confirm all related pending bookings
      if (booking.notes === 'AI Expedition Booking') {
        await Booking.updateMany({
          _id: { $ne: booking._id },
          touristId: booking.touristId,
          bookingDate: booking.bookingDate,
          guideStatus: 'Pending'
        }, {
          guideStatus: 'Confirmed',
          guideId: guide._id
        });
        console.log(`Confirmed guide for entire expedition group (Tourist: ${booking.touristId})`);
      }

      return res.status(200).json({ success: true, message: 'Job Accepted Successfully!' });
    } else {
      // If decline, just ignore locally (in real app, maybe mark as hidden for this user)
      return res.status(200).json({ success: true, message: 'Request ignored' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Guide's Confirmed Jobs
// @route   GET /api/guides/jobs
// @access  Private (TourGuide)
export const getMyJobs = async (req, res, next) => {
  try {
    const guide = await TourGuide.findOne({ userId: req.user.id });
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });

    const jobs = await Booking.find({
      guideId: guide._id,
      guideStatus: { $in: ['Confirmed', 'Completed'] }
    })
      .populate('activityId', 'customTitle')
      .populate('farmId', 'farmName location')
      .populate('touristId', 'fullName phoneNumber') // Tourist ගේ විස්තරත් ඕන
      .sort({ activityDate: 1 }); // ළඟම තියෙන දිනේ උඩට

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};