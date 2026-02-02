const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { userId, password } = req.body;

    try {
        console.log(`Login attempt for userId: ${userId}`);
        const user = await User.findOne({ userId });
        if (!user) {
            console.log(`User not found: ${userId}`);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        console.log(`User found: ${user.userId}, comparing password...`);
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Password mismatch for user: ${userId}`);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Contact Admin.' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                name: user.name
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        userId: user.userId,
                        name: user.name,
                        role: user.role,
                        email: user.email,
                        department: user.department,
                        mobileNo: user.mobileNo
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
