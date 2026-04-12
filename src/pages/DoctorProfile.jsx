import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import doctorService from "../services/doctorService";
import Navbar from "./Navbar";

const DAYS = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
];

function DoctorProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await doctorService.getById(user?.doctorId);
                setDoctor(data);
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }

            try {
                const availData = await doctorService.getAvailability(user?.doctorId);
                setAvailability(availData);
            } catch {
                // Availability unavailable — show nothing
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (error) return <div style={styles.error}>{error}</div>;

    // Only available days for badge display
    const availableDays = DAYS.filter(d =>
        availability.find(a => a.dayOfWeek === d.value && a.isAvailable)
    );

    return (
        <div style={styles.container}>
            <Navbar role="Doctor" />

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/doctor")}>
                    ← Back to Dashboard
                </button>

                <div style={styles.card}>
                    {/* Profile Header */}
                    <div style={styles.profileHeader}>
                        <div style={styles.avatar}>
                            {doctor?.firstName?.[0]}{doctor?.lastName?.[0]}
                        </div>
                        <div>
                            <h2 style={styles.name}>
                                Dr. {doctor?.firstName} {doctor?.lastName}
                            </h2>
                            <p style={styles.doctorNumber}>{doctor?.doctorNumber}</p>
                            <p style={styles.specialization}>{doctor?.specializationName}</p>
                        </div>
                    </div>

                    <hr style={styles.divider} />

                    {/* Profile Details */}
                    <div style={styles.grid}>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Email</span>
                            <span style={styles.detailValue}>{doctor?.email}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Phone</span>
                            <span style={styles.detailValue}>
                                {doctor?.phoneNumber || "Not provided"}
                            </span>
                        </div>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>License Number</span>
                            <span style={styles.detailValue}>{doctor?.licenseNumber}</span>
                        </div>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Gender</span>
                            <span style={styles.detailValue}>
                                {doctor?.gender || "Not provided"}
                            </span>
                        </div>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Years of Experience</span>
                            <span style={styles.detailValue}>{doctor?.yearsOfExperience} years</span>
                        </div>
                        <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Consultation Fee</span>
                            <span style={styles.detailValue}>${doctor?.consultationFee}</span>
                        </div>

                        {/* ── Availability — spans full width ── */}
                        <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}>
                            <span style={styles.detailLabel}>Available Hours</span>
                            <span style={styles.detailValue}>
                                {doctor?.availableFrom} – {doctor?.availableTo}
                            </span>
                        </div>

                        <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}>
                            <span style={styles.detailLabel}>Available Days</span>
                            <div style={styles.badgesRow}>
                                {availableDays.length > 0
                                    ? availableDays.map(d => (
                                        <span key={d.value} style={styles.badge}>
                                            {d.label}
                                        </span>
                                    ))
                                    : <span style={styles.noDays}>No available days set</span>
                                }
                            </div>
                        </div>
                    </div>

                    <button
                        style={styles.editBtn}
                        onClick={() => navigate("/doctor/profile/edit")}
                    >
                        Edit Profile
                    </button>
                    <button
                        style={styles.changePwdBtn}
                        onClick={() => navigate("/doctor/change-password")}
                    >
                        Change Password
                    </button>
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
    profileHeader: {
        display: "flex", alignItems: "center",
        gap: "20px", marginBottom: "24px",
    },
    avatar: {
        width: "64px", height: "64px", borderRadius: "50%",
        backgroundColor: "#2e7d32", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "24px", fontWeight: "bold",
    },
    name: { color: "#333", marginBottom: "4px" },
    doctorNumber: { color: "#888", fontSize: "13px", marginBottom: "2px" },
    specialization: { color: "#2e7d32", fontSize: "14px", fontWeight: "600" },
    divider: { border: "none", borderTop: "1px solid #eee", marginBottom: "24px" },
    grid: {
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "20px", marginBottom: "32px",
    },
    detailItem: { display: "flex", flexDirection: "column", gap: "4px" },
    detailLabel: {
        fontSize: "12px", color: "#888",
        textTransform: "uppercase", letterSpacing: "0.5px",
    },
    detailValue: { fontSize: "15px", color: "#333" },
    badgesRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" },
    badge: {
        padding: "4px 12px", borderRadius: "20px",
        backgroundColor: "#e8f5e9", color: "#2e7d32",
        fontSize: "13px", fontWeight: "600",
        border: "1px solid #c8e6c9",
    },
    noDays: { fontSize: "14px", color: "#aaa" },
    editBtn: {
        padding: "12px 32px", backgroundColor: "#2e7d32",
        color: "white", border: "none", borderRadius: "6px",
        cursor: "pointer", fontSize: "15px",
    },
    changePwdBtn: {
        padding: "12px 32px", backgroundColor: "white",
        color: "#2e7d32", border: "1px solid #2e7d32",
        borderRadius: "6px", cursor: "pointer", fontSize: "15px",
        marginLeft: "12px",
    },
    loading: {
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh",
        fontSize: "18px", color: "#2e7d32",
    },
    error: {
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh",
        fontSize: "18px", color: "#d32f2f",
    },
};

export default DoctorProfile;