const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true
    },
    route: {
        type: String,
        required: true
    },
    driverName: String,
    driverContact: String,
    capacity: Number,
    stops: [{
        name: String,
        time: String
    }],
    location: {
        lat: Number,
        lng: Number,
        lastUpdated: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Bus', BusSchema);
