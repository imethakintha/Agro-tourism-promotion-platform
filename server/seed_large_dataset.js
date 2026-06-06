import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Password hash කරන්න
import User from './models/User.js';
import Farm from './models/Farm.js';
import Activity from './models/Activity.js';
import ActivityCategory from './models/ActivityCategory.js';

dotenv.config();

const IMAGES = {
    'HillCountry': [
        'https://images.unsplash.com/photo-1598556776374-1229b9c92257?auto=format&fit=crop&w=600&q=80', // Tea Plucking
        'https://images.unsplash.com/photo-1588667637213-9118546196e8?auto=format&fit=crop&w=600&q=80', // Tea Estate
        'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80', // Ella Train
        'https://images.unsplash.com/photo-1544945582-25d252427a8a?auto=format&fit=crop&w=600&q=80'  // Misty Mountains
    ],
    'Coastal': [
        'https://images.unsplash.com/photo-1585642930248-d36c5357878d?auto=format&fit=crop&w=600&q=80', // Cinnamon
        'https://images.unsplash.com/photo-1622396347895-3b9576b5c308?auto=format&fit=crop&w=600&q=80', // Coconut
        'https://images.unsplash.com/photo-1581023770334-a131b78297b4?auto=format&fit=crop&w=600&q=80', // Beach
        'https://images.unsplash.com/photo-1582298539097-f5899988b485?auto=format&fit=crop&w=600&q=80'  // Stilt Fishing
    ],
    'Cultural': [
        'https://images.unsplash.com/photo-1620023438318-7b4458b29c0f?auto=format&fit=crop&w=600&q=80', // Rice Paddy
        'https://images.unsplash.com/photo-1606214532655-0810795493c6?auto=format&fit=crop&w=600&q=80', // Cooking
        'https://images.unsplash.com/photo-1590035048705-59187a2a0d16?auto=format&fit=crop&w=600&q=80', // Temple
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80'  // Spices
    ],
    'Nature': [
        'https://images.unsplash.com/photo-1596438672360-90907277464e?auto=format&fit=crop&w=600&q=80', // Forest
        'https://images.unsplash.com/photo-1542144582-13011f8c5e15?auto=format&fit=crop&w=600&q=80', // Garden
        'https://images.unsplash.com/photo-1586795863864-16c523429815?auto=format&fit=crop&w=600&q=80', // Waterfall
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'  // Wildlife
    ]
};

// --- 1. SMART LOCATION DATA (Districts & Cities with Real Coordinates) ---
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

// --- 2. ACTIVITY TEMPLATES (For Content-Based Filtering) ---
const ACTIVITY_TEMPLATES = {
    'HillCountry': [
        { title: 'Tea Plucking Experience', tags: ['Tea', 'Nature', 'Culture'], desc: 'Join local pluckers in the tea estates.' },
        { title: 'Mountain Hiking Adventure', tags: ['Hiking', 'Adventure', 'Nature'], desc: 'Scenic hike through misty mountains.' },
        { title: 'Waterfall Trekking', tags: ['Nature', 'Photo', 'Adventure'], desc: 'Discover hidden waterfalls.' }
    ],
    'Coastal': [
        { title: 'Cinnamon Peeling Workshop', tags: ['Spice', 'Culture', 'Cinnamon'], desc: 'Learn the art of cinnamon processing.' },
        { title: 'Coconut Farm Visit', tags: ['Nature', 'Food', 'Culture'], desc: 'Fresh king coconut and toddy tapping.' },
        { title: 'Traditional Fishing', tags: ['Culture', 'Adventure', 'Photo'], desc: 'Experience stilt fishing methods.' }
    ],
    'Cultural': [
        { title: 'Paddy Harvesting', tags: ['Culture', 'Nature', 'Rice'], desc: 'Traditional rice farming experience.' },
        { title: 'Village Cooking Class', tags: ['Food', 'Culture', 'Spice'], desc: 'Cook authentic Sri Lankan curry.' },
        { title: 'Ancient Tank Visit', tags: ['History', 'Culture', 'Photo'], desc: 'Explore ancient irrigation systems.' }
    ],
    'Nature': [
        { title: 'Bird Watching Tour', tags: ['Nature', 'Photo', 'Relax'], desc: 'Spot endemic birds in the forest.' },
        { title: 'Organic Garden Walk', tags: ['Nature', 'Food', 'Healthy'], desc: 'Pick your own fresh vegetables.' },
        { title: 'Ayurveda Herb Tour', tags: ['Ayurveda', 'Nature', 'Relax'], desc: 'Learn about healing plants.' }
    ]
};

