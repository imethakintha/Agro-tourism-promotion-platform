import Activity from '../models/Activity.js';
import Farm from '../models/Farm.js';
import ActivityCategory from '../models/ActivityCategory.js';
import ActivityTag from '../models/ActivityTag.js';

export const createActivity = async (req, res, next) => {
  try {

    const farm = await Farm.findOne({ userId: req.user.id });
    if (!farm) {
      return res.status(400).json({ success: false, message: 'You must register a farm first' });
    }
    if (farm.verificationStatus !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Farm must be verified to post activities' });
    }

    const activity = await Activity.create({
      ...req.body,
      farmId: farm._id,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

export const getMyActivities = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ userId: req.user.id });
    if (!farm) return res.status(200).json({ success: true, data: [] });

    const activities = await Activity.find({ farmId: farm._id })
      .populate('categoryId', 'categoryName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           
      runValidators: true  
    });

    res.status(200).json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


export const updateAvailability = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ userId: req.user.id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm profile not found for this user' });
    }
    const { date, timeSlots } = req.body; // date is ISO string, timeSlots array

    let activity = await Activity.findOne({ _id: req.params.activityId, farmId: farm._id });
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    // Check if date already exists in calendar
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    const dateIndex = activity.availabilityCalendar.findIndex(
      item => new Date(item.date).toDateString() === dateObj.toDateString()
    );

    if (dateIndex > -1) {
      // Update existing date
      activity.availabilityCalendar[dateIndex].timeSlots = timeSlots;
    } else {
      // Add new date
      activity.availabilityCalendar.push({ date: dateObj, timeSlots });
    }

    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated',
      data: activity.availabilityCalendar
    });
  } catch (error) {
    console.error("Update Availability Error:", error);
    next(error);
  }
};

export const bulkUpdateAvailability = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ userId: req.user.id });
    const { startDate, endDate, daysOfWeek, timeSlots } = req.body;
    // daysOfWeek: [0, 1, 2...] where 0 = Sunday

    let activity = await Activity.findOne({ _id: req.params.activityId, farmId: farm._id });
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (daysOfWeek.includes(d.getDay())) {
        const dateStr = d.toDateString();
        const existingIndex = activity.availabilityCalendar.findIndex(c => new Date(c.date).toDateString() === dateStr);

        if (existingIndex > -1) {
          activity.availabilityCalendar[existingIndex].timeSlots = timeSlots;
        } else {
          activity.availabilityCalendar.push({
            date: new Date(d),
            timeSlots: timeSlots
          });
        }
      }
    }

    await activity.save();

    res.status(200).json({
      success: true,
      message: `Availability updated from ${start.toDateString()} to ${end.toDateString()}`
    });

  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await ActivityCategory.find({ isActive: true }).sort('displayOrder');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};


export const getTagsByCategory = async (req, res, next) => {
  try {
    const tags = await ActivityTag.find({ categoryId: req.params.categoryId, isActive: true });
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};

export const getActivityDetails = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.activityId)
      .populate('farmId')
      .populate('categoryId')
      .populate('tagIds');

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }


    res.status(200).json({
      success: true,
      data: {
        activity,
        farm: activity.farmId,
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('categoryId', 'categoryName icon') 
      .populate('tagIds', 'tagName');              
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error("Error fetching activity:", error);

    if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

