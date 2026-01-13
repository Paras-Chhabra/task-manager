const axios = require('axios');

const API_URL = 'http://localhost:5001/api'; // Adjust port if needed

async function runTest() {
    try {
        console.log('--- Starting Verification ---');

        // 1. Register User A
        const userA = { username: 'usera_' + Date.now(), email: 'usera' + Date.now() + '@test.com', password: 'password123' };
        console.log('Registering User A...');
        let res = await axios.post(`${API_URL}/auth/register`, userA);
        const tokenA = res.data.token;
        console.log('User A registered. Token obtained.');

        // 2. Register User B
        const userB = { username: 'userb_' + Date.now(), email: 'userb' + Date.now() + '@test.com', password: 'password123' };
        console.log('Registering User B...');
        res = await axios.post(`${API_URL}/auth/register`, userB);
        const tokenB = res.data.token;
        console.log('User B registered. Token obtained.');

        // 3. User A creates a task
        console.log('User A creating task...');
        res = await axios.post(`${API_URL}/tasks`, { title: 'Task A', description: 'desc', status: 'To Do' }, { headers: { Authorization: `Bearer ${tokenA}` } });
        const taskAId = res.data._id;
        console.log('Task A created:', taskAId);

        // 4. User B creates a task
        console.log('User B creating task...');
        res = await axios.post(`${API_URL}/tasks`, { title: 'Task B', description: 'desc', status: 'To Do' }, { headers: { Authorization: `Bearer ${tokenB}` } });
        const taskBId = res.data._id;
        console.log('Task B created:', taskBId);

        // 5. User A gets tasks - Should see only Task A
        console.log('User A fetching tasks...');
        res = await axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${tokenA}` } });
        const tasksA = res.data.tasks;
        const ownsAllA = tasksA.every(t => t.owner._id === res.data.tasks[0].owner._id); // Rough check
        // Better check: does it contain Task B?
        const hasTaskB = tasksA.find(t => t._id === taskBId);
        if (hasTaskB) throw new Error('User A can see Task B!');
        console.log(`User A sees ${tasksA.length} tasks. Isolation passed (Task B not found).`);

        // 6. User B gets tasks - Should see only Task B
        console.log('User B fetching tasks...');
        res = await axios.get(`${API_URL}/tasks`, { headers: { Authorization: `Bearer ${tokenB}` } });
        const tasksB = res.data.tasks;
        const hasTaskA = tasksB.find(t => t._id === taskAId);
        if (hasTaskA) throw new Error('User B can see Task A!');
        console.log(`User B sees ${tasksB.length} tasks. Isolation passed (Task A not found).`);

        // 7. Analytics Check
        console.log('Checking Analytics for User A...');
        res = await axios.get(`${API_URL}/tasks/analytics`, { headers: { Authorization: `Bearer ${tokenA}` } });
        // Assuming this is a fresh DB or at least we know the delta. 
        // But since we just created 1 task, total should be at least 1.
        console.log('User A Analytics:', res.data);

        console.log('--- Verification PASSED ---');
    } catch (error) {
        console.error('--- Verification FAILED ---');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error config:', error.config);
        }
        process.exit(1);
    }
}

runTest();
