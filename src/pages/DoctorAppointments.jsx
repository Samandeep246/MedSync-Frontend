import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import appointmentService from "../services/appointmentService";
import Navbar from "./Navbar";
function DoctorAppointments() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const data = await appointmentService.getByDoctor(user?.doctorId);
            setAppointments(data);
        } catch (err) {
            setError("Failed to load appointments.");
        } finally {
            setLoading(false);
        }
    };

    // Allowed status transitions for Doctor
    const allowedTransitions = {
        Scheduled: ["Confirmed", "Cancelled"],
        Confirmed: ["Completed", "Cancelled", "NoShow"],
        Completed: [],
        Cancelled: [],
        NoShow: [],
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        setUpdatingId(appointmentId);
        try {
            await appointmentService.updateStatus(appointmentId, newStatus);
            // Refresh appointments after update
            await fetchAppointments();
        } catch (err) {
            setError("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

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
    const getActionLabel = (status) => {
        switch (status) {
            case "Confirmed": return "Confirm";
            case "Cancelled": return "Cancel";
            case "Completed": return "Complete";
            case "NoShow": return "No Show";
            default: return status;
        }
    };

    const filteredAppointments = filter === "All"
        ? appointments
        : appointments.filter(a => a.status === filter);

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Navbar role="Doctor" />

            {/* Content */}
            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/doctor")}>
                    ← Back to Dashboard
                </button>

                <div style={styles.header}>
                    <h2 style={styles.title}>My Appointments</h2>
                    <span style={styles.totalCount}>{appointments.length} total</span>
                </div>

                {/* Filter Tabs */}
                <div style={styles.filterRow}>
                    {["All", "Scheduled", "Confirmed", "Completed", "Cancelled", "NoShow"].map(f => (
                        <button
                            key={f}
                            style={filter === f ? styles.filterActive : styles.filterBtn}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {error && <p style={styles.error}>{error}</p>}

                {filteredAppointments.length === 0 ? (
                    <div style={styles.empty}>
                        <p>No appointments found.</p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {filteredAppointments
                            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                            .map(apt => (
                                <div key={apt.appointmentId} style={styles.card}>
                                    {/* Date Box */}
                                    <div style={styles.dateBox}>
                                        <span style={styles.dateDay}>
                                            {new Date(apt.appointmentDate).getDate()}
                                        </span>
                                        <span style={styles.dateMonth}>
                                            {new Date(apt.appointmentDate).toLocaleString("default", { month: "short" })}
                                        </span>
                                    </div>

                                    {/* Appointment Details */}
                                    <div style={styles.cardMiddle}>
                                        <p style={styles.patientName}>{apt.patientName}</p>
                                        <p style={styles.aptTime}>
                                            {new Date(apt.appointmentDate).toLocaleTimeString([], {
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                            {" · "}{apt.durationMinutes} mins
                                        </p>
                                        {apt.reasonForVisit && (
                                            <p style={styles.reason}>{apt.reasonForVisit}</p>
                                        )}
                                        <p style={styles.aptNumber}>{apt.appointmentNumber}</p>
                                    </div>

                                    {/* Status + Actions */}
                                    <div style={styles.cardRight}>
                                        <span style={getStatusStyle(apt.status)}>{apt.status}</span>

                                        {/* Status transition buttons */}
                                        {allowedTransitions[apt.status]?.length > 0 && (
                                            <div style={styles.actionButtons}>
                                                {allowedTransitions[apt.status].map(nextStatus => (
                                                    <button
                                                        key={nextStatus}
                                                        style={getActionBtnStyle(nextStatus)}
                                                        onClick={() => handleStatusUpdate(apt.appointmentId, nextStatus)}
                                                        disabled={updatingId === apt.appointmentId}
                                                    >
                                                        {updatingId === apt.appointmentId ? "..." : getActionLabel(nextStatus)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const getActionBtnStyle = (status) => {
    const base = {
        padding: "4px 10px", borderRadius: "4px",
        fontSize: "11px", cursor: "pointer", border: "none",
        fontWeight: "600",
    };
    switch (status) {
        case "Confirmed": return { ...base, backgroundColor: "#e8f5e9", color: "#2e7d32" };
        case "Completed": return { ...base, backgroundColor: "#f3e5f5", color: "#6a1b9a" };
        case "Cancelled": return { ...base, backgroundColor: "#ffebee", color: "#c62828" };
        case "NoShow": return { ...base, backgroundColor: "#fff3e0", color: "#e65100" };
        default: return { ...base, backgroundColor: "#e3f2fd", color: "#1565c0" };
    }
};

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "900px", margin: "0 auto", padding: "40px 20px" },
    backBtn: {
        backgroundColor: "transparent", border: "none",
        color: "#2e7d32", cursor: "pointer",
        fontSize: "14px", marginBottom: "20px", padding: "0",
    },
    header: {
        display: "flex", alignItems: "center",
        gap: "12px", marginBottom: "24px",
    },
    title: { color: "#1a1a1a", fontSize: "24px" },
    totalCount: {
        backgroundColor: "#e8f5e9", color: "#2e7d32",
        borderRadius: "12px", padding: "2px 10px",
        fontSize: "13px", fontWeight: "600",
    },
    filterRow: {
        display: "flex", gap: "8px",
        marginBottom: "24px", flexWrap: "wrap",
    },
    filterBtn: {
        padding: "6px 16px", backgroundColor: "white",
        color: "#666", border: "1px solid #ddd",
        borderRadius: "20px", cursor: "pointer", fontSize: "13px",
    },
    filterActive: {
        padding: "6px 16px", backgroundColor: "#2e7d32",
        color: "white", border: "1px solid #2e7d32",
        borderRadius: "20px", cursor: "pointer", fontSize: "13px",
    },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: {
        backgroundColor: "white", borderRadius: "12px",
        padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", gap: "16px",
    },
    dateBox: {
        width: "56px", height: "56px", backgroundColor: "#e8f5e9",
        borderRadius: "8px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    dateDay: { fontSize: "20px", fontWeight: "bold", color: "#2e7d32", lineHeight: "1" },
    dateMonth: { fontSize: "12px", color: "#2e7d32", textTransform: "uppercase" },
    cardMiddle: { flex: 1 },
    patientName: { fontWeight: "600", color: "#333", marginBottom: "4px", fontSize: "15px" },
    aptTime: { color: "#666", fontSize: "13px", marginBottom: "4px" },
    reason: { color: "#888", fontSize: "13px", marginBottom: "4px" },
    aptNumber: { color: "#aaa", fontSize: "12px" },
    cardRight: {
        display: "flex", flexDirection: "column",
        alignItems: "flex-end", gap: "8px", flexShrink: 0,
    },
    actionButtons: { display: "flex", flexDirection: "column", gap: "4px" },
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
    empty: { textAlign: "center", padding: "60px 20px", color: "#888" },
    error: {
        color: "#d32f2f", backgroundColor: "#ffebee",
        padding: "10px", borderRadius: "6px",
        marginBottom: "16px", fontSize: "14px",
    },
    loading: {
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh",
        fontSize: "18px", color: "#2e7d32",
    },
};

export default DoctorAppointments;