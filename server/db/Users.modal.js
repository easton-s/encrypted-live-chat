const mongoose = require('mongoose');

module.exports = mongoose.model('users', new mongoose.Schema({
    publicKey: {
        type: String,
        required: true
    },
    socketId: {
        type: String,
        required: true
    }
}));
