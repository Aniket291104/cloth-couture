import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import products from './data/products.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

connectDB();

const importData = async () => {
    try {
        await Product.deleteMany();
        await Product.insertMany(products);
        console.log(`✅ ${products.length} Products seeded to MongoDB Atlas!`);
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
