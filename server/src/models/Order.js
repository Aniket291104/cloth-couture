import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    items: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            size: { type: String, required: true },
            color: { type: String, default: '' },
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'Pending',
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    cancellationReason: { type: String, default: '' },
    cancelledAt: { type: Date },
    returnRequest: {
        type: {
            type: String,
            enum: ['Return', 'Replacement', ''],
            default: '',
        },
        reason: { type: String, default: '' },
        status: {
            type: String,
            enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed'],
            default: 'None',
        },
        requestedAt: { type: Date },
    },
    supportRequests: [
        {
            topic: { type: String, required: true },
            message: { type: String, required: true },
            status: {
                type: String,
                enum: ['Open', 'In Review', 'Resolved'],
                default: 'Open',
            },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    address: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true, default: '' },
        alternatePhone: { type: String, default: '' },
    },
    couponCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    pointsSpent: { type: Number, default: 0 },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
