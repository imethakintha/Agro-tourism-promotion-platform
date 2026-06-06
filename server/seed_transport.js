import mongoose from 'mongoose';
import dotenv from 'dotenv';
// bcrypt import එක අයින් කරා, මොකද model එකෙන් hash කරන නිසා (User Model handles hashing)
import User from './models/User.js';
import TransportProvider from './models/TransportProvider.js';

dotenv.config();

// --- SMART LOCATIONS (Districts & Cities) ---
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
        { city: 'Dambulla', lat: 7.8742, lng: 80.6511 }
    ],
    'Badulla': [
        { city: 'Ella', lat: 6.8667, lng: 81.0466 },
        { city: 'Bandarawela', lat: 6.8306, lng: 80.9908 }
    ],
    'Galle': [
        { city: 'Galle Fort', lat: 6.0535, lng: 80.2210 },
        { city: 'Hikkaduwa', lat: 6.1395, lng: 80.1063 }
    ],
    'Matara': [
        { city: 'Mirissa', lat: 5.9482, lng: 80.4716 },
        { city: 'Weligama', lat: 5.9728, lng: 80.4288 }
    ],
    'Hambantota': [
        { city: 'Tissamaharama', lat: 6.2800, lng: 81.2874 },
        { city: 'Tangalle', lat: 6.0244, lng: 80.7941 }
    ],
    'Monaragala': [
        { city: 'Kataragama', lat: 6.4137, lng: 81.3323 }
    ],
    'Ratnapura': [
        { city: 'Ratnapura City', lat: 6.6828, lng: 80.3992 },
        { city: 'Udawalawe', lat: 6.4736, lng: 80.8847 } 
    ],
    'Anuradhapura': [
        { city: 'Anuradhapura', lat: 8.3114, lng: 80.4037 }
    ],
    'Trincomalee': [
        { city: 'Trincomalee', lat: 8.5874, lng: 81.2152 },
        { city: 'Nilaveli', lat: 8.6946, lng: 81.1895 }
    ],
    'Colombo': [
        { city: 'Colombo Fort', lat: 6.9319, lng: 79.8478 },
        { city: 'Mount Lavinia', lat: 6.8299, lng: 79.8647 }
    ],
    'Gampaha': [
        { city: 'Negombo', lat: 7.2085, lng: 79.8373 },
        { city: 'Katunayake', lat: 7.1693, lng: 79.8737 } 
    ],
    'Kalutara': [
        { city: 'Bentota', lat: 6.4190, lng: 80.0029 }
    ],
    'Kurunegala': [
        { city: 'Kurunegala', lat: 7.4818, lng: 80.3609 }
    ],
    'Ampara': [
        { city: 'Arugam Bay', lat: 6.8416, lng: 81.8368 }
    ],
    'Puttalam': [
        { city: 'Kalpitiya', lat: 8.2295, lng: 79.7596 }
    ],
    'Batticaloa': [
        { city: 'Pasikudah', lat: 7.9256, lng: 81.5632 }
    ],
    'Kegalle': [
        { city: 'Pinnawala', lat: 7.2964, lng: 80.3872 }
    ]
};

// --- VEHICLE TYPES & LOGIC ---
const VEHICLES = {
    'TukTuk': { type: 'Tuk-Tuk', passengers: 3, basePrice: 300, pricePerKm: 100 },
    'Car': { type: 'Car', passengers: 4, basePrice: 500, pricePerKm: 140 },
    'Van': { type: 'Van', passengers: 8, basePrice: 800, pricePerKm: 180 },
    'MiniBus': { type: 'Mini-Bus', passengers: 15, basePrice: 1200, pricePerKm: 250 },
    'SafariJeep': { type: 'SUV', passengers: 6, basePrice: 2000, pricePerKm: 250 } 
};

