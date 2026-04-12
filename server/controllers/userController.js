import User from '../models/User.js';
import path from 'path';
import fs from 'fs';


export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
          profile: user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        preferredLanguage: req.body.preferredLanguage, 
        countryOfResidence: req.body.countryOfResidence
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
          profile: user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePic = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const profilePicUrl = `/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(req.user.id, { profilePic: profilePicUrl }, { new: true });

        res.status(200).json({
            success: true,
            data: {
                profilePicUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        if (!await user.matchPassword(password)) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        user.accountStatus = 'Deleted';
        await user.save();


        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};