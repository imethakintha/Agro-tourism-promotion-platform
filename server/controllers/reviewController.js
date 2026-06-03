import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

export const createReview = async (req, res, next) => {
  try {
    const { bookingId, ratings, comment, images } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Validation
    if (booking.touristId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }
    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }
    if (booking.reviewSubmitted) {
      return res.status(400).json({ success: false, message: 'Review already submitted' });
    }

    const targetId = booking.activityId;
    const targetType = 'Activity';

    const review = await Review.create({
      bookingId,
      reviewerId: req.user.id,
      targetId,
      targetType,
      ratings,
      comment,
      images,
      moderationStatus: 'Pending'
    });


    booking.reviewSubmitted = true;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted for moderation',
      data: review
    });

  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { targetId } = req.params;
    
    // Only show Approved reviews
    const reviews = await Review.find({ targetId, moderationStatus: 'Approved' })
      .populate('reviewerId', 'fullName profilePic')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};


export const replyToReview = async (req, res, next) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: 'Review not found' });


    review.response = {
      text,
      respondedAt: new Date()
    };
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};