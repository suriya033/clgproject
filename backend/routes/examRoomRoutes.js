const express = require('express');
const router = express.Router();
const {
    generateSeating,
    createExam,
    getExams,
    createHall,
    getHalls
} = require('../controllers/examRoomController');

// You might want to import your auth middleware here to protect these routes
// const { protect, authorize } = require('../middleware/auth');
// router.use(protect);
// router.use(authorize('Admin', 'ExamCell'));

router.post('/generate', generateSeating);
router.post('/exam', createExam);
router.get('/exams', getExams);
router.post('/hall', createHall);
router.get('/halls', getHalls);

module.exports = router;
