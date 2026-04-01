import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirnameSrv = path.dirname(__filename);

dotenv.config({ path: path.join(__dirnameSrv, '../.env') });
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map(u => u.trim());

app.use(cors({ 
    origin: allowedOrigins, 
    credentials: true 
}));
app.use(morgan('dev'));
app.use(helmet());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/coupons', couponRoutes);

const __dirname = path.resolve();
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
