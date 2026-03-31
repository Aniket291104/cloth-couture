import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({});
        const totalOrders = await Order.countDocuments({});
        const totalUsers = await User.countDocuments({});

        // Calculate total sales
        const orders = await Order.find({});
        const totalSales = orders.reduce((acc, item) => acc + item.totalAmount, 0);

        // Get recent orders
        const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name email');

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalSales: Number(totalSales.toFixed(2)),
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
