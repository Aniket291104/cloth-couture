import express from 'express';
import {
    getProducts, getProductById, createProduct, updateProduct,
    deleteProduct, createProductReview, getProductReviews, getRelatedProducts,
    getProductSuggestions, getCategories
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/suggestions').get(getProductSuggestions);
router.route('/categories').get(getCategories);
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);
router.route('/:id/reviews').get(getProductReviews).post(protect, createProductReview);
router.route('/:id/related').get(getRelatedProducts);

export default router;
