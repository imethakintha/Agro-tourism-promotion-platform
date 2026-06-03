import TransportProvider from '../models/TransportProvider.js';
import Booking from '../models/Booking.js';
import { geocodeAddress } from '../services/googleMapsService.js';

export const registerTransport = async (req, res, next) => {
  try {
    const existingTransport = await TransportProvider.findOne({ userId: req.user.id });
    if (existingTransport) {
      return res.status(400).json({ success: false, message: 'Transport profile already exists' });
    }

    let locationData = { type: 'Point', coordinates: [0, 0] }; 

    if (req.body.address) {
      const coords = await geocodeAddress(req.body.address);
      if (coords) {
        locationData = { type: 'Point', coordinates: [coords.lng, coords.lat] };
      }
    }

    const transport = await TransportProvider.create({
      userId: req.user.id,
      ...req.body,
      location: locationData,
      verificationStatus: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Transport registration submitted for verification',
      data: transport
    });
  } catch (error) {
    next(error);
  }
};


export const getTransportProfile = async (req, res, next) => {
  try {
    const transport = await TransportProvider.findOne({ userId: req.user.id });

    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport profile not found' });
    }

    res.status(200).json({
      success: true,
      data: transport
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const now = new Date();
    const requests = await Booking.find({
      transportStatus: 'Pending',
      transportBroadcastTimeoutAt: { $gt: now }
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

    const provider = await TransportProvider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ message: 'Transport profile not found' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (action === 'Accept') {
      if (booking.transportStatus !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Request already taken or expired' });
      }

      booking.transportStatus = 'Confirmed';
      booking.transportProviderId = provider._id;
      await booking.save();


      if (booking.notes === 'AI Expedition Booking') {
        await Booking.updateMany({
          _id: { $ne: booking._id },
          touristId: booking.touristId,
          bookingDate: booking.bookingDate, // Group by exact creation timestamp
          transportStatus: 'Pending'
        }, {
          transportStatus: 'Confirmed',
          transportProviderId: provider._id
        });
        console.log(`Confirmed transport for entire expedition group (Tourist: ${booking.touristId})`);
      }

      return res.status(200).json({ success: true, message: 'Trip Accepted Successfully!' });
    } else {
      return res.status(200).json({ success: true, message: 'Request ignored' });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyTransportJobs = async (req, res, next) => {
  try {
    const provider = await TransportProvider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ message: 'Transport profile not found' });

    const jobs = await Booking.find({
      transportProviderId: provider._id,
      transportStatus: { $in: ['Confirmed', 'Completed'] }
    })
      .populate('activityId', 'customTitle')
      .populate('farmId', 'farmName location')
      .populate('touristId', 'fullName phoneNumber')
      .sort({ activityDate: 1 });

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};