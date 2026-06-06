import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Farm from './models/Farm.js';
import Activity from './models/Activity.js';

dotenv.config();

const cleanupSeedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🧹 Connected to DB. Starting cleanup...');

        // 1. Seed Script එකෙන් හදපු Farmers ලා හොයාගන්න
        // අපි යොදාගත්තේ "farmer[අංකය]@agrolk.com" කියන රටාව
        const seedFarmers = await User.find({ 
            email: { $regex: /^farmer\d+@agrolk\.com$/ } 
        }).select('_id email');

        if (seedFarmers.length === 0) {
            console.log('⚠️ No seed farmers found. Nothing to delete.');
            process.exit();
        }

        const farmerIds = seedFarmers.map(u => u._id);
        console.log(`📍 Found ${farmerIds.length} Seed Farmers.`);

        // 2. ඒ Farmers ලට අයිති Farms හොයාගන්න
        const seedFarms = await Farm.find({ 
            userId: { $in: farmerIds } 
        }).select('_id');

        const farmIds = seedFarms.map(f => f._id);
        console.log(`📍 Found ${farmIds.length} Farms belonging to Seed Farmers.`);

        // 3. ඒ Farms වලට අයිති Activities මකන්න (ඔයා ඉල්ලපු දේ)
        const deletedActivities = await Activity.deleteMany({ 
            farmId: { $in: farmIds } 
        });
        console.log(`✅ Deleted ${deletedActivities.deletedCount} Activities (Seed Data Only).`);

        // --- අවශ්‍ය නම් පහළ කොටස් Uncomment කරන්න ---
        
        // Farms ටිකත් මකන්න ඕන නම්:
        const deletedFarms = await Farm.deleteMany({ _id: { $in: farmIds } });
        console.log(`✅ Deleted ${deletedFarms.deletedCount} Farms.`);

        // Users (Farmers) ලාවත් මකන්න ඕන නම්:
        const deletedUsers = await User.deleteMany({ _id: { $in: farmerIds } });
        console.log(`✅ Deleted ${deletedUsers.deletedCount} Farmers.`);

        console.log('🎉 Cleanup Complete!');
        process.exit();

    } catch (error) {
        console.error('❌ Cleanup Error:', error);
        process.exit(1);
    }
};

cleanupSeedData();