const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Super Admin', 'User']
    }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
