import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import doctorService from "../services/doctorService";
import specializationService from "../services/specializationService";
import appointmentService from "../services/appointmentService";
import { FaUserMd, FaUsers, FaCalendarAlt, FaHospital } from "react-icons/fa";
import Navbar from "./Navbar";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        doctors: 0,
        patients: 0,
        appointments: 0,
        specializations: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [doctors, patients, specializations, appointments] = await Promise.all([
                    doctorService.getAll(),
                    patientService.getAll(),
                    specializationService.getAll(),
                    appointmentService.getAll(),
                ]);
                setStats({
                    doctors: doctors.length,
                    patients: patients.length,
                    specializations: specializations.length,
                    appointments: appointments.length,
                });
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={styles.container}>
            <Navbar role="Admin" />

            {/* Content */}
            <div style={styles.content}>
                <h1 style={styles.welcome}>Admin Dashboard</h1>
                <p style={styles.subtitle}>Manage your MedSync System</p>

                {/* Stats */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{loading ? "..." : stats.doctors}</span>
                        <span style={styles.statLabel}>Doctors</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{loading ? "..." : stats.patients}</span>
                        <span style={styles.statLabel}>Patients</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{loading ? "..." : stats.appointments}</span>
                        <span style={styles.statLabel}>Appointments</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{loading ? "..." : stats.specializations}</span>
                        <span style={styles.statLabel}>Specializations</span>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div style={styles.cardGrid}>
                    <div style={styles.card} onClick={() => navigate("/admin/doctors")}>
                        <div style={styles.iconWrap}>
                            <FaUserMd style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>Manage Doctors</h3>
                        <p style={styles.cardDesc}>View doctors, create login accounts</p>
                    </div>
                    <div style={styles.card} onClick={() => navigate("/admin/patients")}>
                        <div style={styles.iconWrap}>
                            <FaUsers style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>Manage Patients</h3>
                        <p style={styles.cardDesc}>View and manage patient records</p>
                    </div>
                    <div style={styles.card} onClick={() => navigate("/admin/appointments")}>
                        <div style={styles.iconWrap}>
                            <FaCalendarAlt style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>Appointments</h3>
                        <p style={styles.cardDesc}>View all appointments</p>
                    </div>
                    <div style={styles.card} onClick={() => navigate("/admin/specializations")}>
                        <div style={styles.iconWrap}>
                            <FaHospital style={styles.cardIcon} />
                        </div>
                        <h3 style={styles.cardTitle}>Specializations</h3>
                        <p style={styles.cardDesc}>Manage medical specializations</p>
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
    statsGrid: {
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px", marginBottom: "32px",
    },
    statCard: {
        backgroundColor: "white", borderRadius: "12px", padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "8px",
    },
    statNumber: { fontSize: "36px", fontWeight: "bold", color: "#2e7d32" },
    statLabel: { fontSize: "13px", color: "#888" },
    cardGrid: {
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px",
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
    cardDesc: { color: "#888", fontSize: "14px" },
};

export default AdminDashboard;