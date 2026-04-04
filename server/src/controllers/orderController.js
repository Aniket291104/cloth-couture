import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        couponCode,
        discountAmount,
        pointsSpent,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
        userId: req.user._id,
        items: orderItems,
        address: shippingAddress,
        paymentMethod,
        paymentStatus: 'Pending',
        totalAmount: totalPrice,
        couponCode: couponCode || '',
        discountAmount: discountAmount || 0,
        pointsSpent: pointsSpent || 0,
        pointsValue: (pointsSpent || 0) * 0.02, // 100 coins = 2rs
        pointsEarned: Math.floor(totalPrice * 0.02), // 2 coins per 100 rs (2% back)
    });

    if (pointsSpent > 0) {
        const user = await User.findById(req.user._id);
        if (user.loyaltyPoints < pointsSpent) {
            return res.status(400).json({ message: 'Insufficient loyalty points' });
        }
        user.loyaltyPoints -= pointsSpent;
        await user.save();
    }

    const createdOrder = await order.save();

    // Update product stock
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock = product.stock >= item.qty ? product.stock - item.qty : 0;
            await product.save();
        }
    }

    res.status(201).json(createdOrder);
};

// @desc    Create Razorpay order
// @route   POST /api/orders/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
    const { amount } = req.body;
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const options = {
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency });
};

// @desc    Verify Razorpay payment & mark order paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // If razorpay data provided, verify signature
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        const expectedSig = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        if (expectedSig !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
    }

    order.paymentStatus = 'Paid';
    order.paidAt = new Date();
    
    // Reward loyalty points to user
    const user = await User.findById(order.userId);
    if (user) {
        user.loyaltyPoints += order.pointsEarned;
        await user.save();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('userId', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    if (status === 'Delivered') {
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'COD') {
            order.paymentStatus = 'Paid';
        }
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
};

// @desc    Update order to delivered (Admin) — kept for backward compat
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        order.orderStatus = 'Delivered';
        order.deliveredAt = new Date();
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get order analytics (Admin)
// @route   GET /api/orders/analytics
// @access  Private/Admin
export const getOrderAnalytics = async (req, res) => {
    const orders = await Order.find({});
    const totalRevenue = orders.filter(o => o.paymentStatus === 'Paid').reduce((acc, o) => acc + o.totalAmount, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;

    // Monthly revenue for last 6 months
    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthOrders = orders.filter(o => {
            const created = new Date(o.createdAt);
            return created >= d && created <= monthEnd && o.paymentStatus === 'Paid';
        });
        monthlyRevenue.push({
            month: d.toLocaleString('default', { month: 'short' }),
            revenue: monthOrders.reduce((acc, o) => acc + o.totalAmount, 0),
            orders: monthOrders.length,
        });
    }

    res.json({ totalRevenue, totalOrders, pendingOrders, deliveredOrders, monthlyRevenue });
};

// @desc    Validate coupon
// @route   POST /api/orders/validate-coupon
// @access  Private
export const validateCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body;
        if (!code) return res.status(400).json({ message: 'Coupon code is required' });
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon) return res.status(404).json({ message: 'Valid coupon not found' });
        
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Coupon expired' });
        }
        
        if (coupon.minOrderAmount > amount) {
            return res.status(400).json({ message: `Min order for this coupon is ₹${coupon.minOrderAmount}` });
        }
        
        if (coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ message: 'Coupon limit reached' });
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (amount * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue;
        }
        res.json({ discount: Math.round(discount), message: 'Coupon applied successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Coupon validation failed' });
    }
};
