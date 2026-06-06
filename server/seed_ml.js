import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Farm from './models/Farm.js';
import Activity from './models/Activity.js';
import ActivityCategory from './models/ActivityCategory.js'; // Category ඕන වෙනවා
import TourGuide from './models/TourGuide.js';

dotenv.config();

const seedMLData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Starting ML Data Seeding...');

        // 1. Users (Tourists from different cultures)
        const tourists = [
            { name: 'Pierre Dubois', email: 'tfrench@yopmail.com', country: 'France', lang: 'French' },
            { name: 'Hans Muller', email: 'tgerman@yopmail.com', country: 'Germany', lang: 'German' },
            { name: 'Li Wei', email: 'tchina@yopmail.com', country: 'China', lang: 'Chinese' }
        ];

        for (const t of tourists) {
            // Check if exists first
            const exists = await User.findOne({ email: t.email });
            if (!exists) {
                await User.create({
                    fullName: t.name, email: t.email, password: 'tfrench123', phoneNumber: '0754326543',
                    role: 'Tourist', countryOfResidence: t.country, preferredLanguage: t.lang, emailVerified: true
                });
                console.log(`✅ Created Tourist: ${t.country}`);
            }
        }

        // 2. Create Categories (if not exist)
        let category = await ActivityCategory.findOne({ categoryName: 'Spice Tour' });
        if (!category) {
            category = await ActivityCategory.create({ categoryName: 'Spice Tour', description: 'Spice gardens', icon: '🌶️' });
        }

        // 3. Create Farm (Ella)
        const farmOwner = await User.create({ fullName: 'Ella Farmer', email: `farm${Date.now()}@yopmail.com`, password: 'farmer123', phoneNumber: '0774352461', role: 'Farmer', emailVerified: true });
        const farm = await Farm.create({
            userId: farmOwner._id,
            farmName: 'Ella Spice Sanctuary',
            farmType: 'Spice Garden',
            description: 'Traditional spice garden.',
            location: { address: 'Ella', city: 'Ella', district: 'Badulla', coordinates: [81.0465, 6.8667] },
            verificationStatus: 'Approved', isActive: true
        });

        // 4. Create Activities
        await Activity.create({
            farmId: farm._id,
            categoryId: category._id,
            customTitle: 'Authentic Cinnamon Experience',
            customDescription: 'Learn how cinnamon is peeled. Great for culture lovers.',
            pricePerPerson: 4500, durationHours: 3, maxParticipants: 10, status: 'Active',
            averageRating: 4.8, totalReviews: 15
        });
        console.log('✅ Created Activity in Ella');

        // 5. Create Guides (Supply Logic)
        // Guide 1: French Speaker
        const guide1 = await User.create({ fullName: 'Guide Perera', email: `g${Date.now()}@yopmail.com`, password: 'guide123', phoneNumber: '0786532451', role: 'TourGuide', emailVerified: true });
        await TourGuide.create({
            userId: guide1._id, licenseNumber: `G-${Date.now()}`, nic: '123454780V', yearsOfExperience: 5,
            languagesSpoken: ['English', 'French'], // Match!
            location: { type: 'Point', coordinates: [81.0460, 6.8670] }, // Near Farm
            verificationStatus: 'Approved', isActive: true, pricing: { priceModel: 'PerHalfDay', rate: 3000 }
        });
        console.log('✅ Created French Speaking Guide');

        console.log('🎉 Seeding Complete! Ready for ML.');
        process.exit();

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedMLData();