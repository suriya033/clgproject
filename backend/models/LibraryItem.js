const mongoose = require('mongoose');

const LibraryItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    isbn: {
        type: String
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LibraryItem', LibraryItemSchema);
