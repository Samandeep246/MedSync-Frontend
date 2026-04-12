import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import patientService from "../services/patientService";
import Navbar from "./Navbar";

function PatientProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await patientService.getById(user?.patientId);
                setPatient(data);
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (error) return <div style={styles.error}>{error}</div>;

    return (
        <div style={styles.container}>
            <Navbar role="Patient" />

            {/* Content */}
            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/patient")}>
                    ← Back to Dashboard
                </button>

                <div style={styles.card}>
                    {/* Profile Header */}
                    <div style={styles.profileHeader}>
                        <div style={styles.avatar}>
                            {patient?.firstName?.[0]}
                            {patient?.lastName?.[0]}
                        </div>
                        <div>
                            <h2 style={styles.name}>
                                {patient?.firstName} {patient?.lastName}
                            </h2>
                            <p style={styles.patientNumber}>{patient?.patientNumber}</p>
                        </div>
                    </div>

                    <hr style={styles.divider} />

                    {/* Profile Details */}
                    <div style={styles.grid}>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Email</span>
                            <span style={styles.detailValue}>{patient?.email}</span>
                        </div>

                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Phone</span>
                            <span style={styles.detailValue}>
                                {patient?.phoneNumber || "Not provided"}
                            </span>
                        </div>

                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Date of Birth</span>
                            <span style={styles.detailValue}>
                                {patient?.dateOfBirth
                                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                                    : "Not provided"}
                            </span>
                        </div>

                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Blood Type</span>
                            <span style={styles.detailValue}>
                                {patient?.bloodType || "Not provided"}
                            </span>
                        </div>

                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Health Card</span>
                            <span style={styles.detailValue}>
                                {patient?.healthCardNumber || "Not provided"}
                            </span>
                        </div>

                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Gender</span>
                            <span style={styles.detailValue}>
                                {patient?.gender || "Not provided"}
                            </span>
                        </div>

                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Address</span>
                            <span style={styles.detailValue}>
                                {patient?.address || "Not provided"}
                            </span>
                        </div>
                    </div>

                    <button
                        style={styles.editBtn}
                        onClick={() => navigate("/patient/profile/edit")}
                    >
                        Edit Profile
                    </button>
                    <button
                        style={styles.changePwdBtn}
                        onClick={() => navigate("/patient/change-password")}
                    >
                        Change Password
                    </button>
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
    profileHeader: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginBottom: "24px",
    },
    avatar: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        backgroundColor: "#2e7d32",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "bold",
    },
    name: {
        color: "#333",
        marginBottom: "4px",
    },
    patientNumber: {
        color: "#888",
        fontSize: "14px",
    },
    divider: {
        border: "none",
        borderTop: "1px solid #eee",
        marginBottom: "24px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "32px",
    },
    detailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    detailLabel: {
        fontSize: "12px",
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    detailValue: {
        fontSize: "15px",
        color: "#333",
    },
    editBtn: {
        padding: "12px 32px",
        backgroundColor: "#2e7d32",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "15px",
    },
    changePwdBtn: {
        padding: "12px 32px", backgroundColor: "white",
        color: "#2e7d32", border: "1px solid #2e7d32",
        borderRadius: "6px", cursor: "pointer", fontSize: "15px",
        marginLeft: "12px",
    },
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#2e7d32",
    },
    error: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#d32f2f",
    },
};

export default PatientProfile;