import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import appointmentService from "../services/appointmentService";
import { FaClock, FaStopwatch, FaHashtag, FaClipboard, FaDownload, FaFilePdf } from "react-icons/fa";
import Navbar from "./Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TABS = ["All", "Scheduled", "Confirmed", "Completed", "Cancelled", "NoShow"];

const allowedTransitions = {
    Scheduled: ["Confirmed", "Cancelled"],
    Confirmed: ["Completed", "Cancelled", "NoShow"],
    Completed: [],
    Cancelled: [],
    NoShow: [],
};

const ACTION_LABELS = {
    Confirmed: "Confirm",
    Cancelled: "Cancel",
    Completed: "Complete",
    NoShow: "No Show",
};

const STATUS_STYLE = {
    Scheduled: { backgroundColor: "#e3f2fd", color: "#1565c0" },
    Confirmed: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    Completed: { backgroundColor: "#f3e5f5", color: "#6a1b9a" },
    Cancelled: { backgroundColor: "#ffebee", color: "#c62828" },
    NoShow: { backgroundColor: "#fff3e0", color: "#e65100" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Parses "2026-04-02T09:00:00" → "02 Apr 2026"
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
// Parses "2026-04-02T09:00:00" → "09:00 AM"
const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
};

function DateBox({ dateStr }) {
    const d = new Date(dateStr);
    return (
        <div style={styles.dateBox}>
            <div style={styles.dateDay}>{d.getDate()}</div>
            <div style={styles.dateMonth}>{MONTHS[d.getMonth()]}</div>
        </div>
    );
}
export default function AdminAppointments() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch {
            setError("Failed to load appointments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAppointments(); }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            setActionLoading(id + status);
            await appointmentService.updateStatus(id, status);
            await loadAppointments();
        } catch {
            setError("Failed to update status.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        try {
            setActionLoading("del" + id);
            await appointmentService.delete(id);
            setConfirmDelete(null);
            await loadAppointments();
        } catch {
            setError("Failed to delete appointment.");
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = activeTab === "All"
        ? appointments
        : appointments.filter(a => a.status === activeTab);

    const exportToCSV = () => {
        const rows = [
            ["Appointment #", "Date", "Time", "Patient", "Doctor", "Reason", "Status"],
            ...filtered.map(a => [
                a.appointmentNumber || "",
                formatDate(a.appointmentDate || a.date),
                formatTime(a.appointmentDate || a.date),
                a.patientName || `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.trim(),
                `Dr. ${a.doctorName || `${a.doctor?.firstName || ""} ${a.doctor?.lastName || ""}`.trim()}`,
                a.reasonForVisit || "",
                a.status || "",
            ])
        ];
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        const BOM = "\uFEFF"; // Prevents Excel from auto-formatting dates/times
        const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `appointments_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(46, 125, 50);
        doc.text("MedSync", 14, 18);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Appointments Report — ${activeTab}`, 14, 26);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
        doc.text(`Total: ${filtered.length} appointments`, 14, 38);
        autoTable(doc, {
            startY: 44,
            headStyles: { fillColor: [46, 125, 50] },
            head: [["#", "Date", "Time", "Patient", "Doctor", "Reason", "Status"]],
            body: filtered.map(a => [
                a.appointmentNumber || "",
                formatDate(a.appointmentDate || a.date),
                formatTime(a.appointmentDate || a.date),
                a.patientName || `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.trim(),
                `Dr. ${a.doctorName || `${a.doctor?.firstName || ""} ${a.doctor?.lastName || ""}`.trim()}`,
                a.reasonForVisit || "—",
                a.status || "",
            ]),
            styles: { fontSize: 10 },
            alternateRowStyles: { fillColor: [240, 247, 240] },
        });
        doc.save(`appointments_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div style={styles.container}>
            <Navbar role="Admin" />

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/admin")}>← Back to Dashboard</button>

                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>Appointments</h1>
                        <span style={styles.badge}>{appointments.length} total</span>
                    </div>
                    <div style={styles.exportBtns}>
                        <button style={styles.exportBtnCsv} onClick={exportToCSV} disabled={appointments.length === 0}>
                            <FaDownload style={{ marginRight: "7px" }} />Export CSV
                        </button>
                        <button style={styles.exportBtnPdf} onClick={exportToPDF} disabled={appointments.length === 0}>
                            <FaFilePdf style={{ marginRight: "7px" }} />Export PDF
                        </button>
                    </div>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}

                {/* Filter Tabs */}
                <div style={styles.tabs}>
                    {TABS.map(t => (
                        <button
                            key={t}
                            style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}
                            onClick={() => setActiveTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p style={styles.emptyMsg}>Loading...</p>
                ) : filtered.length === 0 ? (
                    <p style={styles.emptyMsg}>No appointments found.</p>
                ) : (
                    filtered.map((a, idx) => {
                        const transitions = allowedTransitions[a.status] || [];
                        const statusStyle = STATUS_STYLE[a.status] || {};
                        return (
                            <div key={a.id ?? idx} style={styles.card}>
                                <div style={styles.apptRow}>
                                    <DateBox dateStr={a.appointmentDate || a.date} />
                                    <div style={styles.apptInfo}>
                                        <div style={styles.apptTop}>
                                            <div>
                                                <div style={styles.apptName}>
                                                    {a.patientName || `${a.patient?.firstName} ${a.patient?.lastName}` || "Patient"}
                                                </div>
                                                <div style={styles.apptDoc}>
                                                    Dr. {a.doctorName || `${a.doctor?.firstName} ${a.doctor?.lastName}` || "Doctor"}
                                                </div>
                                            </div>
                                            <span style={{ ...styles.statusBadge, ...statusStyle }}>{a.status}</span>
                                        </div>
                                        <div style={styles.apptDetails}>
                                            <span style={styles.detailItem}><FaClock style={styles.icon} /> {formatTime(a.appointmentDate || a.date)}</span>
                                            {a.duration && <span style={styles.detailItem}><FaStopwatch style={styles.icon} /> {a.duration} min</span>}
                                            {a.appointmentNumber && <span style={styles.detailItem}><FaHashtag style={styles.icon} /> {a.appointmentNumber}</span>}
                                        </div>
                                        {a.reasonForVisit && (
                                            <div style={styles.reason}><FaClipboard style={{ ...styles.icon, marginRight: "5px" }} />{a.reasonForVisit}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={styles.actions}>
                                    {transitions.map(st => (
                                        <button
                                            key={st}
                                            style={{ ...styles.actionBtn, ...STATUS_STYLE[st] }}
                                            disabled={!!actionLoading}
                                            onClick={() => handleStatusUpdate(a.id, st)}
                                        >
                                            {actionLoading === a.id + st ? "..." : ACTION_LABELS[st]}
                                        </button>
                                    ))}
                                    {confirmDelete === a.id ? (
                                        <span style={styles.confirmRow}>
                                            Sure?&nbsp;
                                            <button style={styles.yesBtn} disabled={!!actionLoading} onClick={() => handleDelete(a.id)}>
                                                {actionLoading === "del" + a.id ? "..." : "Yes"}
                                            </button>
                                            &nbsp;
                                            <button style={styles.noBtn} onClick={() => setConfirmDelete(null)}>No</button>
                                        </span>
                                    ) : (
                                        <button style={styles.deleteBtn} onClick={() => setConfirmDelete(a.id)}>Delete</button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "900px", margin: "0 auto", padding: "40px 20px" },
    backBtn: {
        background: "transparent", border: "none", color: "#2e7d32",
        cursor: "pointer", fontWeight: "600", fontSize: "15px",
        marginBottom: "16px", padding: 0,
    },
    pageHeader: {
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "16px",
    },
    pageTitle: { fontSize: "28px", color: "#1a1a1a", marginBottom: "4px" },
    badge: {
        backgroundColor: "#2e7d32", color: "white",
        borderRadius: "20px", padding: "2px 12px",
        fontSize: "13px", fontWeight: "600",
    },
    exportBtns: { display: "flex", gap: "10px" },
    exportBtnCsv: {
        display: "flex", alignItems: "center",
        backgroundColor: "white", color: "#2e7d32",
        borderWidth: "1px", borderStyle: "solid", borderColor: "#2e7d32",
        borderRadius: "6px", padding: "10px 20px",
        cursor: "pointer", fontWeight: "600", fontSize: "14px",
    },
    exportBtnPdf: {
        display: "flex", alignItems: "center",
        backgroundColor: "#d32f2f", color: "white",
        border: "none", borderRadius: "6px", padding: "10px 20px",
        cursor: "pointer", fontWeight: "600", fontSize: "14px",
    },
    tabs: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" },
    tab: {
        padding: "7px 16px", borderRadius: "20px",
        borderWidth: "1px", borderStyle: "solid", borderColor: "#ccc",
        backgroundColor: "white", color: "#333",
        cursor: "pointer", fontSize: "13px", fontWeight: "500",
    },
    tabActive: {
        backgroundColor: "#2e7d32", color: "white",
        borderWidth: "1px", borderStyle: "solid", borderColor: "#2e7d32",
    },
    card: {
        backgroundColor: "white", borderRadius: "12px", padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "14px",
    },
    apptRow: { display: "flex", gap: "16px" },
    dateBox: {
        width: "52px", height: "56px", borderRadius: "8px",
        backgroundColor: "#e8f5e9", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    dateDay: { fontWeight: "800", fontSize: "20px", color: "#2e7d32", lineHeight: 1 },
    dateMonth: { fontSize: "11px", color: "#555", textTransform: "uppercase" },
    apptInfo: { flex: 1 },
    apptTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" },
    apptName: { fontWeight: "700", fontSize: "15px", color: "#1a1a1a" },
    apptDoc: { color: "#555", fontSize: "13px" },
    statusBadge: { borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "700" },
    apptDetails: { display: "flex", gap: "14px", fontSize: "13px", color: "#666", flexWrap: "wrap", marginTop: "4px" },
    detailItem: { display: "flex", alignItems: "center", gap: "5px" },
    icon: { color: "#2e7d32", fontSize: "12px", flexShrink: 0 },
    reason: { marginTop: "6px", fontSize: "13px", color: "#555", display: "flex", alignItems: "center" },
    actions: {
        display: "flex", gap: "8px", flexWrap: "wrap",
        marginTop: "14px", paddingTop: "12px",
        borderTop: "1px solid #f0f0f0", alignItems: "center",
    },
    actionBtn: {
        border: "none", borderRadius: "6px", padding: "6px 14px",
        cursor: "pointer", fontWeight: "600", fontSize: "13px",
    },
    deleteBtn: {
        marginLeft: "auto", backgroundColor: "transparent", color: "#d32f2f",
        borderWidth: "1px", borderStyle: "solid", borderColor: "#d32f2f",
        borderRadius: "6px", padding: "6px 14px", cursor: "pointer",
        fontWeight: "600", fontSize: "13px",
    },
    confirmRow: { marginLeft: "auto", display: "flex", alignItems: "center", fontSize: "13px", color: "#555" },
    yesBtn: {
        backgroundColor: "#d32f2f", color: "white", border: "none",
        borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontWeight: "600",
    },
    noBtn: {
        backgroundColor: "#e0e0e0", color: "#333", border: "none",
        borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontWeight: "600",
    },
    errorMsg: {
        backgroundColor: "#ffebee", color: "#d32f2f",
        borderRadius: "6px", padding: "10px 16px", marginBottom: "16px",
    },
    emptyMsg: { color: "#666", textAlign: "center", padding: "32px" },
};