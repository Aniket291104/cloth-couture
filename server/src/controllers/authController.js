import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user / set token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        const token = generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            addressBook: user.addressBook,
            preferences: user.preferences,
            avatar: user.avatar,
            loyaltyPoints: user.loyaltyPoints,
            token,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    const user = await User.create({ name, email, password });
    if (user) {
        const token = generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            addressBook: user.addressBook || [],
            preferences: user.preferences || {},
            avatar: user.avatar || '',
            loyaltyPoints: user.loyaltyPoints || 0,
            token,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
    if (req.body.addressBook) {
        user.addressBook = req.body.addressBook;
    }
    if (req.body.preferences) {
        user.preferences = { ...user.preferences, ...req.body.preferences };
    }
    if (req.body.password) {
        user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = generateToken(res, updatedUser._id);
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        addressBook: updatedUser.addressBook,
        preferences: updatedUser.preferences,
        avatar: updatedUser.avatar,
        loyaltyPoints: updatedUser.loyaltyPoints,
        token,
    });
};
