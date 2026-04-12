import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaIdCard, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import doctorService from "../services/doctorService";
import specializationService from "../services/specializationService";
import Navbar from "./Navbar";

const formatTime = (time) => {
    if (!time) return "00:00:00";
    return time.length === 5 ? `${time}:00` : time;
};

export default function AdminDoctors() {
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [specializations, setSpecializations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editError, setEditError] = useState("");
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phoneNumber: "",
        gender: "", password: "Test@1234",
        specializationId: "", licenseNumber: "",
        yearsOfExperience: "", consultationFee: "",
        availableFrom: "09:00", availableTo: "17:00",
    });

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const data = await doctorService.getAll();
            setDoctors(data);
        } catch {
            setError("Failed to load doctors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
        specializationService.getAll().then(setSpecializations).catch(() => { });
    }, []);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const handleEditChange = (e) => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleNext = () => {
        setError("");
        if (!form.firstName || !form.lastName || !form.email || !form.phoneNumber || !form.gender || !form.password) {
            setError("Please fill in all required fields.");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.specializationId || !form.licenseNumber || !form.yearsOfExperience || !form.consultationFee) {
            setError("Please fill in all required fields.");
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                password: form.password,
                doctor: {
                    firstName: form.firstName, lastName: form.lastName,
                    email: form.email, phoneNumber: form.phoneNumber,
                    gender: form.gender,
                    specializationId: parseInt(form.specializationId),
                    licenseNumber: form.licenseNumber,
                    yearsOfExperience: parseInt(form.yearsOfExperience),
                    consultationFee: parseFloat(form.consultationFee),
                    availableFrom: formatTime(form.availableFrom),
                    availableTo: formatTime(form.availableTo),
                },
            };
            await doctorService.createDoctor(payload);
            setSuccess("Doctor created successfully!");
            setShowForm(false);
            setStep(1);
            setForm({ firstName: "", lastName: "", email: "", phoneNumber: "", gender: "", password: "Test@1234", specializationId: "", licenseNumber: "", yearsOfExperience: "", consultationFee: "", availableFrom: "09:00", availableTo: "17:00" });
            await loadDoctors();
        } catch (err) {
            setError(err.response?.data?.title || err.message || "Operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (d) => {
        setEditingId(d.doctorId);
        setEditError("");
        setEditForm({
            specializationId: String(d.specializationId || ""),
            licenseNumber: d.licenseNumber || "",
            yearsOfExperience: d.yearsOfExperience || "",
            consultationFee: d.consultationFee || "",
            availableFrom: d.availableFrom || "09:00",
            availableTo: d.availableTo || "17:00",
        });
    };

    const cancelEdit = () => { setEditingId(null); setEditError(""); };

    const handleEditSubmit = async (id) => {
        setEditError("");
        if (!editForm.specializationId || !editForm.licenseNumber || !editForm.yearsOfExperience || !editForm.consultationFee) {
            setEditError("Please fill in all required fields.");
            return;
        }
        try {
            setEditSubmitting(true);
            const doctor = doctors.find(d => d.doctorId === id);
            const payload = {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email: doctor.email,
                phoneNumber: doctor.phoneNumber,
                gender: doctor.gender,
                specializationId: parseInt(editForm.specializationId),
                licenseNumber: editForm.licenseNumber,
                yearsOfExperience: parseInt(editForm.yearsOfExperience),
                consultationFee: parseFloat(editForm.consultationFee),
                availableFrom: formatTime(editForm.availableFrom),
                availableTo: formatTime(editForm.availableTo),
            };
            await doctorService.update(id, payload);
            setSuccess("Doctor updated successfully!");
            setEditingId(null);
            await loadDoctors();
        } catch (err) {
            setEditError(err.response?.data?.title || err.message || "Update failed.");
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        try {
            setActionLoading("toggle" + id);
            await doctorService.toggleStatus(id);
            setSuccess(`Doctor ${isActive ? "deactivated" : "reactivated"} successfully!`);
            await loadDoctors();
        } catch {
            setError("Failed to update doctor status.");
        } finally {
            setActionLoading(null);
        }
    };

    const initials = (d) => `${d.firstName?.[0] || ""}${d.lastName?.[0] || ""}`.toUpperCase();

    const filteredDoctors = doctors.filter(d => {
        const q = search.toLowerCase();
        return (
            `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
            (d.specializationName || "").toLowerCase().includes(q) ||
            (d.licenseNumber || "").toLowerCase().includes(q) ||
            (d.email || "").toLowerCase().includes(q)
        );
    });

    return (
        <div style={styles.container}>
            <Navbar role="Admin" />

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/admin")}>← Back to Dashboard</button>

                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>Doctors</h1>
                        <span style={styles.badge}>{doctors.length} total</span>
                    </div>
                    <button style={styles.addBtn} onClick={() => { setShowForm(v => !v); setStep(1); setError(""); setSuccess(""); }}>
                        {showForm ? "✕ Cancel" : "+ Add New Doctor"}
                    </button>
                </div>

                {success && <div style={styles.successMsg}>{success}</div>}
                {error && !showForm && <div style={styles.errorMsg}>{error}</div>}

                {!showForm && (
                    <input
                        style={styles.search}
                        placeholder="Search by name, specialization, license or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                )}

                {showForm && (
                    <div style={styles.card}>
                        <div style={styles.stepRow}>
                            <span style={{ ...styles.stepDot, ...(step === 1 ? styles.stepActive : styles.stepDone) }}>1</span>
                            <span style={styles.stepLabel}>Personal Info</span>
                            <div style={styles.stepLine} />
                            <span style={{ ...styles.stepDot, ...(step === 2 ? styles.stepActive : {}) }}>2</span>
                            <span style={styles.stepLabel}>Professional Info</span>
                        </div>
                        {error && <div style={styles.errorMsg}>{error}</div>}
                        {step === 1 && (
                            <>
                                <div style={styles.row}>
                                    <div style={styles.field}><label style={styles.label}>First Name *</label><input style={styles.input} name="firstName" value={form.firstName} onChange={handleChange} /></div>
                                    <div style={styles.field}><label style={styles.label}>Last Name *</label><input style={styles.input} name="lastName" value={form.lastName} onChange={handleChange} /></div>
                                </div>
                                <div style={styles.field}><label style={styles.label}>Email *</label><input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange} /></div>
                                <div style={styles.field}><label style={styles.label}>Phone Number *</label><input style={styles.input} name="phoneNumber" value={form.phoneNumber} onChange={handleChange} /></div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Gender *</label>
                                    <select style={styles.input} name="gender" value={form.gender} onChange={handleChange}>
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Password *</label>
                                    <div style={styles.pwWrap}>
                                        <input style={{ ...styles.input, paddingRight: "40px" }} name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} />
                                        <span style={styles.eyeIcon} onClick={() => setShowPassword(v => !v)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                                    </div>
                                </div>
                                <div style={styles.formActions}>
                                    <button style={styles.nextBtn} onClick={handleNext}>Next →</button>
                                </div>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <div style={styles.field}>
                                    <label style={styles.label}>Specialization *</label>
                                    <select style={styles.input} name="specializationId" value={form.specializationId} onChange={handleChange}>
                                        <option value="">Select specialization</option>
                                        {specializations.map(sp => <option key={sp.specializationId} value={String(sp.specializationId)}>{sp.name}</option>)}
                                    </select>
                                </div>
                                <div style={styles.field}><label style={styles.label}>License Number *</label><input style={styles.input} name="licenseNumber" value={form.licenseNumber} onChange={handleChange} /></div>
                                <div style={styles.row}>
                                    <div style={styles.field}><label style={styles.label}>Years of Experience *</label><input style={styles.input} name="yearsOfExperience" type="number" min="0" value={form.yearsOfExperience} onChange={handleChange} /></div>
                                    <div style={styles.field}><label style={styles.label}>Consultation Fee *</label><input style={styles.input} name="consultationFee" type="number" min="0" step="0.01" value={form.consultationFee} onChange={handleChange} /></div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.field}><label style={styles.label}>Available From *</label><input style={styles.input} name="availableFrom" type="time" value={form.availableFrom} onChange={handleChange} /></div>
                                    <div style={styles.field}><label style={styles.label}>Available To *</label><input style={styles.input} name="availableTo" type="time" value={form.availableTo} onChange={handleChange} /></div>
                                </div>
                                <div style={styles.formActions}>
                                    <button style={styles.backFormBtn} onClick={() => { setStep(1); setError(""); }}>← Back</button>
                                    <button style={styles.nextBtn} onClick={handleSubmit} disabled={submitting}>{submitting ? "Creating..." : "Create Doctor"}</button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {loading ? (
                    <p style={styles.emptyMsg}>Loading...</p>
                ) : filteredDoctors.length === 0 ? (
                    <p style={styles.emptyMsg}>{search ? "No doctors match your search." : "No doctors found."}</p>
                ) : (
                    filteredDoctors.map((d, idx) => (
                        <div key={d.doctorId ?? idx} style={{ ...styles.card, ...(d.isActive ? {} : styles.cardInactive) }}>
                            <div style={styles.doctorRow}>
                                <div style={{ ...styles.avatar, ...(d.isActive ? {} : styles.avatarInactive) }}>{initials(d)}</div>
                                <div style={styles.doctorInfo}>
                                    <div style={styles.doctorNameRow}>
                                        <div style={styles.doctorName}>{d.firstName} {d.lastName}</div>
                                        <span style={d.isActive ? styles.activeBadge : styles.inactiveBadge}>
                                            {d.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <div style={styles.doctorSpec}>{d.specializationName || "—"}</div>
                                    <div style={styles.doctorDetail}><FaEnvelope style={styles.icon} /> {d.email}</div>
                                    <div style={styles.doctorDetail}><FaIdCard style={styles.icon} /> {d.licenseNumber}</div>
                                </div>
                                <div style={styles.cardActions}>
                                    <button
                                        style={editingId === d.doctorId ? styles.editBtnActive : styles.editBtn}
                                        onClick={() => editingId === d.doctorId ? cancelEdit() : startEdit(d)}
                                    >
                                        {editingId === d.doctorId ? <><FaTimes style={{ marginRight: "5px" }} />Cancel</> : <><FaEdit style={{ marginRight: "5px" }} />Edit</>}
                                    </button>
                                    <button
                                        style={d.isActive ? styles.deactivateBtn : styles.reactivateBtn}
                                        disabled={actionLoading === "toggle" + d.doctorId}
                                        onClick={() => handleToggleStatus(d.doctorId, d.isActive)}
                                    >
                                        {actionLoading === "toggle" + d.doctorId ? "..." : d.isActive ? "Deactivate" : "Reactivate"}
                                    </button>
                                </div>
                            </div>

                            {editingId === d.doctorId && (
                                <div style={styles.editSection}>
                                    <div style={styles.editDivider} />
                                    <h4 style={styles.editTitle}>Edit Professional Info</h4>
                                    {editError && <div style={styles.errorMsg}>{editError}</div>}
                                    <div style={styles.field}>
                                        <label style={styles.label}>Specialization *</label>
                                        <select style={styles.input} name="specializationId" value={editForm.specializationId} onChange={handleEditChange}>
                                            <option value="">Select specialization</option>
                                            {specializations.map(sp => <option key={sp.specializationId} value={String(sp.specializationId)}>{sp.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={styles.field}><label style={styles.label}>License Number *</label><input style={styles.input} name="licenseNumber" value={editForm.licenseNumber} onChange={handleEditChange} /></div>
                                    <div style={styles.row}>
                                        <div style={styles.field}><label style={styles.label}>Years of Experience *</label><input style={styles.input} name="yearsOfExperience" type="number" min="0" value={editForm.yearsOfExperience} onChange={handleEditChange} /></div>
                                        <div style={styles.field}><label style={styles.label}>Consultation Fee *</label><input style={styles.input} name="consultationFee" type="number" min="0" step="0.01" value={editForm.consultationFee} onChange={handleEditChange} /></div>
                                    </div>
                                    <div style={styles.row}>
                                        <div style={styles.field}><label style={styles.label}>Available From *</label><input style={styles.input} name="availableFrom" type="time" value={editForm.availableFrom} onChange={handleEditChange} /></div>
                                        <div style={styles.field}><label style={styles.label}>Available To *</label><input style={styles.input} name="availableTo" type="time" value={editForm.availableTo} onChange={handleEditChange} /></div>
                                    </div>
                                    <div style={styles.formActions}>
                                        <button style={styles.backFormBtn} onClick={cancelEdit}><FaTimes style={{ marginRight: "5px" }} />Cancel</button>
                                        <button style={styles.nextBtn} onClick={() => handleEditSubmit(d.doctorId)} disabled={editSubmitting}>
                                            <FaCheck style={{ marginRight: "5px" }} />{editSubmitting ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "900px", margin: "0 auto", padding: "40px 20px" },
    backBtn: { background: "transparent", border: "none", color: "#2e7d32", cursor: "pointer", fontWeight: "600", fontSize: "15px", marginBottom: "16px", padding: 0 },
    pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
    pageTitle: { fontSize: "28px", color: "#1a1a1a", marginBottom: "4px" },
    badge: { backgroundColor: "#2e7d32", color: "white", borderRadius: "20px", padding: "2px 12px", fontSize: "13px", fontWeight: "600" },
    addBtn: { backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "6px", padding: "10px 20px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
    search: { width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", marginBottom: "20px", boxSizing: "border-box" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "16px" },
    cardInactive: { opacity: "0.75", borderLeft: "4px solid #d32f2f" },
    stepRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" },
    stepDot: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", backgroundColor: "#e0e0e0", color: "#666" },
    stepActive: { backgroundColor: "#2e7d32", color: "white" },
    stepDone: { backgroundColor: "#a5d6a7", color: "white" },
    stepLabel: { fontSize: "13px", color: "#555" },
    stepLine: { flex: 1, height: "2px", backgroundColor: "#e0e0e0" },
    row: { display: "flex", gap: "16px" },
    field: { flex: 1, marginBottom: "16px" },
    label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#333" },
    input: { width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", boxSizing: "border-box" },
    pwWrap: { position: "relative" },
    eyeIcon: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" },
    formActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" },
    nextBtn: { backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "6px", padding: "10px 24px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center" },
    backFormBtn: { backgroundColor: "transparent", color: "#2e7d32", borderWidth: "1px", borderStyle: "solid", borderColor: "#2e7d32", borderRadius: "6px", padding: "10px 20px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center" },
    doctorRow: { display: "flex", alignItems: "center", gap: "16px" },
    avatar: { width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#2e7d32", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "18px", flexShrink: 0 },
    avatarInactive: { backgroundColor: "#9e9e9e" },
    doctorInfo: { flex: 1 },
    doctorNameRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" },
    doctorName: { fontWeight: "700", fontSize: "16px", color: "#1a1a1a" },
    activeBadge: { backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "700" },
    inactiveBadge: { backgroundColor: "#ffebee", color: "#d32f2f", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "700" },
    doctorSpec: { color: "#2e7d32", fontSize: "13px", fontWeight: "600", marginBottom: "4px" },
    doctorDetail: { fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" },
    icon: { color: "#2e7d32", fontSize: "12px", flexShrink: 0 },
    cardActions: { display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 },
    editBtn: { backgroundColor: "transparent", color: "#2e7d32", borderWidth: "1px", borderStyle: "solid", borderColor: "#2e7d32", borderRadius: "6px", padding: "7px 14px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center" },
    editBtnActive: { backgroundColor: "#ffebee", color: "#d32f2f", borderWidth: "1px", borderStyle: "solid", borderColor: "#d32f2f", borderRadius: "6px", padding: "7px 14px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center" },
    deactivateBtn: { backgroundColor: "transparent", color: "#d32f2f", borderWidth: "1px", borderStyle: "solid", borderColor: "#d32f2f", borderRadius: "6px", padding: "7px 14px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
    reactivateBtn: { backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "6px", padding: "7px 14px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
    editSection: { marginTop: "8px" },
    editDivider: { height: "1px", backgroundColor: "#f0f0f0", margin: "16px 0" },
    editTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px" },
    successMsg: { backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "6px", padding: "10px 16px", marginBottom: "16px", fontWeight: "600" },
    errorMsg: { backgroundColor: "#ffebee", color: "#d32f2f", borderRadius: "6px", padding: "10px 16px", marginBottom: "16px" },
    emptyMsg: { color: "#666", textAlign: "center", padding: "32px" },
};