import User from '../models/User.js';
import Session from '../models/Session.js';

export const cleanExpiredTokens = async () => {
  console.log('Running system cleanup...');
  const now = new Date();

  try {
    // 1. Clean expired verification tokens for unverified users > 24h old
    const resultUsers = await User.updateMany(
      {
        verificationToken: { $ne: null },
        createdAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        emailVerified: false
      },
      {
        $set: { verificationToken: null }
      }
    );
    console.log(`Cleaned ${resultUsers.modifiedCount} expired verification tokens.`);

    // 2. Clean expired sessions
    const resultSessions = await Session.deleteMany({
      expiresAt: { $lt: now }
    });
    console.log(`Removed ${resultSessions.deletedCount} expired sessions.`);

  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

export const cleanOldLogs = async (days = 90) => {
    // Placeholder for log cleanup if logs were stored in DB
    console.log(`Cleaning logs older than ${days} days... (Placeholder)`);
};