const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")
const crypto = require('crypto');
const sendEmail = require('../utils/email');

class AuthController {
    async signup(req, res) {
        try {
            const { email, password } = req.body;
            const userExists = await User.findOne({ email });
            if (userExists) return res.status(400).json({ message: 'User already exists' });

            const verificationToken = crypto.randomBytes(20).toString('hex');
            
            const user = await User.create({
                 email,
                 password: await bcrypt.hash(password,10) ,
                 verificationToken
                });

            const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
            const message = `Please verify your email by clicking: ${verifyUrl}`;

            await sendEmail({ email: user.email, subject: 'Email Verification', message });

            res.status(201).json({ success: true, message: 'Signup successful. Check email for verification.' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async verifyEmail(req, res) {
        try {
            const user = await User.findOne({ verificationToken: req.params.token });
            if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

            user.isVerified = true;
            user.verificationToken = undefined;
            await user.save();

            res.status(200).json({ success: true, message: 'Email verified successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user || !bcrypt.compare(password, user.password)) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email first' });

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.status(200).json({ success: true, token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new AuthController();
