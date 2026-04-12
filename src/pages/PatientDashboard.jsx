import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaCalendarAlt, FaPlus, FaCheckCircle, FaClock, FaTimesCircle, FaCalendarCheck } from "react-icons/fa";
import appointmentService from "../services/appointmentService";
import Navbar from "./Navbar";

function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        upcoming: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await appointmentService.getByPatient(user?.patientId);
                const now = new Date();
                setStats({
                    upcoming: data.filter(a => a.status === "Scheduled" && new Date(a.appointmentDate) >= now).length,
                    confirmed: data.filter(a => a.status === "Confirmed").length,
                    completed: data.filter(a => a.status === "Completed").length,
                    cancelled: data.filter(a => a.status === "Cancelled").length,
                });
            } catch {
                // Stats unavailable — show zeros
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={styles.container}>
            <Navbar role="Patient" />

            <div style={styles.content}>
                {/* Welcome */}
                <h1 style={styles.welcome}>Welcome back, {user?.firstName}!</h1>
                <p style={styles.subtitle}>What would you like to do today?</p>

                {/* ── Stats Cards ── */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <FaClock style={{ ...styles.statIcon, color: "#1976d2" }} />
                        <span style={styles.statNumber}>{stats.upcoming}</span>
                        <span style={styles.statLabel}>Upcoming</span>
                    </div>
                    <div style={styles.statCard}>
                        <FaCalendarCheck style={{ ...styles.statIcon, color: "#2e7d32" }} />
                        <span style={styles.statNumber}>{stats.confirmed}</span>
                        <span style={styles.statLabel}>Confirmed</span>
                    </div>
                    <div style={styles.statCard}>
                        <FaCheckCircle style={{ ...styles.statIcon, color: "#6a1b9a" }} />
                        <span style={styles.statNumber}>{stats.completed}</span>
                        <span style={styles.statLabel}>Completed</span>
                    </div>
                    <div style={styles.statCard}>
                        <FaTimesCircle style={{ ...styles.statIcon, color: "#d32f2f" }} />
                        <span style={styles.statNumber}>{stats.cancelled}</span>
                        <span style={styles.statLabel}>Cancelled</span>
                    </div>
                </div>

                {/* ── Quick Access Cards ── */}
                <div style={styles.cardGrid}>
                    <div style={styles.card} onClick={() => navigate("/patient/profile")}>
                        <div style={styles.iconWrap}>
                            <FaUser style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>My Profile</h3>
                        <p style={styles.cardDesc}>View and edit your personal details</p>
                    </div>

                    <div style={styles.card} onClick={() => navigate("/patient/appointments")}>
                        <div style={styles.iconWrap}>
                            <FaCalendarAlt style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>My Appointments</h3>
                        <p style={styles.cardDesc}>View all your appointments</p>
                    </div>

                    <div style={styles.card} onClick={() => navigate("/patient/book")}>
                        <div style={styles.iconWrap}>
                            <FaPlus style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>Book Appointment</h3>
                        <p style={styles.cardDesc}>Schedule a new appointment</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "900px", margin: "0 auto", padding: "40px 20px" },
    welcome: { fontSize: "28px", color: "#1a1a1a", marginBottom: "8px" },
    subtitle: { color: "#888", marginBottom: "32px", fontSize: "16px" },

    // Stats
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "32px",
    },
    statCard: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
    },
    statIcon: { fontSize: "24px" },
    statNumber: { fontSize: "28px", fontWeight: "700", color: "#1a1a1a" },
    statLabel: { fontSize: "13px", color: "#888" },

    // Nav cards
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
    },
    card: {
        backgroundColor: "white",
        padding: "32px 24px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer",
        textAlign: "center",
    },
    iconWrap: {
        width: "64px", height: "64px", borderRadius: "50%",
        backgroundColor: "#e8f5e9",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px auto",
    },
    cardIcon: { fontSize: "28px", color: "#2e7d32" },
    cardTitle: { color: "#1a1a1a", marginBottom: "8px", fontSize: "18px", fontWeight: "600" },
    cardDesc: { color: "#666", fontSize: "14px", lineHeight: "1.5" },
};

export default PatientDashboard;