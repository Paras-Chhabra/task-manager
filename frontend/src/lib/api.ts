const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface AuthResponse {
    _id: string;
    username: string;
    email: string;
    token: string;
}

interface Task {
    _id: string;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string | null;
    status: 'To Do' | 'In Progress' | 'Done';
    owner: {
        _id: string;
        username: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface TasksResponse {
    tasks: Task[];
    page: number;
    pages: number;
    total: number;
}

interface Analytics {
    total: number;
    completed: number;
    pending: number;
}

// Helper to get auth header
const getAuthHeader = (): HeadersInit => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    if (!token) return {};

    // Sanitize: Remove whitespace and newlines that cause "String did not match expected pattern"
    const sanitizedToken = token.trim().replace(/[\n\r\s]/g, '');

    return { Authorization: `Bearer ${sanitizedToken}` };
};

// Auth API
export const authApi = {
    register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Registration failed');
        }
        return res.json();
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                // If parsing fails, it's likely HTML (404/500)
                console.error('API Error (Non-JSON response):', responseText);
                throw new Error(`API Configuration Error: Received HTML instead of JSON. URL: ${API_URL}`);
            }

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }
            return data;
        } catch (error: any) {
            throw error; // Re-throw to be caught by component
        }
    },

    getMe: async (): Promise<Omit<AuthResponse, 'token'>> => {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { ...getAuthHeader() },
        });
        if (!res.ok) throw new Error('Failed to get user');
        return res.json();
    },
};

// Task API
export const taskApi = {
    getTasks: async (params?: {
        status?: string;
        priority?: string;
        dueDate?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<TasksResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.priority) searchParams.append('priority', params.priority);
        if (params?.dueDate) searchParams.append('dueDate', params.dueDate);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.page) searchParams.append('page', String(params.page));
        if (params?.limit) searchParams.append('limit', String(params.limit));

        const res = await fetch(`${API_URL}/tasks?${searchParams.toString()}`, {
            headers: { ...getAuthHeader() },
        });
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
    },

    getTask: async (id: string): Promise<Task> => {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            headers: { ...getAuthHeader() },
        });
        if (!res.ok) throw new Error('Failed to fetch task');
        return res.json();
    },

    createTask: async (task: {
        title: string;
        description?: string;
        priority?: string;
        dueDate?: string;
        status?: string;
    }): Promise<Task> => {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(task),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create task');
        }
        return res.json();
    },

    updateTask: async (
        id: string,
        task: {
            title?: string;
            description?: string;
            priority?: string;
            dueDate?: string;
            status?: string;
        }
    ): Promise<Task> => {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(task),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update task');
        }
        return res.json();
    },

    deleteTask: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete task');
        }
    },

    getAnalytics: async (): Promise<Analytics> => {
        const res = await fetch(`${API_URL}/tasks/analytics`, {
            headers: { ...getAuthHeader() },
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
    },
};

export type { AuthResponse, Task, TasksResponse, Analytics };
