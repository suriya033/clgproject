const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SportsEvent = require('../models/SportsEvent');
const SportsTeam = require('../models/SportsTeam');

// --- Events ---

// @route   GET api/sports/events
// @desc    Get all sports events
// @access  Public/Private
router.get('/events', auth(), async (req, res) => {
    try {
        const events = await SportsEvent.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/sports/events
// @desc    Create a sports event
// @access  Private (Admin/Sports)
router.post('/events', auth(['Admin', 'Sports', 'Office']), async (req, res) => {
    try {
        const newEvent = new SportsEvent(req.body);
        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/sports/events/:id
// @desc    Update a sports event
// @access  Private (Admin/Sports)
router.put('/events/:id', auth(['Admin', 'Sports', 'Office']), async (req, res) => {
    try {
        const event = await SportsEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/sports/events/:id
// @desc    Delete a sports event
// @access  Private (Admin/Sports)
router.delete('/events/:id', auth(['Admin', 'Sports', 'Office']), async (req, res) => {
    try {
        await SportsEvent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- Teams ---

// @route   GET api/sports/teams
// @desc    Get all sports teams
// @access  Public/Private
router.get('/teams', auth(), async (req, res) => {
    try {
        const teams = await SportsTeam.find().sort({ name: 1 });
        res.json(teams);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/sports/teams
// @desc    Create a sports team
// @access  Private (Admin/Sports)
router.post('/teams', auth(['Admin', 'Sports', 'Office']), async (req, res) => {
    try {
        const newTeam = new SportsTeam(req.body);
        const team = await newTeam.save();
        res.json(team);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/sports/teams/:id
// @desc    Update a sports team
// @access  Private (Admin/Sports)
router.put('/teams/:id', auth(['Admin', 'Sports', 'Office']), async (req, res) => {
    try {
        const team = await SportsTeam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/sports/teams/:id
// @desc    Delete a sports team
// @access  Private (Admin/Sports)
router.delete('/teams/:id', auth(['Admin', 'Sports', 'Office']), async (req, res) => {
    try {
        await SportsTeam.findByIdAndDelete(req.params.id);
        res.json({ message: 'Team deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
