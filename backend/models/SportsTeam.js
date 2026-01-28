const mongoose = require('mongoose');

const SportsTeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    captain: { type: String, required: true },
    members: { type: Number, default: 0 },
    players: [{ type: String }], // Array of student names or IDs
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SportsTeam', SportsTeamSchema);
