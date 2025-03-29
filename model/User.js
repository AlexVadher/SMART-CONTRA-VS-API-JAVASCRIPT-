const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    walletAddress: {
        type: String,
        unique: true,
        required: true,
    },
    role: {
        type: String, // landlord o tenant
        enum: ['landlord', 'tenant'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
