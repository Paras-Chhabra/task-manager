const Task = require('../models/Task');

// @desc    Get all tasks (all users can view)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        const { status, priority, dueDate, search, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (dueDate) query.dueDate = { $lte: new Date(dueDate) };
        if (search) {
            query.$text = { $search: search };
        }

        const tasks = await Task.find(query)
            .populate('owner', 'username email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Task.countDocuments(query);

        res.json({
            tasks,
            page: Number(page),
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('owner', 'username email');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, status } = req.body;

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            status,
            owner: req.user._id,
        });

        const populatedTask = await Task.findById(task._id).populate('owner', 'username email');
        res.status(201).json(populatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update task (owner only)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only owner can update
        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        const { title, description, priority, dueDate, status } = req.body;

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.priority = priority || task.priority;
        task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
        task.status = status || task.status;

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id).populate('owner', 'username email');
        res.json(populatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete task (owner only)
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only owner can delete
        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get analytics (total, completed, pending)
// @route   GET /api/tasks/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
    try {
        const total = await Task.countDocuments();
        const completed = await Task.countDocuments({ status: 'Done' });
        const pending = await Task.countDocuments({ status: { $ne: 'Done' } });

        res.json({ total, completed, pending });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
