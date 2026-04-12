import api from './api';

const doctorService = {
    // ── Doctor ───────────────────────────────────────────────────

    // Public — no auth needed
    getAll: async () => {
        const response = await api.get('/doctors');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },

    // Admin + Doctor
    update: async (id, data) => {
        const response = await api.patch(`/doctors/${id}`, data);
        return response.data;
    },

    // Admin only — flips isActive true/false
    toggleStatus: async (id) => {
        const response = await api.patch(`/doctors/${id}/toggle-status`);
        return response.data;
    },

    // Admin only — create doctor + user account
    createDoctor: async (payload) => {
        const response = await api.post('/auth/create-doctor', payload);
        return response.data;
    },

    // ── Availability ─────────────────────────────────────────────

    // Public — get all 7 days for a doctor
    getAvailability: async (doctorId) => {
        const response = await api.get(`/doctors/${doctorId}/availability`);
        return response.data;
    },

    // Doctor only — replace full weekly schedule
    // days = [{ dayOfWeek: 0, isAvailable: true }, ...]
    updateAvailability: async (doctorId, days) => {
        const response = await api.put(
            `/doctors/${doctorId}/availability`,
            { days }
        );
        return response.data;
    },

    // Public — get doctors sorted by earliest available day
    // Used for "Find Earliest Slot" path in BookAppointment
    getEarliestSlots: async (specializationId) => {
        const response = await api.get('/doctors/earliest-slots', {
            params: { specializationId }
        });
        return response.data;
    },
};

export default doctorService;