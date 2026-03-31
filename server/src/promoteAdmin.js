import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const promoteUser = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide a user email: node src/promoteAdmin.js <email>');
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`User ${email} has been promoted to admin successfully.`);
        } else {
            console.error(`User with email ${email} not found.`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

promoteUser();
