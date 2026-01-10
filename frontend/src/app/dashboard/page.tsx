'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { taskApi, Task, Analytics } from '@/lib/api';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import FilterBar from '@/components/FilterBar';
import Stats from '@/components/Stats';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const params: { status?: string; priority?: string; search?: string } = {};
            if (status) params.status = status;
            if (priority) params.priority = priority;
            if (debouncedSearch) params.search = debouncedSearch;

            const data = await taskApi.getTasks(params);
            setTasks(data.tasks);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [status, priority, debouncedSearch]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const data = await taskApi.getAnalytics();
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchAnalytics();
        }
    }, [user, fetchTasks, fetchAnalytics]);

    const handleCreateTask = async (data: {
        title: string;
        description: string;
        priority: string;
        dueDate: string;
        status: string;
    }) => {
        try {
            await taskApi.createTask(data);
            setShowForm(false);
            fetchTasks();
            fetchAnalytics();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateTask = async (data: {
        title: string;
        description: string;
        priority: string;
        dueDate: string;
        status: string;
    }) => {
        if (!editingTask) return;
        try {
            await taskApi.updateTask(editingTask._id, data);
            setEditingTask(null);
            setShowForm(false);
            fetchTasks();
            fetchAnalytics();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskApi.deleteTask(id);
            fetchTasks();
            fetchAnalytics();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingTask(null);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, <span className="gradient-text">{user.username}</span>
                    </h1>
                    <p className="text-gray-400">Here&apos;s an overview of your tasks</p>
                </div>

                <Stats analytics={analytics} loading={loading} />

                <FilterBar
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    priority={priority}
                    onPriorityChange={setPriority}
                    onCreateNew={() => setShowForm(true)}
                />

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
                        {error}
                        <button
                            onClick={() => setError('')}
                            className="ml-4 text-red-300 hover:text-red-200"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="task-card animate-pulse">
                                <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <svg
                            className="w-16 h-16 text-gray-500 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
                        <p className="text-gray-400 mb-6">
                            {debouncedSearch || status || priority
                                ? 'Try adjusting your filters'
                                : 'Get started by creating your first task'}
                        </p>
                        {!debouncedSearch && !status && !priority && (
                            <button onClick={() => setShowForm(true)} className="btn-primary">
                                Create Your First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onEdit={handleEdit}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showForm && (
                <TaskForm
                    task={editingTask}
                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}
