import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';


export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const verificationToken = uuidv4();

    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      role,
      countryOfResidence: req.body.countryOfResidence || 'Sri Lanka',
      preferredLanguage: req.body.preferredLanguage || 'English',
      verificationToken,
      emailVerified: false
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `You are receiving this email because you (or someone else) has registered an account on AgroLK.\n\nPlease click on the link to verify your email: \n\n ${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'AgroLK Email Verification',
        message
      });
    } catch (error) {
        console.error("Email send failed", error);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check lock status
    if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
        return res.status(403).json({ success: false, message: 'Account locked. Please try again later.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        // Increment failed attempts
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
            user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); 
            user.failedLoginAttempts = 0; 
        }
        await user.save();
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.lastLogin = Date.now();
    await user.save();

    if (!user.emailVerified) {
        return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    // Create tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Create Session
    await Session.create({
        userId: user._id,
        token,
        refreshToken,
        deviceInfo: {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic,
          emailVerified: user.emailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const verificationToken = req.params.token;
        
        const user = await User.findOne({ verificationToken });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid verification token' });
        }

        user.emailVerified = true;
        user.verificationToken = null;
        await user.save();

        
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        // Invalidate session
        await Session.findOneAndDelete({ token });
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to DB
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration (10 minutes)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password.\n\nPlease make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'AgroLK Password Reset Token',
        message
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in (Send token)
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: { token, refreshToken, user: { id: user._id, role: user.role, fullName: user.fullName } }
    });
  } catch (error) {
    next(error);
  }
};