import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; // ඔයාගේ User model එක තියෙන තැන හරියට බලන්න

dotenv.config();

// ඔයා එවපු ලිස්ට් එක (Emails Array)
const TARGET_EMAILS = [
    "french_demo@yopmail.com",
    "german_demo@yopmail.com",
    "gsilva@yopmail.com",
    "gperera@yopmail.com",
    "tfrench@yopmail.com",
    "tgerman@yopmail.com",
    "tchina@yopmail.com",
    "guide_nuwaraeliya@yopmail.com",
    "guide_hatton@yopmail.com",
    "guide_talawakele@yopmail.com",
    "guide_kandycity@yopmail.com",
    "guide_peradeniya@yopmail.com",
    "guide_gampola@yopmail.com",
    "guide_sigiriya@yopmail.com",
    "guide_dambulla@yopmail.com",
    "guide_mataletown@yopmail.com",
    "guide_ella@yopmail.com",
    "guide_bandarawela@yopmail.com",
    "guide_haputale@yopmail.com",
    "guide_gallefort@yopmail.com",
    "guide_hikkaduwa@yopmail.com",
    "guide_elpitiya@yopmail.com",
    "guide_mirissa@yopmail.com",
    "guide_weligama@yopmail.com",
    "guide_deniyaya@yopmail.com",
    "guide_tissamaharama@yopmail.com",
    "guide_tangalle@yopmail.com",
    "guide_kataragama@yopmail.com",
    "guide_buttala@yopmail.com",
    "guide_ratnapuracity@yopmail.com",
    "guide_balangoda@yopmail.com",
    "guide_embilipitiya@yopmail.com",
    "guide_pinnawala@yopmail.com",
    "guide_kitulgala@yopmail.com",
    "guide_anuradhapura@yopmail.com",
    "guide_kekirawa@yopmail.com",
    "guide_trincomalee@yopmail.com",
    "guide_nilaveli@yopmail.com",
    "guide_pasikudah@yopmail.com",
    "guide_kalpitiya@yopmail.com",
    "guide_avissawella@yopmail.com",
    "guide_homagama@yopmail.com",
    "guide_negombo@yopmail.com",
    "guide_mirigama@yopmail.com",
    "guide_horana@yopmail.com",
    "guide_bentota@yopmail.com",
    "guide_kurunegala@yopmail.com",
    "guide_yapahuwa@yopmail.com",
    "guide_arugambay@yopmail.com"
];

const updatePasswordList = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        // 1. Password එක Hash කරගමු
        const newPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`🎯 Updating passwords for ${TARGET_EMAILS.length} specific users...`);

        // 2. ඔයා දුන්න ලිස්ට් එකේ අයට විතරක් Password Update කිරීම
        const result = await User.updateMany(
            { email: { $in: TARGET_EMAILS } }, // $in මගින් මේ ලිස්ට් එකේ ඉන්න අය විතරක් තෝරනවා
            { $set: { password: hashedPassword } }
        );

        console.log('------------------------------------------------');
        console.log(`✅ Success! Found & Updated Users: ${result.modifiedCount}`);
        
        // හරියටම ඔක්කොම update වුනාද බලන්න check එකක්
        if (result.modifiedCount < TARGET_EMAILS.length) {
            console.log(`⚠️ Warning: සමහර ඊමේල් වලට අදාල Users ලා Database එකේ නැතිව ඇති.`);
            console.log(`Expected: ${TARGET_EMAILS.length}, Updated: ${result.modifiedCount}`);
        } else {
            console.log(`🎉 All ${TARGET_EMAILS.length} users updated successfully!`);
        }
        console.log('------------------------------------------------');

        process.exit();

    } catch (error) {
        console.error('❌ Error updating passwords:', error);
        process.exit(1);
    }
};

updatePasswordList();