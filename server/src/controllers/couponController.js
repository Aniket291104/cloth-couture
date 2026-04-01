import Coupon from '../models/Coupon.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return res.status(400).json({ message: 'Coupon has expired' });
    }
    if (coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    if (orderAmount < coupon.minOrderAmount) {
        return res.status(400).json({ message: `Minimum order amount ₹${coupon.minOrderAmount} required` });
    }
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
    } else {
        discountAmount = coupon.discountValue;
    }
    res.json({ valid: true, discountAmount, discountType: coupon.discountType, discountValue: coupon.discountValue, code: coupon.code });
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
};

// @desc    Create a coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
    const coupon = new Coupon(req.body);
    const created = await coupon.save();
    res.status(201).json(created);
};

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
};
