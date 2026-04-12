import api from './api';

const authService = {

    // Register a new user
    register: async (dto) => {
        const response = await api.post('/auth/register', dto);
        return response.data;
    },

    // Login existing user
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        console.log("Forgot password response:", response.data);
        return response.data;
    },

    // Reset password
    resetPassword: async (code, newPassword) => {
        const response = await api.post('/auth/reset-password', { code, newPassword });
        return response.data;
    },

    // Change password — protected
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.patch('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    },

    // Save token to localStorage
    saveToken: (token) => localStorage.setItem('token', token),

    // Get token from localStorage
    getToken: () => localStorage.getItem('token'),

    // Save user info to localStorage
    saveUser: (user) => localStorage.setItem('user', JSON.stringify(user)),

    // Get user info from localStorage
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Logout — clear everything
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Check if user is logged in
    isLoggedIn: () => !!localStorage.getItem('token')
};

export default authService;