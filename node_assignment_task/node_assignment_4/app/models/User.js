const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' }
}, { timestamps: true });



const UserModel = mongoose.model('User', userSchema);


module.exports = UserModel
