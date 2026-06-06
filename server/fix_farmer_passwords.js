import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; // ඔයාගේ User model path එක හරියට බලන්න

dotenv.config();

const updateSpecificFarmers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        // 1. Password එක Hash කරගමු (Common Password)
        const newPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 2. අදාල Email List එක හදාගමු (7 සිට 108 දක්වා)
        const targetEmails = [];
        for (let i = 7; i <= 108; i++) {
            targetEmails.push(`farmer${i}@yopmail.com`);
        }

        console.log(`🎯 Targeting ${targetEmails.length} farmers (from farmer7 to farmer108)...`);

        // 3. Update Many command එකෙන් එකපාර ඔක්කොම update කරමු
        const result = await User.updateMany(
            { email: { $in: targetEmails } }, // Filter: මේ email list එකේ ඉන්න අය විතරයි
            { $set: { password: hashedPassword } } // Update: අලුත් hashed password එක දාන්න
        );

        console.log('------------------------------------------------');
        console.log(`✅ Success! Matched Documents: ${result.matchedCount}`);
        console.log(`🔄 Modified Documents: ${result.modifiedCount}`);
        console.log('------------------------------------------------');
        
        if (result.matchedCount === 0) {
            console.log('⚠️ Warning: කිසිම User කෙනෙක් හම්බුනේ නෑ. Email format එක හරිද බලන්න.');
        }

        process.exit();

    } catch (error) {
        console.error('❌ Error updating passwords:', error);
        process.exit(1);
    }
};

updateSpecificFarmers();