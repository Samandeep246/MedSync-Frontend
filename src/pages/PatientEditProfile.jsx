import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import patientService from "../services/patientService";
import Navbar from "./Navbar";

function PatientEditProfile() {
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
        dateOfBirth: "",
        healthCardNumber: "",
        bloodType: "",
        gender: "",
        address: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await patientService.getById(user?.patientId);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    dateOfBirth: data.dateOfBirth
                        ? data.dateOfBirth.split("T")[0]
                        : "",
                    healthCardNumber: data.healthCardNumber || "",
                    bloodType: data.bloodType || "",
                    gender: data.gender || "",
                    address: data.address || "",
                });
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await patientService.update(user?.patientId, formData);
            setSuccess("Profile updated successfully!");
            setTimeout(() => navigate("/patient/profile"), 1500);
        } catch (err) {
            setError("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Navbar role="Patient" />

            {/* Content */}
            <div style={styles.content}>
                <button
                    style={styles.backBtn}
                    onClick={() => navigate("/patient/profile")}
                >
                    ← Back to Profile
                </button>

                <div style={styles.card}>
                    <h2 style={styles.title}>Edit Profile</h2>

                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}

                    <form onSubmit={handleSave}>
                        {/* Editable Fields */}
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

                        <div style={styles.field}>
                            <label style={styles.label}>Address</label>
                            <input
                                style={styles.input}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your address"
                            />
                        </div>

                        {/* Read Only Fields */}
                        <p style={styles.sectionTitle}>
                            Medical Information
                            <span style={styles.readOnlyNote}>
                                {" "}— contact admin to update
                            </span>
                        </p>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Date of Birth</label>
                                <input
                                    style={styles.inputReadOnly}
                                    value={
                                        formData.dateOfBirth
                                            ? new Date(formData.dateOfBirth).toLocaleDateString()
                                            : "Not provided"
                                    }
                                    readOnly
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Blood Type</label>
                                <input
                                    style={styles.inputReadOnly}
                                    value={formData.bloodType || "Not provided"}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>Health Card Number</label>
                                <input
                                    style={styles.inputReadOnly}
                                    value={formData.healthCardNumber || "Not provided"}
                                    readOnly
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Email</label>
                                <input
                                    style={styles.inputReadOnly}
                                    value={formData.email}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div style={styles.buttonRow}>
                            <button
                                type="button"
                                style={styles.cancelBtn}
                                onClick={() => navigate("/patient/profile")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={styles.saveBtn}
                                disabled={saving}
                            >
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
    container: {
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
    },
    content: {
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px 20px",
    },
    backBtn: {
        backgroundColor: "transparent",
        border: "none",
        color: "#2e7d32",
        cursor: "pointer",
        fontSize: "14px",
        marginBottom: "20px",
        padding: "0",
    },
    card: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "32px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    title: {
        color: "#1a1a1a",
        marginBottom: "24px",
    },
    sectionTitle: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "16px",
        marginTop: "24px",
    },
    readOnlyNote: {
        color: "#888",
        fontWeight: "400",
        textTransform: "none",
        letterSpacing: "0",
    },
    row: {
        display: "flex",
        gap: "16px",
        marginBottom: "0px",
    },
    field: {
        flex: 1,
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#444",
    },
    input: {
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
        backgroundColor: "white",
    },
    inputReadOnly: {
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid #eee",
        fontSize: "14px",
        backgroundColor: "#f9f9f9",
        color: "#888",
        cursor: "not-allowed",
    },
    buttonRow: {
        display: "flex",
        gap: "12px",
        justifyContent: "flex-end",
        marginTop: "24px",
    },
    cancelBtn: {
        padding: "12px 24px",
        backgroundColor: "white",
        color: "#666",
        border: "1px solid #ddd",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
    },
    saveBtn: {
        padding: "12px 32px",
        backgroundColor: "#2e7d32",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
    },
    error: {
        color: "#d32f2f",
        backgroundColor: "#ffebee",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "16px",
        fontSize: "14px",
    },
    success: {
        color: "#2e7d32",
        backgroundColor: "#e8f5e9",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "16px",
        fontSize: "14px",
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#2e7d32",
    },
};

export default PatientEditProfile;