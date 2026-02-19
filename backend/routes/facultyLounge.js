const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FacultyPost = require('../models/FacultyPost');
const multer = require('multer');
const path = require('path');

// Multer Config for Lounge
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/lounge/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// @route   POST api/faculty-lounge/posts
// @desc    Create a post in faculty lounge
// @access  Private (Staff/HOD/Admin)
router.post('/posts', auth(['Staff', 'HOD', 'Admin']), upload.array('attachments', 5), async (req, res) => {
    try {
        const { title, content, category } = req.body;

        let attachments = [];
        if (req.files) {
            attachments = req.files.map(file => ({
                url: `${req.protocol}://${req.get('host')}/uploads/lounge/${file.filename}`,
                name: file.originalname,
                type: file.mimetype
            }));
        }

        const newPost = new FacultyPost({
            title,
            content,
            category,
            attachments,
            author: req.user.id
        });

        await newPost.save();
        const populatedPost = await FacultyPost.findById(newPost._id).populate('author', 'name photo role department');
        res.json(populatedPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/faculty-lounge/posts
// @desc    Get all lounge posts
// @access  Private (Staff/HOD/Admin/Office)
router.get('/posts', auth(['Staff', 'HOD', 'Admin', 'Office']), async (req, res) => {
    try {
        const posts = await FacultyPost.find()
            .populate('author', 'name photo role department')
            .populate('comments.author', 'name photo')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/faculty-lounge/posts/:id/comment
// @access  Private
router.post('/posts/:id/comment', auth(['Staff', 'HOD', 'Admin', 'Office']), async (req, res) => {
    try {
        const post = await FacultyPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = {
            author: req.user.id,
            authorName: req.user.name,
            content: req.body.content
        };

        post.comments.push(newComment);
        await post.save();

        const updatedPost = await FacultyPost.findById(req.params.id)
            .populate('author', 'name photo role department')
            .populate('comments.author', 'name photo');

        res.json(updatedPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/faculty-lounge/posts/:id/like
// @access  Private
router.post('/posts/:id/like', auth(['Staff', 'HOD', 'Admin', 'Office']), async (req, res) => {
    try {
        const post = await FacultyPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Check if already liked
        const likeIndex = post.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1); // Unlike
        } else {
            post.likes.push(req.user.id); // Like
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
