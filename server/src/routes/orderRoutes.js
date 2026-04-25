import express from 'express';
import {
    addOrderItems, getOrderById, updateOrderToPaid, getOrders,
    updateOrderToDelivered, getMyOrders, updateOrderStatus,
    getOrderAnalytics, createRazorpayOrder, validateCoupon,
    cancelOrder, updateOrderAddress, requestReturnOrReplacement,
    addOrderHelpRequest, updateReturnRequestStatus, updateHelpRequestStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/analytics').get(protect, admin, getOrderAnalytics);
router.route('/razorpay').post(protect, createRazorpayOrder);
router.route('/validate-coupon').post(protect, validateCoupon);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/address').put(protect, updateOrderAddress);
router.route('/:id/return').post(protect, requestReturnOrReplacement);
router.route('/:id/return-status').put(protect, admin, updateReturnRequestStatus);
router.route('/:id/help').post(protect, addOrderHelpRequest);
router.route('/:id/help/:requestId/status').put(protect, admin, updateHelpRequestStatus);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
