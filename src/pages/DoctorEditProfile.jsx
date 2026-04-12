import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import doctorService from "../services/doctorService";
import Navbar from "./Navbar";

// Days in display order — Sun=0 matches .NET DayOfWeek enum
const DAYS = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
];

function DoctorEditProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        specializationId: 0,
        licenseNumber: "",
        gender: "",
        yearsOfExperience: 0,
        consultationFee: 0,
        availableFrom: "",
        availableTo: "",
    });

    // availability = { 0: true, 1: true, 2: false, ... } keyed by DayOfWeek value
    const [availability, setAvailability] = useState(
        Object.fromEntries(DAYS.map(d => [d.value, true]))
    );

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await doctorService.getById(user?.doctorId);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    specializationId: data.specializationId || 0,
                    licenseNumber: data.licenseNumber || "",
                    gender: data.gender || "",
                    yearsOfExperience: data.yearsOfExperience || 0,
                    consultationFee: data.consultationFee || 0,
                    availableFrom: data.availableFrom?.substring(0, 5) || "",
                    availableTo: data.availableTo?.substring(0, 5) || "",
                });
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }

            // Availability is separate — failure here won't block profile load
            try {
                const availData = await doctorService.getAvailability(user?.doctorId);
                const mapped = {};
                availData.forEach(a => { mapped[a.dayOfWeek] = a.isAvailable; });
                setAvailability(mapped);
            } catch (err) {
                // Silently default to all days available
                setAvailability(Object.fromEntries(DAYS.map(d => [d.value, true])));
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Toggle a single day on/off
    const toggleDay = (dayValue) => {
        setAvailability(prev => ({ ...prev, [dayValue]: !prev[dayValue] }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            // Save profile
            await doctorService.update(user?.doctorId, formData);
        } catch (err) {
            const errData = err.response?.data;
            setError(
                typeof errData === "string"
                    ? errData
                    : errData?.title || "Failed to update profile."
            );
            setSaving(false);
            return;
        }

        try {
            // Save availability — send all 7 days
            const days = DAYS.map(d => ({
                dayOfWeek: d.value,
                isAvailable: availability[d.value] ?? true,
            }));
            await doctorService.updateAvailability(user?.doctorId, days);
        } catch (err) {
            console.log("Availability error:", err.response?.status, err.response?.data, err.message);
            setError("Profile saved but availability update failed. Please try again.");
            setSaving(false);
            return;
        }

        setSuccess("Profile updated successfully!");
        setSaving(false);
        setTimeout(() => navigate("/doctor/profile"), 1500);
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Navbar role="Doctor" />

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/doctor/profile")}>
                    ← Back to Profile
                </button>

                <div style={styles.card}>
                    <h2 style={styles.title}>Edit Profile</h2>

                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}

                    <form onSubmit={handleSave}>
                        {/* ── Personal Information ── */}
                        <p style={styles.sectionTitle}>Personal Information</p>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>First Name</label>
                                <input
                                    style={styles.input}
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Last Name</label>
                                <input
                                    style={styles.input}
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Phone Number</label>
                                <input
                                    style={styles.input}
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Gender</label>
                                <select
                                    style={styles.input}
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* ── Availability & Fees ── */}
                        <p style={styles.sectionTitle}>Availability & Fees</p>

                        <div style={styles.field}>
                            <label style={styles.label}>Consultation Fee ($)</label>
                            <input
                                type="number"
                                style={styles.input}
                                name="consultationFee"
                                value={formData.consultationFee}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        {/* ── Available Days ── */}
                        <div style={styles.field}>
                            <label style={styles.label}>Available Days</label>
                            <p style={styles.dayHint}>Click to toggle your available days</p>
                            <div style={styles.daysRow}>
                                {DAYS.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        style={
                                            availability[day.value]
                                                ? styles.dayBtnActive
                                                : styles.dayBtnInactive
                                        }
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Available From</label>
                                <input
                                    type="time"
                                    style={styles.input}
                                    name="availableFrom"
                                    value={formData.availableFrom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Available To</label>
                                <input
                                    type="time"
                                    style={styles.input}
                                    name="availableTo"
                                    value={formData.availableTo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* ── Read Only Fields ── */}
                        <p style={styles.sectionTitle}>
                            Professional Information
                            <span style={styles.readOnlyNote}> — contact admin to update</span>
                        </p>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Email</label>
                                <input style={styles.inputReadOnly} value={formData.email} readOnly />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>License Number</label>
                                <input style={styles.inputReadOnly} value={formData.licenseNumber} readOnly />
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Years of Experience</label>
                                <input style={styles.inputReadOnly} value={formData.yearsOfExperience} readOnly />
                            </div>
                        </div>

                        <div style={styles.buttonRow}>
                            <button
                                type="button"
                                style={styles.cancelBtn}
                                onClick={() => navigate("/doctor/profile")}
                            >
                                Cancel
                            </button>
                            <button type="submit" style={styles.saveBtn} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "700px", margin: "0 auto", padding: "40px 20px" },
    backBtn: {
        backgroundColor: "transparent", border: "none",
        color: "#2e7d32", cursor: "pointer",
        fontSize: "14px", marginBottom: "20px", padding: "0",
    },
    card: {
        backgroundColor: "white", borderRadius: "12px",
        padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    title: { color: "#1a1a1a", marginBottom: "24px" },
    sectionTitle: {
        fontSize: "13px", fontWeight: "700", color: "#888",
        textTransform: "uppercase", letterSpacing: "0.5px",
        marginBottom: "16px", marginTop: "24px",
    },
    readOnlyNote: {
        color: "#888", fontWeight: "400",
        textTransform: "none", letterSpacing: "0",
    },
    row: { display: "flex", gap: "16px" },
    field: {
        flex: 1, marginBottom: "16px",
        display: "flex", flexDirection: "column", gap: "6px",
    },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    dayHint: { fontSize: "12px", color: "#999", margin: "0 0 8px 0" },
    daysRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
    dayBtnActive: {
        padding: "8px 14px", borderRadius: "20px",
        border: "2px solid #2e7d32", backgroundColor: "#e8f5e9",
        color: "#2e7d32", fontWeight: "600", fontSize: "13px",
        cursor: "pointer",
    },
    dayBtnInactive: {
        padding: "8px 14px", borderRadius: "20px",
        border: "2px solid #ddd", backgroundColor: "#f5f5f5",
        color: "#aaa", fontWeight: "600", fontSize: "13px",
        cursor: "pointer",
    },
    input: {
        padding: "10px 12px", borderRadius: "6px",
        border: "1px solid #ddd", fontSize: "14px",
        outline: "none", backgroundColor: "white", width: "100%",
        boxSizing: "border-box",
    },
    inputReadOnly: {
        padding: "10px 12px", borderRadius: "6px",
        border: "1px solid #eee", fontSize: "14px",
        backgroundColor: "#f9f9f9", color: "#888",
        cursor: "not-allowed", width: "100%", boxSizing: "border-box",
    },
    buttonRow: {
        display: "flex", gap: "12px",
        justifyContent: "flex-end", marginTop: "24px",
    },
    cancelBtn: {
        padding: "12px 24px", backgroundColor: "white",
        color: "#666", border: "1px solid #ddd",
        borderRadius: "6px", cursor: "pointer", fontSize: "14px",
    },
    saveBtn: {
        padding: "12px 32px", backgroundColor: "#2e7d32",
        color: "white", border: "none", borderRadius: "6px",
        cursor: "pointer", fontSize: "14px",
    },
    error: {
        color: "#d32f2f", backgroundColor: "#ffebee",
        padding: "10px", borderRadius: "6px",
        marginBottom: "16px", fontSize: "14px",
    },
    success: {
        color: "#2e7d32", backgroundColor: "#e8f5e9",
        padding: "10px", borderRadius: "6px",
        marginBottom: "16px", fontSize: "14px",
    },
    loading: {
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh",
        fontSize: "18px", color: "#2e7d32",
    },
};

export default DoctorEditProfile;