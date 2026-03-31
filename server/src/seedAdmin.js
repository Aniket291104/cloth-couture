import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importAdmin = async () => {
    try {
        await User.deleteMany({ email: 'admin@clothcouture.com' }); // Ensure no duplicate
        
        // Don't hash password here because userSchema.pre('save') handles hashing
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@clothcouture.com',
            password: 'password123',
            role: 'admin',
        });

        await adminUser.save();
        console.log('Admin user created: admin@clothcouture.com / password123');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importAdmin();
