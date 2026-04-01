import Product from '../models/Product.js';
import Review from '../models/Review.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    const keyword = req.query.keyword
        ? { name: { $regex: req.query.keyword, $options: 'i' } }
        : {};
    const category = req.query.category ? { category: req.query.category } : {};
    const color = req.query.color ? { colors: req.query.color } : {};

    // Price range filter
    let priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
        priceFilter.price = {};
        if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
    }

    // Size filter
    const size = req.query.size ? { sizes: req.query.size } : {};

    const products = await Product.find({ ...keyword, ...category, ...color, ...priceFilter, ...size });
    res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Get products by same category (related)
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
    }).limit(4);
    res.json(related);
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    const { name, price, description, images, category, countInStock, sizes, colors } = req.body;
    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : []);
    const colorsArray = Array.isArray(colors) ? colors : (colors ? colors.split(',').map(c => c.trim()) : []);
    const stock = countInStock ? Number(countInStock) : 0;
    const priceNum = price ? Number(price) : 0;
    const productImages = images && Array.isArray(images) && images.length > 0 ? images : req.body.image ? [req.body.image] : [];
    if (productImages.length < 2 || productImages.length > 10) {
        return res.status(400).json({ message: 'A minimum of 2 and maximum of 10 images are required.' });
    }
    const product = new Product({
        name: name || 'Sample name',
        price: priceNum,
        images: productImages,
        category: category || 'Sample category',
        stock,
        sizes: sizesArray,
        colors: colorsArray,
        description: description || 'Sample description',
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    const { name, price, description, images, category, countInStock, sizes, colors } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
        let newImages = images || product.images;
        if (newImages.length < 2 || newImages.length > 10) {
            return res.status(400).json({ message: 'A minimum of 2 and maximum of 10 images are required.' });
        }
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.images = newImages;
        product.category = category || product.category;
        product.stock = countInStock !== undefined ? countInStock : product.stock;
        if (sizes) {
            product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim());
        }
        if (colors !== undefined) {
            product.colors = Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim());
        }
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({ productId: req.params.id, userId: req.user._id });
    if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
        userId: req.user._id,
        productId: req.params.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    });
    await review.save();

    // Update product rating
    const allReviews = await Review.find({ productId: req.params.id });
    product.numReviews = allReviews.length;
    product.rating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    await product.save();

    res.status(201).json({ message: 'Review added' });
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
};