const PROVIDER_NAMES = ["Saman", "Ajith", "Pradeep", "Nuwan", "Chathura", "Dinesh", "Kasun", "Roshan", "Tharindu", "Gayan"];
const COMPANY_SUFFIXES = ["Cabs", "Travels", "Tours", "Transports", "Rides"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateTransportData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected to DB. Starting Transport Seeding...');

        // --- CLEANUP SECTION ---
        console.log('🧹 Cleaning up old dummy transport providers...');
        
        // Find users created by this script (using the specific email domain pattern)
        const usersToDelete = await User.find({ email: { $regex: /@yopmail\.com$/ } });
        
        if (usersToDelete.length > 0) {
            const userIds = usersToDelete.map(u => u._id);
            
            // Delete associated TransportProfiles first
            const deletedProviders = await TransportProvider.deleteMany({ userId: { $in: userIds } });
            
            // Delete the User accounts
            const deletedUsers = await User.deleteMany({ _id: { $in: userIds } });
            
            console.log(`🗑️  Removed ${deletedUsers.deletedCount} old users and ${deletedProviders.deletedCount} provider profiles.`);
        } else {
            console.log('✨ No old dummy data found to clean.');
        }
        // -----------------------

        let count = 0;
        const districtKeys = Object.keys(LOCATIONS);

        // Loop through locations to ensure distribution
        for (const district of districtKeys) {
            const cities = LOCATIONS[district];
            
            for (const loc of cities) {
                // Determine how many providers per city (1 to 2)
                const numProviders = Math.floor(Math.random() * 2) + 1;

                for (let k = 0; k < numProviders; k++) {
                    
                    // 1. Determine Vehicle Type based on location
                    let vehicleKey = 'Car';
                    const rand = Math.random();

                    if (['Hambantota', 'Monaragala', 'Ratnapura'].includes(district) && Math.random() > 0.6) {
                        vehicleKey = 'SafariJeep'; 
                    } else if (['Colombo', 'Gampaha', 'Kandy'].includes(district) && Math.random() > 0.5) {
                        vehicleKey = Math.random() > 0.5 ? 'Car' : 'TukTuk';
                    } else if (['Galle', 'Matara', 'Ampara'].includes(district)) {
                        vehicleKey = Math.random() > 0.7 ? 'Van' : 'TukTuk'; 
                    } else {
                        if (rand < 0.4) vehicleKey = 'TukTuk';
                        else if (rand < 0.7) vehicleKey = 'Car';
                        else vehicleKey = 'Van';
                    }

                    const vehicleDetails = VEHICLES[vehicleKey];

                    // 2. Create User
                    const name = `${pick(PROVIDER_NAMES)} ${vehicleKey} ${loc.city}`;
                    const email = `transport_${loc.city.replace(/\s+/g, '').toLowerCase()}_${count}@yopmail.com`;

                    // NOTE: Passing plain text password. Your User model's pre-save hook should handle the hashing.
                    const user = await User.create({
                        fullName: name,
                        email: email,
                        password: 'password123', 
                        role: 'TransportProvider',
                        phoneNumber: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
                        emailVerified: true,
                        countryOfResidence: 'Sri Lanka',
                        preferredLanguage: 'English'
                    });

                    // 3. Create Transport Provider Profile
                    await TransportProvider.create({
                        userId: user._id,
                        vehicleType: vehicleDetails.type,
                        vehicleModel: vehicleKey === 'TukTuk' ? 'Bajaj RE' : (vehicleKey === 'Car' ? 'Toyota Prius' : 'Toyota KDH'),
                        vehicleRegistrationNo: `${['WP', 'SP', 'CP', 'UP'][Math.floor(Math.random()*4)]} ${['CAA', 'CAB', 'BCC', 'PH'][Math.floor(Math.random()*4)]}-${Math.floor(1000 + Math.random() * 9000)}`,
                        licenseNumber: `DL-${Math.floor(1000000 + Math.random() * 9000000)}`,
                        maxPassengers: vehicleDetails.passengers,
                        basePrice: vehicleDetails.basePrice,
                        pricePerKm: vehicleDetails.pricePerKm,
                        description: `Reliable ${vehicleDetails.type} service in ${loc.city}. Comfortable rides for tourists.`,
                        location: {
                            address: `Main Stand, ${loc.city}`,
                            city: loc.city,
                            district: district,
                            type: 'Point',
                            coordinates: [loc.lng, loc.lat]
                        },
                        images: [],
                        verificationStatus: 'Approved',
                        isActive: true
                    });
                    
                    count++;
                    console.log(`🚖 Added ${vehicleDetails.type} in ${loc.city}`);
                }
            }
        }

        console.log(`🎉 Successfully added ${count} Transport Providers with password: password123`);
        process.exit();

    } catch (error) {
        console.error('❌ Transport Seeding Error:', error);
        process.exit(1);
    }
};

generateTransportData();