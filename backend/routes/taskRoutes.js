const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getAnalytics,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Analytics route (must be before :id route)
router.get('/analytics', protect, getAnalytics);

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
