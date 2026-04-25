import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const RETURN_WINDOW_DAYS = 7;
const ORDER_ACTION_STATUSES = ['Pending', 'Processing'];

const canAccessOrder = (order, user) => (
    user?.role === 'admin' || order.userId?.toString() === user?._id?.toString()
);

const restoreOrderStock = async (items = []) => {
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.qty;
            await product.save();
        }
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            couponCode,
            discountAmount,
            pointsSpent,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.phone) {
            return res.status(400).json({ message: 'Complete shipping address and phone number are required' });
        }

        if (!['Razorpay', 'COD'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        const normalizedItems = orderItems.map((item) => ({
            ...item,
            size: item.size || 'Free Size',
            color: item.color || '',
        }));

        const order = new Order({
            userId: req.user._id,
            items: normalizedItems,
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
        for (const item of normalizedItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock = product.stock >= item.qty ? product.stock - item.qty : 0;
                await product.save();
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message || 'Order creation failed' });
    }
};

// @desc    Create Razorpay order
// @route   POST /api/orders/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Valid order amount is required' });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: 'Razorpay is not configured. Please use Cash on Delivery.' });
        }

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
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ message: error.error?.description || error.message || 'Razorpay order creation failed' });
    }
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
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!canAccessOrder(order, req.user)) return res.status(403).json({ message: 'Not authorized to view this order' });
    res.json(order);
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

// @desc    Cancel an order before it ships
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!canAccessOrder(order, req.user)) return res.status(403).json({ message: 'Not authorized to cancel this order' });

        if (!ORDER_ACTION_STATUSES.includes(order.orderStatus)) {
            return res.status(400).json({ message: 'Only pending or processing orders can be cancelled' });
        }

        order.orderStatus = 'Cancelled';
        order.cancellationReason = req.body.reason || 'Cancelled by customer';
        order.cancelledAt = new Date();
        if (order.paymentStatus === 'Paid') {
            order.paymentStatus = 'Refund Pending';
        }

        await restoreOrderStock(order.items);
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: error.message || 'Could not cancel order' });
    }
};

// @desc    Update shipping address before shipment
// @route   PUT /api/orders/:id/address
// @access  Private
export const updateOrderAddress = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!canAccessOrder(order, req.user)) return res.status(403).json({ message: 'Not authorized to update this order' });

        if (!ORDER_ACTION_STATUSES.includes(order.orderStatus)) {
            return res.status(400).json({ message: 'Address can only be changed before shipment' });
        }

        const { address, city, postalCode, country, phone, alternatePhone } = req.body;
        if (!address || !city || !postalCode || !phone) {
            return res.status(400).json({ message: 'Address, city, postal code and phone are required' });
        }

        order.address = {
            address,
            city,
            postalCode,
            country: country || order.address.country || 'India',
            phone,
            alternatePhone: alternatePhone || '',
        };
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order address error:', error);
        res.status(500).json({ message: error.message || 'Could not update address' });
    }
};

// @desc    Request return or replacement within 7 days of delivery
// @route   POST /api/orders/:id/return
// @access  Private
export const requestReturnOrReplacement = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!canAccessOrder(order, req.user)) return res.status(403).json({ message: 'Not authorized for this order' });

        const { type, reason } = req.body;
        if (!['Return', 'Replacement'].includes(type)) {
            return res.status(400).json({ message: 'Choose return or replacement' });
        }
        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }
        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ message: 'Return or replacement is available only after delivery' });
        }

        const deliveredAt = order.deliveredAt || order.updatedAt || order.createdAt;
        const daysSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
            return res.status(400).json({ message: 'The 7 day return and replacement window has ended' });
        }
        if (order.returnRequest?.status && order.returnRequest.status !== 'None') {
            return res.status(400).json({ message: 'A return or replacement request already exists for this order' });
        }

        order.returnRequest = {
            type,
            reason,
            status: 'Requested',
            requestedAt: new Date(),
        };
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Return request error:', error);
        res.status(500).json({ message: error.message || 'Could not submit request' });
    }
};

// @desc    Add help request to an order
// @route   POST /api/orders/:id/help
// @access  Private
export const addOrderHelpRequest = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!canAccessOrder(order, req.user)) return res.status(403).json({ message: 'Not authorized for this order' });

        const { topic, message } = req.body;
        if (!topic || !message) {
            return res.status(400).json({ message: 'Topic and message are required' });
        }

        order.supportRequests.push({ topic, message });
        const updatedOrder = await order.save();
        res.status(201).json(updatedOrder);
    } catch (error) {
        console.error('Help request error:', error);
        res.status(500).json({ message: error.message || 'Could not submit help request' });
    }
};

// @desc    Update return or replacement request status (Admin)
// @route   PUT /api/orders/:id/return-status
// @access  Private/Admin
export const updateReturnRequestStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const { status } = req.body;
        if (!['Requested', 'Approved', 'Rejected', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid return request status' });
        }
        if (!order.returnRequest?.status || order.returnRequest.status === 'None') {
            return res.status(400).json({ message: 'No return or replacement request found' });
        }

        order.returnRequest.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update return status error:', error);
        res.status(500).json({ message: error.message || 'Could not update return request' });
    }
};

// @desc    Update order help request status (Admin)
// @route   PUT /api/orders/:id/help/:requestId/status
// @access  Private/Admin
export const updateHelpRequestStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const request = order.supportRequests.id(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Help request not found' });

        const { status } = req.body;
        if (!['Open', 'In Review', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid help request status' });
        }

        request.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update help request error:', error);
        res.status(500).json({ message: error.message || 'Could not update help request' });
    }
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
