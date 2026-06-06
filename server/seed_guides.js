import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import TourGuide from './models/TourGuide.js';

dotenv.config();

// --- SMART LOCATIONS (Same as Farms) ---
const LOCATIONS = {
    'Nuwara Eliya': [
        { city: 'Nuwara Eliya', lat: 6.9708, lng: 80.7829 },
        { city: 'Hatton', lat: 6.8926, lng: 80.5975 },
        { city: 'Talawakele', lat: 6.9380, lng: 80.6586 }
    ],
    'Kandy': [
        { city: 'Kandy City', lat: 7.2906, lng: 80.6337 },
        { city: 'Peradeniya', lat: 7.2727, lng: 80.5956 },
        { city: 'Gampola', lat: 7.1633, lng: 80.5735 }
    ],
    'Matale': [
        { city: 'Sigiriya', lat: 7.9570, lng: 80.7603 },
        { city: 'Dambulla', lat: 7.8742, lng: 80.6511 },
        { city: 'Matale Town', lat: 7.4675, lng: 80.6234 }
    ],
    'Badulla': [
        { city: 'Ella', lat: 6.8667, lng: 81.0466 },
        { city: 'Bandarawela', lat: 6.8306, lng: 80.9908 },
        { city: 'Haputale', lat: 6.7694, lng: 80.9572 }
    ],
    'Galle': [
        { city: 'Galle Fort', lat: 6.0535, lng: 80.2210 },
        { city: 'Hikkaduwa', lat: 6.1395, lng: 80.1063 },
        { city: 'Elpitiya', lat: 6.2575, lng: 80.1437 }
    ],
    'Matara': [
        { city: 'Mirissa', lat: 5.9482, lng: 80.4716 },
        { city: 'Weligama', lat: 5.9728, lng: 80.4288 },
        { city: 'Deniyaya', lat: 6.3387, lng: 80.5573 }
    ],
    'Hambantota': [
        { city: 'Tissamaharama', lat: 6.2800, lng: 81.2874 },
        { city: 'Tangalle', lat: 6.0244, lng: 80.7941 }
    ],
    'Monaragala': [
        { city: 'Kataragama', lat: 6.4137, lng: 81.3323 },
        { city: 'Buttala', lat: 6.7561, lng: 81.2425 }
    ],
    'Ratnapura': [
        { city: 'Ratnapura City', lat: 6.6828, lng: 80.3992 },
        { city: 'Balangoda', lat: 6.6475, lng: 80.7022 },
        { city: 'Embilipitiya', lat: 6.3364, lng: 80.8524 }
    ],
    'Kegalle': [
        { city: 'Pinnawala', lat: 7.2964, lng: 80.3872 },
        { city: 'Kitulgala', lat: 6.9934, lng: 80.4130 }
    ],
    'Anuradhapura': [
        { city: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
        { city: 'Kekirawa', lat: 8.0435, lng: 80.5896 }
    ],
    'Trincomalee': [
        { city: 'Trincomalee', lat: 8.5874, lng: 81.2152 },
        { city: 'Nilaveli', lat: 8.6946, lng: 81.1895 }
    ],
    'Batticaloa': [
        { city: 'Pasikudah', lat: 7.9256, lng: 81.5632 }
    ],
    'Puttalam': [
        { city: 'Kalpitiya', lat: 8.2295, lng: 79.7596 }
    ],
    'Colombo': [
        { city: 'Avissawella', lat: 6.9543, lng: 80.2046 },
        { city: 'Homagama', lat: 6.8412, lng: 80.0031 }
    ],
    'Gampaha': [
        { city: 'Negombo', lat: 7.2085, lng: 79.8373 },
        { city: 'Mirigama', lat: 7.2437, lng: 80.1294 }
    ],
    'Kalutara': [
        { city: 'Horana', lat: 6.7166, lng: 80.0632 },
        { city: 'Bentota', lat: 6.4190, lng: 80.0029 }
    ],
    'Kurunegala': [
        { city: 'Kurunegala', lat: 7.4818, lng: 80.3609 },
        { city: 'Yapahuwa', lat: 7.8286, lng: 80.3164 }
    ],
    'Ampara': [
        { city: 'Arugam Bay', lat: 6.8416, lng: 81.8368 }
    ]
};

const guideNames = ["Sunil", "Kamal", "Nimal", "Ruwan", "Chaminda", "Silva", "Perera", "Fernando", "Bandara", "Kumara"];
const guideLastNames = ["Tours", "Guide", "Travels", "Explorer", "Walks"];

// Smart Language Logic
const getLanguagesForDistrict = (district) => {
    const base = ['English'];
    if (['Galle', 'Matara', 'Hambantota'].includes(district)) return [...base, 'Russian', 'German'];
    if (['Nuwara Eliya', 'Badulla', 'Kandy'].includes(district)) return [...base, 'Chinese', 'French'];
    if (['Colombo', 'Gampaha'].includes(district)) return [...base, 'Japanese', 'Arabic'];
    if (['Trincomalee', 'Batticaloa'].includes(district)) return [...base, 'Tamil', 'German'];
    return [...base, 'Sinhala']; // Default
};

const seedGuides = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected to DB. Starting Guide Seeding...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        let count = 0;

        for (const [district, cities] of Object.entries(LOCATIONS)) {
            for (const loc of cities) {
                // 1. Create User
                const name = `${guideNames[Math.floor(Math.random() * guideNames.length)]} ${loc.city}`;
                const email = `guide_${loc.city.replace(/\s+/g, '').toLowerCase()}@agrolk.com`;

                let user = await User.findOne({ email });
                if (!user) {
                    user = await User.create({
                        fullName: name,
                        email: email,
                        password: hashedPassword,
                        role: 'TourGuide',
                        phoneNumber: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
                        emailVerified: true,
                        countryOfResidence: 'Sri Lanka',
                        preferredLanguage: 'English'
                    });
                }

                // 2. Create Tour Guide Profile
                let guide = await TourGuide.findOne({ userId: user._id });
                if (!guide) {
                    await TourGuide.create({
                        userId: user._id,
                        licenseNumber: `TG-${Date.now()}-${count}`,
                        nic: `${900000000 + count}V`,
                        verificationStatus: 'Approved', // Auto Approved
                        yearsOfExperience: Math.floor(Math.random() * 10) + 1,
                        languagesSpoken: getLanguagesForDistrict(district),
                        bio: `I am an experienced guide in ${loc.city}. I know all the hidden gems in ${district}.`,
                        pricing: {
                            priceModel: 'PerHalfDay',
                            rate: Math.floor(Math.random() * (5000 - 2000) + 2000) // Random Rate 2000-5000
                        },
                        location: {
                            type: 'Point',
                            coordinates: [loc.lng, loc.lat] // [Lng, Lat]
                        },
                        isActive: true
                    });
                    count++;
                    console.log(`✅ Added Guide for ${loc.city}`);
                }
            }
        }

        console.log(`🎉 Successfully added ${count} Guides!`);
        process.exit();

    } catch (error) {
        console.error('❌ Guide Seeding Error:', error);
        process.exit(1);
    }
};

seedGuides();