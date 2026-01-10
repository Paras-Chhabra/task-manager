'use client';

import { Task } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
    const { user } = useAuth();
    const isOwner = user?._id === task.owner._id;

    const priorityClass = {
        High: 'badge-high',
        Medium: 'badge-medium',
        Low: 'badge-low',
    }[task.priority];

    const statusClass = {
        'To Do': 'status-todo',
        'In Progress': 'status-inprogress',
        Done: 'status-done',
    }[task.status];

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No due date';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="task-card animate-fade-in">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                        {task.description || 'No description'}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className={`badge ${priorityClass}`}>{task.priority}</span>
                <span className={`badge ${statusClass}`}>{task.status}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(task.dueDate)}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {task.owner.username}
                    </span>
                </div>

                {isOwner && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(task)}
                            className="p-2 rounded-lg hover:bg-indigo-500/20 transition-colors text-indigo-400"
                            title="Edit"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(task._id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                            title="Delete"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
