import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import doctorService from "../services/doctorService";
import appointmentService from "../services/appointmentService";
import { FaHospital, FaClock, FaDollarSign, FaUserMd, FaCalendarAlt } from "react-icons/fa";
import Navbar from "./Navbar";

const DAYS = [
    { label: "Sun", value: 0 }, { label: "Mon", value: 1 },
    { label: "Tue", value: 2 }, { label: "Wed", value: 3 },
    { label: "Thu", value: 4 }, { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
];

function BookAppointment() {
    const navigate = useNavigate();

    // ── Shared state ─────────────────────────────────────────────
    const [specializations, setSpecializations] = useState([]);
    const [specializationId, setSpecializationId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ── Path selection ───────────────────────────────────────────
    // null = not chosen, "preferred" = Path A, "earliest" = Path B
    const [path, setPath] = useState(null);

    // ── Path A — Preferred Doctor ────────────────────────────────
    const [doctors, setDoctors] = useState([]);
    const [doctorId, setDoctorId] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [selectedDay, setSelectedDay] = useState("");   // e.g. "1" = Monday

    // ── Path B — Earliest Slot ───────────────────────────────────
    const [earliestSlots, setEarliestSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // ── Booking form (shared by both paths) ──────────────────────
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [reasonForVisit, setReasonForVisit] = useState("");

    // ── Load all doctors on mount, derive specializations from them ──
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await doctorService.getAll();
                setDoctors(data.filter(d => d.isActive));
                // Derive unique specializations from doctors list
                const specs = [];
                const seen = new Set();
                data.filter(d => d.isActive).forEach(d => {
                    if (!seen.has(d.specializationId)) {
                        seen.add(d.specializationId);
                        specs.push({ specializationId: d.specializationId, name: d.specializationName });
                    }
                });
                setSpecializations(specs);
            } catch {
                setError("Failed to load doctors.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // ── When specialization changes in Path A — filter from loaded doctors ──
    useEffect(() => {
        if (!specializationId || path !== "preferred") return;
        // Reset doctor selection when specialization changes
        setDoctorId("");
        setSelectedDoctor(null);
        setAvailability([]);
        setSelectedDay("");
    }, [specializationId, path]);

    // ── When specialization changes in Path B — load earliest slots
    useEffect(() => {
        if (!specializationId || path !== "earliest") return;
        const fetchSlots = async () => {
            setSlotsLoading(true);
            try {
                const data = await doctorService.getEarliestSlots(specializationId);
                setEarliestSlots(data);
            } catch {
                setError("Failed to load available slots.");
            } finally {
                setSlotsLoading(false);
            }
        };
        fetchSlots();
    }, [specializationId, path]);

    // ── Path A — doctor selected ──────────────────────────────────
    const handleDoctorChange = async (e) => {
        const id = e.target.value;
        setDoctorId(id);
        setSelectedDay("");
        setAppointmentDate("");
        if (!id) { setSelectedDoctor(null); setAvailability([]); return; }

        const doc = doctors.find(d => d.doctorId === parseInt(id));
        setSelectedDoctor(doc || null);

        try {
            const availData = await doctorService.getAvailability(parseInt(id));
            setAvailability(availData);
        } catch {
            setAvailability([]);
        }
    };

    // ── Path B — doctor card clicked ──────────────────────────────
    const handleSlotSelect = async (slot) => {
        const doc = {
            doctorId: slot.doctorId,
            firstName: slot.fullName.replace("Dr. ", "").split(" ")[0],
            lastName: slot.fullName.replace("Dr. ", "").split(" ")[1],
            specializationName: slot.specialization,
            availableFrom: slot.availableFrom,
            availableTo: slot.availableTo,
            consultationFee: slot.consultationFee,
        };
        setSelectedDoctor(doc);
        setDoctorId(String(slot.doctorId));
        setAvailability(slot.weeklySchedule);

        // Pre-fill day and date from earliest slot
        const dayValue = slot.weeklySchedule.find(
            a => a.dayName === slot.earliestDay
        )?.dayOfWeek;
        setSelectedDay(String(dayValue ?? ""));
        setAppointmentDate(slot.earliestDate);
    };

    // ── When day selected — clear date ────────────────────────────
    const handleDayChange = (e) => {
        setSelectedDay(e.target.value);
        setAppointmentDate("");
    };

    // ── Get next 4 valid dates for selected day ───────────────────
    const getNextValidDates = (dayValue) => {
        const dates = [];
        const today = new Date();
        for (let i = 1; dates.length < 4; i++) {
            const candidate = new Date(today);
            candidate.setDate(today.getDate() + i);
            if (candidate.getDay() === parseInt(dayValue)) {
                dates.push(candidate.toISOString().split("T")[0]);
            }
        }
        return dates;
    };

    // ── Submit ────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!doctorId) { setError("Please select a doctor."); return; }
        if (!appointmentDate || !appointmentTime) { setError("Please select a date and time."); return; }

        const combinedDateTime = `${appointmentDate}T${appointmentTime}:00`;
        setSubmitting(true);

        try {
            await appointmentService.create({
                doctorId: parseInt(doctorId),
                appointmentDate: combinedDateTime,
                durationMinutes: parseInt(durationMinutes),
                reasonForVisit: reasonForVisit || null,
            });
            setSuccess("Appointment booked successfully!");
            setTimeout(() => navigate("/patient/appointments"), 1500);
        } catch (err) {
            const data = err.response?.data;
            if (typeof data === "string") {
                setError(data);
            } else if (data?.title) {
                setError(data.title);
            } else if (data?.errors) {
                setError(Object.values(data.errors).flat().join(", "));
            } else {
                setError("Failed to book appointment. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ── Available days for dropdown (Path A + B) ──────────────────
    const availableDays = DAYS.filter(d =>
        availability.find(a => a.dayOfWeek === d.value && a.isAvailable)
    );

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Navbar role="Patient" />

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/patient/appointments")}>
                    ← Back to Appointments
                </button>

                <div style={styles.card}>
                    <h2 style={styles.title}>Book an Appointment</h2>

                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}

                    {/* ── Step 1 — Specialization ── */}
                    <p style={styles.sectionTitle}>Step 1 — Select Specialization</p>
                    <div style={styles.field}>
                        <label style={styles.label}>Specialization</label>
                        <select
                            style={styles.input}
                            value={specializationId}
                            onChange={e => { setSpecializationId(e.target.value); setPath(null); setSelectedDoctor(null); setDoctorId(""); }}
                        >
                            <option value="">-- Choose a specialization --</option>
                            {specializations.map(s => (
                                <option key={s.specializationId} value={s.specializationId}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ── Step 2 — Path Selection ── */}
                    {specializationId && !path && (
                        <>
                            <p style={styles.sectionTitle}>Step 2 — How would you like to book?</p>
                            <div style={styles.pathRow}>
                                <button style={styles.pathBtn} onClick={() => setPath("preferred")}>
                                    <span style={styles.pathIcon}>👤</span>
                                    <span style={styles.pathLabel}>I have a preferred doctor</span>
                                    <span style={styles.pathHint}>Choose your doctor first</span>
                                </button>
                                <button style={styles.pathBtn} onClick={() => setPath("earliest")}>
                                    <span style={styles.pathIcon}>⚡</span>
                                    <span style={styles.pathLabel}>Find Earliest Slot</span>
                                    <span style={styles.pathHint}>Show me who's available soonest</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Path A — Preferred Doctor ── */}
                    {path === "preferred" && specializationId && (
                        <>
                            <p style={styles.sectionTitle}>
                                Step 2 — Preferred Doctor
                                <button style={styles.changeBtn} onClick={() => { setPath(null); setSelectedDoctor(null); }}>Change</button>
                            </p>

                            <div style={styles.field}>
                                <label style={styles.label}>Select Doctor</label>
                                <select style={styles.input} value={doctorId} onChange={handleDoctorChange}>
                                    <option value="">-- Choose a doctor --</option>
                                    {doctors
                                        .filter(d => d.specializationId === parseInt(specializationId))
                                        .map(doc => (
                                            <option key={doc.doctorId} value={doc.doctorId}>
                                                Dr. {doc.firstName} {doc.lastName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {selectedDoctor && <DoctorCard doctor={selectedDoctor} availability={availability} />}
                        </>
                    )}

                    {/* ── Path B — Earliest Slots ── */}
                    {path === "earliest" && specializationId && !selectedDoctor && (
                        <>
                            <p style={styles.sectionTitle}>
                                Step 2 — Earliest Available
                                <button style={styles.changeBtn} onClick={() => setPath(null)}>Change</button>
                            </p>

                            {slotsLoading && <p style={styles.hint}>Loading available doctors...</p>}
                            {!slotsLoading && earliestSlots.length === 0 && (
                                <p style={styles.hint}>No doctors available for this specialization.</p>
                            )}
                            {!slotsLoading && earliestSlots.map(slot => (
                                <div
                                    key={slot.doctorId}
                                    style={styles.slotCard}
                                    onClick={() => handleSlotSelect(slot)}
                                >
                                    <div style={styles.slotLeft}>
                                        <p style={styles.slotName}>{slot.fullName}</p>
                                        <p style={styles.slotSpec}>{slot.specialization}</p>
                                        <p style={styles.slotExp}>{slot.yearsOfExperience} yrs exp</p>
                                        <div style={styles.slotBadges}>
                                            {slot.weeklySchedule
                                                .filter(a => a.isAvailable)
                                                .map(a => (
                                                    <span key={a.dayOfWeek} style={styles.slotDayBadge}>
                                                        {a.dayName.substring(0, 3)}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div style={styles.slotRight}>
                                        <span style={styles.slotEarliest}>🟢 {slot.earliestDay}</span>
                                        <span style={styles.slotDate}>{slot.earliestDate}</span>
                                        <span style={styles.slotFee}>${slot.consultationFee}</span>
                                        <span style={styles.slotHours}>{slot.availableFrom} – {slot.availableTo}</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── Path B — Doctor selected, show card ── */}
                    {path === "earliest" && selectedDoctor && (
                        <>
                            <p style={styles.sectionTitle}>
                                Step 2 — Selected Doctor
                                <button style={styles.changeBtn} onClick={() => { setSelectedDoctor(null); setDoctorId(""); setAvailability([]); setSelectedDay(""); setAppointmentDate(""); }}>Change</button>
                            </p>
                            <DoctorCard doctor={selectedDoctor} availability={availability} />
                        </>
                    )}

                    {/* ── Step 3 — Booking Form (shown after doctor selected) ── */}
                    {selectedDoctor && (
                        <form onSubmit={handleSubmit}>
                            <p style={styles.sectionTitle}>Step 3 — Choose Date & Time</p>

                            {/* Day dropdown — only available days */}
                            <div style={styles.field}>
                                <label style={styles.label}>Available Day</label>
                                <select style={styles.input} value={selectedDay} onChange={handleDayChange} required>
                                    <option value="">-- Select a day --</option>
                                    {availableDays.map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Calendar — only valid days are clickable */}
                            {selectedDay && (
                                <div style={styles.field}>
                                    <label style={styles.label}>Date</label>
                                    <DatePicker
                                        selected={appointmentDate ? new Date(appointmentDate + "T00:00:00") : null}
                                        onChange={(date) => setAppointmentDate(date.toISOString().split("T")[0])}
                                        filterDate={(date) => date.getDay() === parseInt(selectedDay)}
                                        minDate={new Date()}
                                        placeholderText="Select a date"
                                        dateFormat="yyyy-MM-dd"
                                        customInput={<input style={styles.input} />}
                                        inline
                                    />
                                </div>
                            )}

                            {/* Time */}
                            <div style={styles.field}>
                                <label style={styles.label}>Time</label>
                                <input
                                    type="time"
                                    style={styles.input}
                                    value={appointmentTime}
                                    onChange={e => setAppointmentTime(e.target.value)}
                                    min={selectedDoctor.availableFrom}
                                    max={selectedDoctor.availableTo}
                                    required
                                />
                                <span style={styles.hint}>
                                    Available: {selectedDoctor.availableFrom} – {selectedDoctor.availableTo}
                                </span>
                            </div>

                            {/* Duration */}
                            <div style={styles.field}>
                                <label style={styles.label}>Duration</label>
                                <select style={styles.input} value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)}>
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>

                            {/* Reason */}
                            <div style={styles.field}>
                                <label style={styles.label}>
                                    Reason for Visit <span style={styles.optional}>(optional)</span>
                                </label>
                                <textarea
                                    style={styles.textarea}
                                    value={reasonForVisit}
                                    onChange={e => setReasonForVisit(e.target.value)}
                                    placeholder="Describe your symptoms or reason for visit..."
                                    rows={3}
                                />
                            </div>

                            <div style={styles.buttonRow}>
                                <button type="button" style={styles.cancelBtn} onClick={() => navigate("/patient/appointments")}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.submitBtn} disabled={submitting}>
                                    {submitting ? "Booking..." : "Book Appointment"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Doctor Info Card — reused by both paths ───────────────────────
function DoctorCard({ doctor, availability }) {
    const availableDays = DAYS.filter(d =>
        availability.find(a => a.dayOfWeek === d.value && a.isAvailable)
    );
    return (
        <div style={styles.doctorInfo}>
            <p style={styles.doctorInfoItem}>
                <span style={styles.infoRow}><FaHospital style={styles.infoIcon} /><strong>Specialization:</strong>&nbsp;{doctor.specializationName}</span>
            </p>
            <p style={styles.doctorInfoItem}>
                <span style={styles.infoRow}><FaClock style={styles.infoIcon} /><strong>Hours:</strong>&nbsp;{doctor.availableFrom} – {doctor.availableTo}</span>
            </p>
            <p style={styles.doctorInfoItem}>
                <span style={styles.infoRow}><FaCalendarAlt style={styles.infoIcon} />
                    <strong>Days:</strong>&nbsp;
                    {availableDays.length > 0
                        ? availableDays.map(d => <span key={d.value} style={styles.miniDayBadge}>{d.label}</span>)
                        : <span style={{ color: "#aaa" }}>None set</span>
                    }
                </span>
            </p>
            <p style={styles.doctorInfoItem}>
                <span style={styles.infoRow}><FaDollarSign style={styles.infoIcon} /><strong>Fee:</strong>&nbsp;${doctor.consultationFee}</span>
            </p>
            <p style={styles.doctorInfoItem}>
                <span style={styles.infoRow}><FaUserMd style={styles.infoIcon} /><strong>Experience:</strong>&nbsp;{doctor.yearsOfExperience} years</span>
            </p>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "640px", margin: "0 auto", padding: "40px 20px" },
    backBtn: { backgroundColor: "transparent", border: "none", color: "#2e7d32", cursor: "pointer", fontSize: "14px", marginBottom: "20px", padding: "0" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
    title: { color: "#1a1a1a", marginBottom: "24px" },
    sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "24px", display: "flex", alignItems: "center", gap: "8px" },
    field: { marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    optional: { fontWeight: "400", color: "#888" },
    input: { padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
    textarea: { padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "Arial, sans-serif", width: "100%", boxSizing: "border-box" },
    hint: { fontSize: "12px", color: "#888", marginTop: "2px" },
    dateButtonsRow: { display: "flex", gap: "8px", flexWrap: "wrap" },

    // Path selection
    pathRow: { display: "flex", gap: "12px", marginBottom: "8px" },
    pathBtn: { flex: 1, padding: "16px", borderRadius: "10px", border: "2px solid #ddd", backgroundColor: "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", transition: "border-color 0.2s" },
    pathIcon: { fontSize: "24px" },
    pathLabel: { fontSize: "14px", fontWeight: "600", color: "#333" },
    pathHint: { fontSize: "12px", color: "#888" },
    changeBtn: { marginLeft: "auto", fontSize: "12px", color: "#2e7d32", background: "none", border: "none", cursor: "pointer", fontWeight: "600" },

    // Doctor info card
    doctorInfo: { backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" },
    doctorInfoItem: { fontSize: "14px", color: "#444", margin: 0 },
    infoRow: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
    infoIcon: { color: "#2e7d32", fontSize: "13px", flexShrink: 0 },
    miniDayBadge: { padding: "2px 8px", borderRadius: "12px", backgroundColor: "#e8f5e9", color: "#2e7d32", fontSize: "12px", fontWeight: "600", border: "1px solid #c8e6c9" },

    // Earliest slot cards
    slotCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "10px", cursor: "pointer", backgroundColor: "white", transition: "border-color 0.2s" },
    slotLeft: { display: "flex", flexDirection: "column", gap: "4px" },
    slotName: { fontWeight: "600", fontSize: "15px", color: "#333", margin: 0 },
    slotSpec: { fontSize: "13px", color: "#2e7d32", margin: 0 },
    slotExp: { fontSize: "12px", color: "#888", margin: 0 },
    slotDayBadge: { padding: "2px 6px", borderRadius: "10px", backgroundColor: "#e8f5e9", color: "#2e7d32", fontSize: "11px", fontWeight: "600" },
    slotRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" },
    slotEarliest: { fontSize: "13px", fontWeight: "600", color: "#2e7d32" },
    slotDate: { fontSize: "12px", color: "#888" },
    slotFee: { fontSize: "13px", fontWeight: "600", color: "#333" },
    slotHours: { fontSize: "12px", color: "#888" },

    buttonRow: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" },
    cancelBtn: { padding: "12px 24px", backgroundColor: "white", color: "#666", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
    submitBtn: { padding: "12px 32px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
    error: { color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" },
    success: { color: "#2e7d32", backgroundColor: "#e8f5e9", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" },
    loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#2e7d32" },
};

export default BookAppointment;