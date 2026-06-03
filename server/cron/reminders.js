import Booking from '../models/Booking.js';
import sendEmail from '../utils/sendEmail.js';

export const sendBookingReminders = async () => {
  console.log('Running daily booking reminders...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  try {
    // Find bookings happening tomorrow
    const upcomingBookings = await Booking.find({
      activityDate: {
        $gte: tomorrow,
        $lt: dayAfter
      },
      status: 'Confirmed'
    }).populate('touristId activityId farmId');

    console.log(`Found ${upcomingBookings.length} bookings for tomorrow.`);

    for (const booking of upcomingBookings) {
      if (!booking.touristId || !booking.touristId.email) continue;

      const message = `
        Hello ${booking.touristId.fullName},
        
        This is a reminder for your upcoming activity: ${booking.activityId.customTitle}.
        
        Date: ${new Date(booking.activityDate).toDateString()}
        Time: ${booking.activityTime.startTime}
        Location: ${booking.farmId.location.address}, ${booking.farmId.location.city}
        
        We look forward to seeing you!
        
        - AgroLK Team
      `;

      await sendEmail({
        email: booking.touristId.email,
        subject: 'Reminder: Your AgroLK Experience is Tomorrow!',
        message
      });
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
};