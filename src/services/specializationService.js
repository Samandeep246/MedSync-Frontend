import api from './api';

const specializationService = {
    getAll: async () => {
        const response = await api.get('/specializations');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/specializations/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/specializations', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/specializations/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/specializations/${id}`);
        return response.data;
    }
};

export default specializationService;