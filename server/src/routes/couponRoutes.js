import express from 'express';
import { validateCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/:id').delete(protect, admin, deleteCoupon);

export default router;
