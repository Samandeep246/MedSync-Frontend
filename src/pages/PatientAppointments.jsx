import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import { useAuth } from "../context/AuthContext";
import appointmentService from "../services/appointmentService";
import doctorService from "../services/doctorService";
import Navbar from "./Navbar";

const DAYS = [
    { label: "Sun", value: 0 }, { label: "Mon", value: 1 },
    { label: "Tue", value: 2 }, { label: "Wed", value: 3 },
    { label: "Thu", value: 4 }, { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
];

const CANCEL_PRESETS = [
    "Feeling better",
    "Work conflict",
    "Emergency",
    "Transportation issue",
    "Doctor unavailable",
    "Other",
];

const RESCHEDULE_PRESETS = [
    "Work conflict",
    "Personal emergency",
    "Transportation issue",
    "Prefer a different time",
    "Other",
];

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

function isWithin12Hours(appointmentDate) {
    return new Date(appointmentDate) - new Date() < TWELVE_HOURS_MS;
}

function PatientAppointments() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");

    // Which card is expanded — "cancel" | "reschedule" | null
    const [expandedId, setExpandedId] = useState(null);
    const [expandedMode, setExpandedMode] = useState(null);

    // Cancel state
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelPreset, setCancelPreset] = useState("");
    const [cancelCustom, setCancelCustom] = useState("");
    const [cancelError, setCancelError] = useState("");

    // Reschedule state
    const [availability, setAvailability] = useState([]);
    const [selectedDay, setSelectedDay] = useState("");
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState("");
    const [reschedulePreset, setReschedulePreset] = useState("");
    const [rescheduleCustom, setRescheduleCustom] = useState("");
    const [rescheduling, setRescheduling] = useState(false);
    const [rescheduleError, setRescheduleError] = useState("");

    useEffect(() => { fetchAppointments(); }, []);

    const fetchAppointments = async () => {
        try {
            const data = await appointmentService.getByPatient(user?.patientId);
            setAppointments(data);
        } catch {
            setError("Failed to load appointments.");
        } finally {
            setLoading(false);
        }
    };

    // ── Build reason string from preset + custom ──────────────────
    const buildReason = (preset, custom) => {
        if (!preset) return null;
        if (preset === "Other") return custom.trim() || null;
        return custom.trim() ? `${preset} — ${custom.trim()}` : preset;
    };

    // ── Expand helpers ────────────────────────────────────────────
    const openCancel = (apt) => {
        setExpandedId(apt.appointmentId);
        setExpandedMode("cancel");
        setCancelPreset("");
        setCancelCustom("");
        setCancelError("");
    };

    const openReschedule = async (apt) => {
        setExpandedId(apt.appointmentId);
        setExpandedMode("reschedule");
        setSelectedDay("");
        setRescheduleDate("");
        setRescheduleTime("");
        setReschedulePreset("");
        setRescheduleCustom("");
        setRescheduleError("");
        try {
            const data = await doctorService.getAvailability(apt.doctorId);
            setAvailability(data);
        } catch {
            setAvailability([]);
        }
    };

    const closeExpanded = () => {
        setExpandedId(null);
        setExpandedMode(null);
        setCancelError("");
        setRescheduleError("");
    };

    // ── Cancel ────────────────────────────────────────────────────
    const handleCancel = async (apt) => {
        if (!cancelPreset) {
            setCancelError("Please select a reason for cancellation.");
            return;
        }
        const reason = buildReason(cancelPreset, cancelCustom);
        if (cancelPreset === "Other" && !reason) {
            setCancelError("Please describe your reason.");
            return;
        }
        setCancelError("");
        setCancellingId(apt.appointmentId);
        try {
            await appointmentService.updateStatus(apt.appointmentId, "Cancelled", reason);
            closeExpanded();
            await fetchAppointments();
        } catch {
            setCancelError("Failed to cancel appointment.");
        } finally {
            setCancellingId(null);
        }
    };

    // ── Reschedule ────────────────────────────────────────────────
    const handleReschedule = async (apt) => {
        setRescheduleError("");
        if (!rescheduleDate || !rescheduleTime) {
            setRescheduleError("Please select a date and time.");
            return;
        }
        const combined = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
        if (combined - new Date() < TWELVE_HOURS_MS) {
            setRescheduleError("New time must be at least 12 hours from now.");
            return;
        }
        if (reschedulePreset === "Other" && !rescheduleCustom.trim()) {
            setRescheduleError("Please describe your reason.");
            return;
        }
        const reason = buildReason(reschedulePreset, rescheduleCustom);
        setRescheduling(true);
        try {
            await appointmentService.update(apt.appointmentId, {
                patientId: apt.patientId,
                doctorId: apt.doctorId,
                appointmentDate: `${rescheduleDate}T${rescheduleTime}:00`,
                durationMinutes: apt.durationMinutes,
                reasonForVisit: apt.reasonForVisit || null,
                notes: apt.notes || null,
                reason: reason || null,
            });
            closeExpanded();
            await fetchAppointments();
        } catch (err) {
            setRescheduleError(err.response?.data || "Failed to reschedule.");
        } finally {
            setRescheduling(false);
        }
    };

    const availableDays = DAYS.filter(d =>
        availability.find(a => a.dayOfWeek === d.value && a.isAvailable)
    );

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

    const filteredAppointments = filter === "All"
        ? appointments
        : appointments.filter(a => a.status === filter);

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Navbar role="Patient" />

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/patient")}>
                    ← Back to Dashboard
                </button>

                <div style={styles.header}>
                    <h2 style={styles.title}>My Appointments</h2>
                    <button style={styles.bookBtn} onClick={() => navigate("/patient/book")}>
                        + Book New
                    </button>
                </div>

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
                        <button style={styles.bookBtn} onClick={() => navigate("/patient/book")}>
                            Book your first appointment
                        </button>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {filteredAppointments
                            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                            .map(apt => {
                                const canAct = (apt.status === "Scheduled" || apt.status === "Confirmed")
                                    && !isWithin12Hours(apt.appointmentDate);
                                const tooLate = (apt.status === "Scheduled" || apt.status === "Confirmed")
                                    && isWithin12Hours(apt.appointmentDate);
                                const isExpanded = expandedId === apt.appointmentId;

                                return (
                                    <div key={apt.appointmentId} style={styles.card}>
                                        {/* ── Main row ── */}
                                        <div style={styles.cardRow}>
                                            <div style={styles.dateBox}>
                                                <span style={styles.dateDay}>
                                                    {new Date(apt.appointmentDate).getDate()}
                                                </span>
                                                <span style={styles.dateMonth}>
                                                    {new Date(apt.appointmentDate).toLocaleString("default", { month: "short" })}
                                                </span>
                                            </div>

                                            <div style={styles.cardMiddle}>
                                                <p style={styles.doctorName}>Dr. {apt.doctorName}</p>
                                                <p style={styles.aptTime}>
                                                    {new Date(apt.appointmentDate).toLocaleTimeString([], {
                                                        hour: "2-digit", minute: "2-digit",
                                                    })}
                                                    {" · "}{apt.durationMinutes} mins
                                                </p>
                                                {apt.reasonForVisit && (
                                                    <p style={styles.reasonText}>{apt.reasonForVisit}</p>
                                                )}
                                                <p style={styles.aptNumber}>{apt.appointmentNumber}</p>
                                            </div>

                                            <div style={styles.cardRight}>
                                                <span style={getStatusStyle(apt.status)}>{apt.status}</span>
                                                {canAct && (
                                                    <div style={styles.actionBtns}>
                                                        <button
                                                            style={styles.rescheduleBtn}
                                                            onClick={() => isExpanded && expandedMode === "reschedule" ? closeExpanded() : openReschedule(apt)}
                                                        >
                                                            {isExpanded && expandedMode === "reschedule" ? "✕ Close" : "Reschedule"}
                                                        </button>
                                                        <button
                                                            style={styles.cancelBtn}
                                                            onClick={() => isExpanded && expandedMode === "cancel" ? closeExpanded() : openCancel(apt)}
                                                        >
                                                            {isExpanded && expandedMode === "cancel" ? "✕ Close" : "Cancel"}
                                                        </button>
                                                    </div>
                                                )}
                                                {tooLate && (
                                                    <div style={styles.actionBtns}>
                                                        <button style={styles.rescheduleBtnDisabled} disabled>Reschedule</button>
                                                        <button style={styles.cancelBtnDisabled} disabled>Cancel</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ── Cancel panel ── */}
                                        {isExpanded && expandedMode === "cancel" && (
                                            <div style={styles.expandPanel}>
                                                <p style={styles.expandTitle}>Cancel this appointment?</p>
                                                <p style={styles.expandHint}>
                                                    Dr. {apt.doctorName} ·{" "}
                                                    {new Date(apt.appointmentDate).toLocaleDateString([], {
                                                        weekday: "long", month: "long", day: "numeric"
                                                    })} at{" "}
                                                    {new Date(apt.appointmentDate).toLocaleTimeString([], {
                                                        hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </p>

                                                {cancelError && <p style={styles.expandError}>{cancelError}</p>}

                                                <div style={styles.field}>
                                                    <label style={styles.fieldLabel}>
                                                        Reason <span style={styles.required}>*</span>
                                                    </label>
                                                    <div style={styles.presetRow}>
                                                        {CANCEL_PRESETS.map(p => (
                                                            <button
                                                                key={p}
                                                                style={cancelPreset === p ? styles.presetActive : styles.presetBtn}
                                                                onClick={() => { setCancelPreset(p); setCancelCustom(""); setCancelError(""); }}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {cancelPreset && (
                                                    <div style={styles.field}>
                                                        <label style={styles.fieldLabel}>
                                                            Additional details
                                                            {cancelPreset === "Other"
                                                                ? <span style={styles.required}> *</span>
                                                                : <span style={styles.optional}> (optional)</span>}
                                                        </label>
                                                        <textarea
                                                            style={styles.textarea}
                                                            rows={2}
                                                            value={cancelCustom}
                                                            onChange={e => setCancelCustom(e.target.value)}
                                                            placeholder={cancelPreset === "Other" ? "Please describe your reason..." : "Any additional details..."}
                                                        />
                                                    </div>
                                                )}

                                                <div style={styles.expandBtnRow}>
                                                    <button style={styles.expandSecondaryBtn} onClick={closeExpanded}>
                                                        Keep Appointment
                                                    </button>
                                                    <button
                                                        style={styles.expandConfirmCancelBtn}
                                                        onClick={() => handleCancel(apt)}
                                                        disabled={cancellingId === apt.appointmentId}
                                                    >
                                                        {cancellingId === apt.appointmentId ? "Cancelling..." : "Yes, Cancel"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Reschedule panel ── */}
                                        {isExpanded && expandedMode === "reschedule" && (
                                            <div style={styles.expandPanel}>
                                                <p style={styles.expandTitle}>Reschedule Appointment</p>

                                                {rescheduleError && <p style={styles.expandError}>{rescheduleError}</p>}

                                                <div style={styles.field}>
                                                    <label style={styles.fieldLabel}>
                                                        Reason <span style={styles.optional}>(optional)</span>
                                                    </label>
                                                    <div style={styles.presetRow}>
                                                        {RESCHEDULE_PRESETS.map(p => (
                                                            <button
                                                                key={p}
                                                                style={reschedulePreset === p ? styles.presetActive : styles.presetBtn}
                                                                onClick={() => { setReschedulePreset(p); setRescheduleCustom(""); }}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {reschedulePreset && (
                                                    <div style={styles.field}>
                                                        <label style={styles.fieldLabel}>
                                                            Additional details
                                                            {reschedulePreset === "Other"
                                                                ? <span style={styles.required}> *</span>
                                                                : <span style={styles.optional}> (optional)</span>}
                                                        </label>
                                                        <textarea
                                                            style={styles.textarea}
                                                            rows={2}
                                                            value={rescheduleCustom}
                                                            onChange={e => setRescheduleCustom(e.target.value)}
                                                            placeholder={reschedulePreset === "Other" ? "Please describe your reason..." : "Any additional details..."}
                                                        />
                                                    </div>
                                                )}

                                                <div style={styles.field}>
                                                    <label style={styles.fieldLabel}>Available Day</label>
                                                    <select
                                                        style={styles.fieldInput}
                                                        value={selectedDay}
                                                        onChange={e => { setSelectedDay(e.target.value); setRescheduleDate(""); }}
                                                    >
                                                        <option value="">-- Select a day --</option>
                                                        {availableDays.map(d => (
                                                            <option key={d.value} value={d.value}>{d.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {selectedDay && (
                                                    <div style={styles.field}>
                                                        <label style={styles.fieldLabel}>Date</label>
                                                        <DatePicker
                                                            selected={rescheduleDate ? new Date(rescheduleDate + "T00:00:00") : null}
                                                            onChange={date => setRescheduleDate(date.toISOString().split("T")[0])}
                                                            filterDate={date => date.getDay() === parseInt(selectedDay)}
                                                            minDate={new Date()}
                                                            placeholderText="Select a date"
                                                            dateFormat="yyyy-MM-dd"
                                                            inline
                                                        />
                                                    </div>
                                                )}

                                                <div style={styles.field}>
                                                    <label style={styles.fieldLabel}>Time</label>
                                                    <input
                                                        type="time"
                                                        style={styles.fieldInput}
                                                        value={rescheduleTime}
                                                        onChange={e => setRescheduleTime(e.target.value)}
                                                    />
                                                </div>

                                                <div style={styles.expandBtnRow}>
                                                    <button style={styles.expandSecondaryBtn} onClick={closeExpanded}>
                                                        Back
                                                    </button>
                                                    <button
                                                        style={styles.expandConfirmRescheduleBtn}
                                                        onClick={() => handleReschedule(apt)}
                                                        disabled={rescheduling}
                                                    >
                                                        {rescheduling ? "Saving..." : "Confirm Reschedule"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px" },
    backBtn: {
        backgroundColor: "transparent", border: "none", color: "#2e7d32",
        cursor: "pointer", fontSize: "14px", marginBottom: "20px", padding: "0",
    },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
    title: { color: "#1a1a1a", fontSize: "24px" },
    bookBtn: {
        padding: "10px 20px", backgroundColor: "#2e7d32", color: "white",
        border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px",
    },
    filterRow: { display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" },
    filterBtn: {
        padding: "6px 16px", backgroundColor: "white", color: "#666",
        border: "1px solid #ddd", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
    },
    filterActive: {
        padding: "6px 16px", backgroundColor: "#2e7d32", color: "white",
        border: "1px solid #2e7d32", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
    },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" },
    cardRow: { padding: "20px", display: "flex", alignItems: "center", gap: "20px" },
    dateBox: {
        width: "56px", height: "56px", backgroundColor: "#e8f5e9", borderRadius: "8px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    dateDay: { fontSize: "20px", fontWeight: "bold", color: "#2e7d32", lineHeight: "1" },
    dateMonth: { fontSize: "12px", color: "#2e7d32", textTransform: "uppercase" },
    cardMiddle: { flex: 1 },
    doctorName: { fontWeight: "600", color: "#333", marginBottom: "4px", fontSize: "15px" },
    aptTime: { color: "#666", fontSize: "13px", marginBottom: "4px" },
    reasonText: { color: "#888", fontSize: "13px", marginBottom: "4px" },
    aptNumber: { color: "#aaa", fontSize: "12px" },
    cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
    actionBtns: { display: "flex", flexDirection: "column", gap: "4px" },
    rescheduleBtn: {
        padding: "4px 12px", backgroundColor: "#e3f2fd", color: "#1565c0",
        border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "600",
    },
    cancelBtn: {
        padding: "4px 12px", backgroundColor: "#ffebee", color: "#c62828",
        border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "600",
    },
    tooLateHint: { fontSize: "11px", color: "#e65100", fontWeight: "600" },
    rescheduleBtnDisabled: {
        padding: "4px 12px", backgroundColor: "#f5f5f5", color: "#bbb",
        border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "600", cursor: "not-allowed",
    },
    cancelBtnDisabled: {
        padding: "4px 12px", backgroundColor: "#f5f5f5", color: "#bbb",
        border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "600", cursor: "not-allowed",
    },
    expandPanel: { borderTop: "1px solid #f0f0f0", padding: "20px 24px", backgroundColor: "#fafafa" },
    expandTitle: { fontWeight: "700", color: "#333", marginBottom: "4px", fontSize: "15px" },
    expandHint: { color: "#666", fontSize: "13px", marginBottom: "16px" },
    expandError: {
        color: "#d32f2f", backgroundColor: "#ffebee", padding: "8px 12px",
        borderRadius: "6px", fontSize: "13px", marginBottom: "12px",
    },
    expandBtnRow: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" },
    expandSecondaryBtn: {
        padding: "8px 20px", backgroundColor: "white", color: "#666",
        border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    },
    expandConfirmCancelBtn: {
        padding: "8px 20px", backgroundColor: "#c62828", color: "white",
        border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
    },
    expandConfirmRescheduleBtn: {
        padding: "8px 20px", backgroundColor: "#2e7d32", color: "white",
        border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
    },
    presetRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" },
    presetBtn: {
        padding: "5px 12px", backgroundColor: "white", color: "#555",
        border: "1px solid #ddd", borderRadius: "20px", cursor: "pointer", fontSize: "12px",
    },
    presetActive: {
        padding: "5px 12px", backgroundColor: "#2e7d32", color: "white",
        border: "1px solid #2e7d32", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
    },
    field: { marginBottom: "14px", display: "flex", flexDirection: "column", gap: "6px" },
    fieldLabel: { fontSize: "13px", fontWeight: "600", color: "#444" },
    required: { color: "#d32f2f" },
    optional: { color: "#888", fontWeight: "400" },
    fieldInput: {
        padding: "9px 12px", borderRadius: "6px", border: "1px solid #ddd",
        fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box",
    },
    textarea: {
        padding: "9px 12px", borderRadius: "6px", border: "1px solid #ddd",
        fontSize: "13px", outline: "none", resize: "vertical",
        fontFamily: "Arial, sans-serif", width: "100%", boxSizing: "border-box",
    },
    statusScheduled: { padding: "4px 12px", backgroundColor: "#e3f2fd", color: "#1565c0", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    statusConfirmed: { padding: "4px 12px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    statusCompleted: { padding: "4px 12px", backgroundColor: "#f3e5f5", color: "#6a1b9a", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    statusCancelled: { padding: "4px 12px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    statusNoShow: { padding: "4px 12px", backgroundColor: "#fff3e0", color: "#e65100", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    empty: { textAlign: "center", padding: "60px 20px", color: "#666", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
    error: { color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" },
    loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#2e7d32" },
};

export default PatientAppointments;