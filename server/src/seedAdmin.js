import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

connectDB();

const importAdmin = async () => {
    try {
        await User.deleteMany({ email: 'admin@clothcouture.com' });

        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@clothcouture.com',
            password: 'password123',
            role: 'admin',
        });

        await adminUser.save();
        console.log('✅ Admin user created: admin@clothcouture.com / password123');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importAdmin();
