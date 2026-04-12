import api from './api';

const appointmentService = {
    // Get ALL appointments (Admin only)
    getAll: async () => {
        const response = await api.get('/appointments');
        return response.data;
    },

    // Get appointments by patient ID
    getByPatient: async (patientId) => {
        const response = await api.get(`/appointments/patient/${patientId}`);
        return response.data;
    },

    // Get appointments by doctor ID
    getByDoctor: async (doctorId) => {
        const response = await api.get(`/appointments/doctor/${doctorId}`);
        return response.data;
    },

    // Get single appointment
    getById: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    // Create appointment
    create: async (data) => {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    // Update appointment (reschedule)
    update: async (id, data) => {
        const response = await api.patch(`/appointments/${id}`, data);
        return response.data;
    },

    // Update appointment status (cancel etc.)
    // reason is optional for reschedule, required for cancel
    updateStatus: async (id, status, reason = null) => {
        const response = await api.patch(
            `/appointments/${id}/status`,
            { status, reason }
        );
        return response.data;
    },

    // Delete appointment (Admin only)
    delete: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },
};

export default appointmentService;