import api from './api';

const patientService = {
    getAll: async () => {
        const response = await api.get(`/patients`);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/patients/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/patients/${id}`, data);
        return response.data;
    }
};

export default patientService;

