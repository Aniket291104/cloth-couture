import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    sizes: {
        type: [String],
        required: true,
    },
    colors: {
        type: [String],
        default: [],
    },
    images: {
        type: [String],
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Add text index for search
productSchema.index({ name: 'text', description: 'text' });
// Add index for category filtering
productSchema.index({ category: 1 });
// Add index for price sorting/filtering
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
