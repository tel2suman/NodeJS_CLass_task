const User = require('../models/User');

class UserController {
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { bio } = req.body;
            const updateData = { bio };
            if (req.file) {
                updateData.profilePicture = `/uploads/${req.file.filename}`;
            }

            const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new UserController();
