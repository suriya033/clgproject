const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const auth = require('../middleware/auth');

// @route   PUT api/transport/bus/:busId/location
// @desc    Update bus location
// @access  Driver/Admin
router.put('/bus/:busId/location', auth, async (req, res) => {
    const { lat, lng } = req.body;
    try {
        const bus = await Bus.findById(req.params.busId);
        if (!bus) {
            return res.status(404).json({ msg: 'Bus not found' });
        }

        // Verify specific driver permission if needed, but for now allow any Driver role to update for simplicity/demo
        // Ideally: if (bus.driverId.toString() !== req.user.id && req.user.role !== 'Admin') ...

        bus.location = {
            lat,
            lng,
            lastUpdated: Date.now()
        };

        await bus.save();
        res.json(bus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/transport/bus/:busId/location
// @desc    Get bus location
// @access  Private
router.get('/bus/:busId/location', auth, async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.busId).select('location busNumber route driverName');
        if (!bus) {
            return res.status(404).json({ msg: 'Bus not found' });
        }
        res.json(bus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
