import express from 'express';
import Subscriber from '../models/Subscriber.js';

const router = express.Router();

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    try {
        const existing = await Subscriber.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: 'This email is already subscribed!' });
        }

        const subscriber = new Subscriber({ email });
        await subscriber.save();

        res.status(201).json({ message: 'Successfully subscribed! Welcome to the club.' });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// @desc    Get all subscribers (Admin only - for viewing)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
router.get('/subscribers', async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// @desc    Delete a subscriber (Admin only)
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
router.delete('/subscribers/:id', async (req, res) => {
    try {
        const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
        if (!subscriber) {
            return res.status(404).json({ message: 'Subscriber not found.' });
        }
        res.json({ message: 'Subscriber removed.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
