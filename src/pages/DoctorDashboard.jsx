import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import appointmentService from "../services/appointmentService";
import { FaCalendarAlt, FaUserMd } from "react-icons/fa";
import Navbar from "./Navbar";

function DoctorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await appointmentService.getByDoctor(user?.doctorId);
                setAppointments(data);
            } catch (err) {
                console.error("Failed to load appointments", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const scheduled = appointments.filter(a => a.status === "Scheduled").length;
    const confirmed = appointments.filter(a => a.status === "Confirmed").length;
    const completed = appointments.filter(a => a.status === "Completed").length;
    const cancelled = appointments.filter(a => a.status === "Cancelled").length;

    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(
        a => new Date(a.appointmentDate).toDateString() === today
    );

    const upcoming = appointments
        .filter(a =>
            new Date(a.appointmentDate) > new Date() &&
            a.status !== "Cancelled" &&
            a.status !== "Completed"
        )
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Scheduled": return styles.statusScheduled;
            case "Confirmed": return styles.statusConfirmed;
            case "Completed": return styles.statusCompleted;
            case "Cancelled": return styles.statusCancelled;
            case "NoShow": return styles.statusNoShow;
            default: return styles.statusScheduled;
        }
    };

    return (
        <div style={styles.container}>
            <Navbar role="Doctor" />

            {/* Content */}
            <div style={styles.content}>
                <h1 style={styles.welcome}>
                    Good day, Dr. {user?.firstName}!
                </h1>
                <p style={styles.subtitle}>Here's your practice overview</p>

                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{scheduled}</span>
                        <span style={styles.statLabel}>Scheduled</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{confirmed}</span>
                        <span style={styles.statLabel}>Confirmed</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{completed}</span>
                        <span style={styles.statLabel}>Completed</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{cancelled}</span>
                        <span style={styles.statLabel}>Cancelled</span>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div style={styles.cardGrid}>
                    <div style={styles.card} onClick={() => navigate("/doctor/appointments")}>
                        <div style={styles.iconWrap}>
                            <FaCalendarAlt style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>My Appointments</h3>
                        <p style={styles.cardDesc}>View and manage all appointments</p>
                    </div>
                    <div style={styles.card} onClick={() => navigate("/doctor/profile")}>
                        <div style={styles.iconWrap}>
                            <FaUserMd style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>My Profile</h3>
                        <p style={styles.cardDesc}>View and update your details</p>
                    </div>
                </div>

                {/* Today's Appointments */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        Today's Appointments
                        <span style={styles.sectionCount}>{todayAppointments.length}</span>
                    </h2>
                    {loading ? (
                        <p style={styles.loadingText}>Loading...</p>
                    ) : todayAppointments.length === 0 ? (
                        <div style={styles.empty}><p>No appointments today</p></div>
                    ) : (
                        todayAppointments.map(apt => (
                            <div key={apt.appointmentId} style={styles.aptCard}>
                                <div style={styles.aptTime}>
                                    {new Date(apt.appointmentDate).toLocaleTimeString([], {
                                        hour: "2-digit", minute: "2-digit"
                                    })}
                                </div>
                                <div style={styles.aptMiddle}>
                                    <p style={styles.aptPatient}>{apt.patientName}</p>
                                    <p style={styles.aptDuration}>{apt.durationMinutes} mins</p>
                                    {apt.reasonForVisit && (
                                        <p style={styles.aptReason}>{apt.reasonForVisit}</p>
                                    )}
                                </div>
                                <span style={getStatusStyle(apt.status)}>{apt.status}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Upcoming Appointments */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        Upcoming Appointments
                        <span style={styles.sectionCount}>{upcoming.length}</span>
                    </h2>
                    {loading ? (
                        <p style={styles.loadingText}>Loading...</p>
                    ) : upcoming.length === 0 ? (
                        <div style={styles.empty}><p>No upcoming appointments</p></div>
                    ) : (
                        upcoming.map(apt => (
                            <div key={apt.appointmentId} style={styles.aptCard}>
                                <div style={styles.aptDate}>
                                    <span style={styles.aptDateDay}>
                                        {new Date(apt.appointmentDate).getDate()}
                                    </span>
                                    <span style={styles.aptDateMonth}>
                                        {new Date(apt.appointmentDate).toLocaleString("default", { month: "short" })}
                                    </span>
                                </div>
                                <div style={styles.aptMiddle}>
                                    <p style={styles.aptPatient}>{apt.patientName}</p>
                                    <p style={styles.aptDuration}>
                                        {new Date(apt.appointmentDate).toLocaleTimeString([], {
                                            hour: "2-digit", minute: "2-digit"
                                        })}
                                        {" · "}{apt.durationMinutes} mins
                                    </p>
                                    {apt.reasonForVisit && (
                                        <p style={styles.aptReason}>{apt.reasonForVisit}</p>
                                    )}
                                </div>
                                <span style={getStatusStyle(apt.status)}>{apt.status}</span>
                            </div>
                        ))
                    )}
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
    statsGrid: {
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px", marginBottom: "32px",
    },
    statCard: {
        backgroundColor: "white", borderRadius: "12px", padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
    },
    statNumber: { fontSize: "36px", fontWeight: "bold", color: "#2e7d32" },
    statLabel: { fontSize: "13px", color: "#888" },
    cardGrid: {
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px", marginBottom: "32px",
    },
    card: {
        backgroundColor: "white", padding: "32px 24px",
        borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer", textAlign: "center",
    },
    iconWrap: {
        width: "64px", height: "64px", borderRadius: "50%",
        backgroundColor: "#e8f5e9", display: "flex",
        alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px auto",
    },
    cardIcon: { fontSize: "28px", color: "#2e7d32" },
    cardTitle: { color: "#1a1a1a", marginBottom: "8px", fontSize: "18px", fontWeight: "600" },
    cardDesc: { color: "#666", fontSize: "14px" },
    section: {
        backgroundColor: "white", borderRadius: "12px", padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px",
    },
    sectionTitle: {
        color: "#1a1a1a", fontSize: "18px", marginBottom: "16px",
        display: "flex", alignItems: "center", gap: "8px",
    },
    sectionCount: {
        backgroundColor: "#e8f5e9", color: "#2e7d32",
        borderRadius: "12px", padding: "2px 10px",
        fontSize: "13px", fontWeight: "600",
    },
    aptCard: {
        display: "flex", alignItems: "center", gap: "16px",
        padding: "12px 0", borderBottom: "1px solid #f5f5f5",
    },
    aptTime: { fontSize: "15px", fontWeight: "600", color: "#2e7d32", minWidth: "70px" },
    aptDate: {
        width: "48px", height: "48px", backgroundColor: "#e8f5e9",
        borderRadius: "8px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    aptDateDay: { fontSize: "18px", fontWeight: "bold", color: "#2e7d32", lineHeight: "1" },
    aptDateMonth: { fontSize: "11px", color: "#2e7d32", textTransform: "uppercase" },
    aptMiddle: { flex: 1 },
    aptPatient: { fontWeight: "600", color: "#333", marginBottom: "2px" },
    aptDuration: { fontSize: "13px", color: "#666" },
    aptReason: { fontSize: "13px", color: "#888", marginTop: "2px" },
    empty: { textAlign: "center", padding: "24px", color: "#888" },
    loadingText: { color: "#888", textAlign: "center" },
    statusScheduled: {
        padding: "4px 12px", backgroundColor: "#e3f2fd",
        color: "#1565c0", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
    },
    statusConfirmed: {
        padding: "4px 12px", backgroundColor: "#e8f5e9",
        color: "#2e7d32", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
    },
    statusCompleted: {
        padding: "4px 12px", backgroundColor: "#f3e5f5",
        color: "#6a1b9a", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
    },
    statusCancelled: {
        padding: "4px 12px", backgroundColor: "#ffebee",
        color: "#c62828", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
    },
    statusNoShow: {
        padding: "4px 12px", backgroundColor: "#fff3e0",
        color: "#e65100", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
    },
};

export default DoctorDashboard;
