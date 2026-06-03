import User from '../models/User.js';
import Activity from '../models/Activity.js';


export const addFavorite = async (req, res, next) => {
  try {
    const { activityId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.favorites.includes(activityId)) {
      user.favorites.push(activityId);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter(id => id.toString() !== activityId);
    await user.save();

    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: { path: 'farmId', select: 'location' } // Nested populate to get location
    });

    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};