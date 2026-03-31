import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    // Basic search and filter
    const keyword = req.query.keyword
        ? { name: { $regex: req.query.keyword, $options: 'i' } }
        : {};
        
    const category = req.query.category ? { category: req.query.category } : {};

    const products = await Product.find({ ...keyword, ...category });
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

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    const { name, price, description, images, category, countInStock, sizes } = req.body;
    
    // Convert comma separated sizes string to array if needed
    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : []);
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
        stock: stock,
        sizes: sizesArray,
        description: description || 'Sample description',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    const { name, price, description, images, category, countInStock, sizes } = req.body;
    
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
