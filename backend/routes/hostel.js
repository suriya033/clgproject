const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HostelRoom = require('../models/HostelRoom');

// @route   GET api/hostel/rooms
// @desc    Get all hostel rooms
// @access  Public/Private
router.get('/rooms', auth(), async (req, res) => {
    try {
        const rooms = await HostelRoom.find().sort({ number: 1 });
        res.json(rooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/hostel/rooms
// @desc    Create a hostel room
// @access  Private (Admin/Hostel)
router.post('/rooms', auth(['Admin', 'Hostel', 'Office']), async (req, res) => {
    try {
        const { number } = req.body;
        let room = await HostelRoom.findOne({ number });
        if (room) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const newRoom = new HostelRoom(req.body);
        room = await newRoom.save();
        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/hostel/rooms/:id
// @desc    Update a hostel room
// @access  Private (Admin/Hostel)
router.put('/rooms/:id', auth(['Admin', 'Hostel', 'Office']), async (req, res) => {
    try {
        // Calculate occupied based on students array length if passed
        if (req.body.students) {
            req.body.occupied = req.body.students.length;
        }

        const room = await HostelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/hostel/rooms/:id
// @desc    Delete a hostel room
// @access  Private (Admin/Hostel)
router.delete('/rooms/:id', auth(['Admin', 'Hostel', 'Office']), async (req, res) => {
    try {
        await HostelRoom.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
