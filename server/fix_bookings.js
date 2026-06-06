import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js'; // Booking model එකේ path එක හරියට බලන්න

dotenv.config();

const fixBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Completed වෙලා තියෙන, නමුත් අලුත් Status නැති Bookings සොයාගැනීම
        // (Booking එක Completed නම්, අනිවාර්යයෙන් Payout එක Pending වෙන්න එපැයි)
        const bookings = await Booking.find({ 
            status: 'Completed'
        });

        console.log(`Found ${bookings.length} completed bookings to check...`);

        let updatedCount = 0;

        for (const booking of bookings) {
            let needsUpdate = false;

            // Farmer Status හදමු
            if (!booking.farmerPayoutStatus) {
                booking.farmerPayoutStatus = 'Pending';
                needsUpdate = true;
            }

            // Guide Status හදමු
            if (booking.guideId && (!booking.guidePayoutStatus || booking.guidePayoutStatus === 'NotApplicable')) {
                booking.guidePayoutStatus = 'Pending';
                needsUpdate = true;
            } else if (!booking.guideId) {
                booking.guidePayoutStatus = 'NotApplicable';
                needsUpdate = true;
            }

            // Transport Status හදමු
            if (booking.transportProviderId && (!booking.transportPayoutStatus || booking.transportPayoutStatus === 'NotApplicable')) {
                booking.transportPayoutStatus = 'Pending';
                needsUpdate = true;
            } else if (!booking.transportProviderId) {
                booking.transportPayoutStatus = 'NotApplicable';
                needsUpdate = true;
            }

            if (needsUpdate) {
                await booking.save();
                updatedCount++;
                process.stdout.write(`\rUpdating Booking: ${updatedCount}`);
            }
        }

        console.log(`\n\n🎉 Success! Updated ${updatedCount} old bookings.`);
        console.log("Now they will appear correctly in the Payout Generator.");
        
        process.exit();

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

fixBookings();