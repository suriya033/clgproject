const mongoose = require('mongoose');

const HostelRoomSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ['AC', 'Non-AC'], default: 'Non-AC' },
    occupied: { type: Number, default: 0 },
    students: [{ type: String }], // Array of student names or IDs
    block: { type: String }, // Optional: Hostel Block (A, B, C)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HostelRoom', HostelRoomSchema);