const FARM_PREFIXES = ['Ceylon', 'AgroLK', 'Green', 'Royal', 'Organic', 'Eco', 'Paradise', 'Heritage', 'Golden', 'Village'];
const FARM_SUFFIXES = ['Farm', 'Estate', 'Garden', 'Plantation', 'Agro City', 'Valley', 'Fields', 'Orchard'];

// Helper to pick random item
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected to DB. Starting Large Data Seed...');

        // 1. Ensure Categories Exist
        const catNames = ['Nature & Plantation', 'Adventure & Outdoors', 'Culture & Heritage', 'Culinary & Food', 'Wellness & Relaxation'];
        let categories = [];

        for (const name of catNames) {
            let cat = await ActivityCategory.findOne({ categoryName: name });
            if (!cat) {
                cat = await ActivityCategory.create({ categoryName: name, description: 'Generated Category', icon: '🌱' });
            }
            categories.push(cat);
        }

        // 2. Generate 100 Farmers & Farms
        const districtKeys = Object.keys(LOCATIONS);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt); // Default password

        console.log('🚜 Generating 100 Farmers and Farms...');

        for (let i = 7; i <= 107; i++) {
            // A. Create Farmer User
            const farmerName = `Farmer ${i}`;
            const email = `farmer${i}@yopmail.com`;

            // Check if exists to avoid dupes
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    fullName: farmerName,
                    email: email,
                    password: hashedPassword, // Manually hashed since we bypass controller
                    role: 'Farmer',
                    phoneNumber: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
                    emailVerified: true,
                    countryOfResidence: 'Sri Lanka'
                });
            }

            // B. Select Location (District & City)
            const district = pick(districtKeys);
            const locationData = pick(LOCATIONS[district]);

            let regionType = 'Nature';
            if (['Nuwara Eliya', 'Badulla', 'Kandy', 'Matale'].includes(district)) regionType = 'HillCountry';
            else if (['Galle', 'Matara', 'Hambantota', 'Trincomalee', 'Ampara', 'Batticaloa', 'Puttalam', 'Kalutara'].includes(district)) regionType = 'Coastal';
            else if (['Anuradhapura', 'Kurunegala', 'Ratnapura'].includes(district)) regionType = 'Cultural';

            // C. Create Farm
            const farmName = `${pick(FARM_PREFIXES)} ${locationData.city} ${pick(FARM_SUFFIXES)}`;

            const farmImage = pick(IMAGES[regionType]);

            let farm = await Farm.findOne({ userId: user._id });
            if (!farm) {
                farm = await Farm.create({
                    userId: user._id,
                    farmName: farmName,
                    farmType: district === 'Nuwara Eliya' || district === 'Badulla' ? 'Tea Plantation' : 'Mixed Farm',
                    description: `A beautiful ${farmName} located in the heart of ${district}. We offer authentic agro-tourism experiences.`,
                    location: {
                        address: `No ${i}, Main Road, ${locationData.city}`,
                        city: locationData.city,
                        district: district,
                        type: 'Point',
                        coordinates: [locationData.lng, locationData.lat] // [Lng, Lat] correct format
                    },
                    facilities: ['Parking', 'Restrooms', 'Dining Area', 'WiFi'],
                    verificationStatus: 'Approved', // Auto approve for demo
                    isActive: true,
                    images: [{ url: farmImage, caption: 'Farm View', isPrimary: true }] // You can add dummy image URLs here if needed
                });
            }

            // D. Create 2 Activities per Farm (Based on Location)
            let templates = ACTIVITY_TEMPLATES[regionType] || ACTIVITY_TEMPLATES['Nature'];

            // Create 2 unique activities
            for (let j = 0; j < 2; j++) {
                const template = pick(templates);
                const category = pick(categories);
                const actImage = pick(IMAGES[regionType]);

                const existingAct = await Activity.findOne({ farmId: farm._id, customTitle: { $regex: template.title } });

                if (!existingAct) {
                    await Activity.create({
                        farmId: farm._id,
                        categoryId: category._id,
                        customTitle: `${template.title} at ${locationData.city}`,
                        customDescription: `${template.desc} Enjoy ${template.tags.join(', ')} in ${district}.`,
                        pricePerPerson: Math.floor(Math.random() * (5000 - 1500) + 1500),
                        durationHours: Math.floor(Math.random() * 4) + 1,
                        maxParticipants: 10,
                        status: 'Active',
                        averageRating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1),
                        totalReviews: Math.floor(Math.random() * 50),
                        // 👇 මෙන්න Image එක දාන තැන
                        images: [{
                            url: actImage,
                            isPrimary: true,
                            caption: template.title
                        }]
                    });
                }
            }

            if (i % 10 === 0) console.log(`   Processed ${i} Farmers...`);
        }

        console.log('✅ SEEDING COMPLETE! 100 Farmers, 100 Farms, 200 Activities created.');
        process.exit();

    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

generateData();