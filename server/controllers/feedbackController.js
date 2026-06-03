import Feedback from '../models/Feedback.js';


export const createFeedback = async (req, res, next) => {
  try {
    const { name, email, subject, message, category, userId } = req.body;

    const feedback = await Feedback.create({
      userId: userId || null, // Logged in user නම් ID එක එනවා
      name,
      email,
      subject,
      message,
      category,
      status: 'New'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};


export const deleteFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
    } catch (error) {
        next(error);
    }
};