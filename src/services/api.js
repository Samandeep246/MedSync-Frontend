import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7013/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 🔐 Attach token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ⚠️ Handle global errors (optional but recommended)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired / unauthorized
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;