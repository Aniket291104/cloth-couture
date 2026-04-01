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
        const email    = process.env.ADMIN_EMAIL    || 'admin@clothcouture.com';
        const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
        const name     = process.env.ADMIN_NAME     || 'Admin User';

        await User.deleteMany({ email });

        const adminUser = new User({
            name,
            email,
            password,
            role: 'admin',
        });

        await adminUser.save();
        console.log(`✅ Admin user created!`);
        console.log(`   Email   : ${email}`);
        console.log(`   Password: ${password}`);
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importAdmin();
