const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

const deleteDummyTask = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await Task.deleteOne({ title: 'My First Task' });

        if (result.deletedCount > 0) {
            console.log('Successfully deleted "My First Task"');
        } else {
            console.log('Task not found');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

deleteDummyTask();
