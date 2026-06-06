import dotenv from 'dotenv';
import User from './models/User.js'; // User Model එක තිබෙන තැන අනුව මෙය වෙනස් කරගන්න
import connectDB from './config/db.js'; // DB Connection එක තිබෙන තැන

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const importData = async () => {
    try {
        // ලැයිස්තුගත කර ඇති රටවල් සහ ඒවාට අදාළ භාෂාවන් (System Enum එකට අනුව)
        const countriesConfig = [
            { country: 'France', lang: 'French' },
            { country: 'Germany', lang: 'German' },
            { country: 'China', lang: 'Chinese' },
            { country: 'Japan', lang: 'Japanese' },
            { country: 'India', lang: 'Hindi' },
            { country: 'Australia', lang: 'English' },
            { country: 'Korea', lang: 'Korean' }, // 'Korea' in enum
            { country: 'Russia', lang: 'Russian' },
            { country: 'Netherlands', lang: 'Dutch' },
            { country: 'USA', lang: 'English' },
            { country: 'UK', lang: 'English' },
            { country: 'Italy', lang: 'Italian' },
            { country: 'Canada', lang: 'English' },
            { country: 'Switzerland', lang: 'German' },
            { country: 'Bangladesh', lang: 'Bengali' }
        ];

        let startNumber = 7; // tourist07 ගෙන් පටන් ගැනීමට
        let tourists = [];

        console.log(`🚀 Starting to seed tourists from ${startNumber}...`.cyan);

        // එක් රටකට 5 බැගින් Touristලා සෑදීම
        for (const config of countriesConfig) {
            console.log(`Processing ${config.country}...`);
            
            for (let i = 0; i < 5; i++) {
                // ඉලක්කම හැමවිටම ඉලක්කම් දෙකකින් තබා ගැනීම (07, 08, etc.)
                const idSuffix = startNumber.toString().padStart(2, '0');
                
                const tourist = {
                    fullName: `Tourist ${idSuffix} - ${config.country}`,
                    email: `tourist${idSuffix}@yopmail.com`,
                    password: 'password123', // Pre-save hook එකෙන් මෙය hash වේ
                    phoneNumber: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`,
                    role: 'Tourist',
                    countryOfResidence: config.country,
                    preferredLanguage: config.lang,
                    emailVerified: true, // Login වීමට පහසුවට Verified ලෙස දමමු
                    accountStatus: 'Active'
                };

                // Create user using Mongoose (Triggers pre-save hook for password hashing)
                await User.create(tourist);
                
                startNumber++;
            }
        }

        console.log(`✅ Successfully added ${(startNumber - 7)} tourists!`.green.inverse);
        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

// Script එක ක්‍රියාත්මක කිරීම
importData();