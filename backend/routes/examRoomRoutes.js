const express = require('express');
const router = express.Router();
const {
    generateSeating,
    createExam,
    getExams,
    updateExam,
    deleteExam,
    createHall,
    getHalls,
    updateHall,
    deleteHall,
    savePlan,
    getStudentCount
} = require('../controllers/examRoomController');

// You might want to import your auth middleware here to protect these routes
// const { protect, authorize } = require('../middleware/auth');
// router.use(protect);
// router.use(authorize('Admin', 'ExamCell'));

router.post('/generate', generateSeating);
router.post('/exam', createExam);
router.get('/exams', getExams);
router.put('/exam/:id', updateExam);
router.delete('/exam/:id', deleteExam);
router.post('/hall', createHall);
router.get('/halls', getHalls);
router.put('/hall/:id', updateHall);
router.delete('/hall/:id', deleteHall);
router.post('/save-plan', savePlan);
router.post('/student-count', getStudentCount);

module.exports = router;
