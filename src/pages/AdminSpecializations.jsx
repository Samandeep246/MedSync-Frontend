import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import specializationService from "../services/specializationService";
import Navbar from "./Navbar";

function AdminSpecializations() {
    const navigate = useNavigate();

    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    // Delete confirmation
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchSpecializations();
    }, []);

    const fetchSpecializations = async () => {
        try {
            const data = await specializationService.getAll();
            setSpecializations(data);
        } catch (err) {
            setError("Failed to load specializations.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            if (editingId) {
                await specializationService.update(editingId, formData);
                setSuccess("Specialization updated successfully!");
            } else {
                await specializationService.create(formData);
                setSuccess("Specialization created successfully!");
            }
            setFormData({ name: "", description: "" });
            setShowForm(false);
            setEditingId(null);
            await fetchSpecializations();
        } catch (err) {
            const errData = err.response?.data;
            setError(typeof errData === "string" ? errData : errData?.title || "Operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (spec) => {
        setEditingId(spec.specializationId);
        setFormData({ name: spec.name, description: spec.description || "" });
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const handleDelete = async (id) => {
        try {
            await specializationService.delete(id);
            setSuccess("Specialization deleted successfully!");
            setDeletingId(null);
            await fetchSpecializations();
        } catch (err) {
            const errData = err.response?.data;
            setError(typeof errData === "string" ? errData : "Failed to delete specialization.");
            setDeletingId(null);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", description: "" });
        setError("");
    };

    return (
        <div style={styles.container}>
            <Navbar role="Admin" />

            {/* Content */}
            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/admin")}>
                    ← Back to Dashboard
                </button>

                <div style={styles.header}>
                    <h2 style={styles.title}>Specializations</h2>
                    {!showForm && (
                        <button
                            style={styles.addBtn}
                            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", description: "" }); }}
                        >
                            + Add New
                        </button>
                    )}
                </div>

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                {/* Add/Edit Form */}
                {showForm && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>
                            {editingId ? "Edit Specialization" : "Add New Specialization"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.field}>
                                <label style={styles.label}>Name</label>
                                <input
                                    style={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Cardiology"
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Description <span style={styles.optional}>(optional)</span></label>
                                <textarea
                                    style={styles.textarea}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description..."
                                    rows={3}
                                />
                            </div>
                            <div style={styles.formButtons}>
                                <button type="button" style={styles.cancelBtn} onClick={handleCancelForm}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.saveBtn} disabled={submitting}>
                                    {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Specializations List */}
                {loading ? (
                    <p style={styles.loadingText}>Loading...</p>
                ) : (
                    <div style={styles.list}>
                        {specializations.map(spec => (
                            <div key={spec.specializationId} style={styles.card}>
                                <div style={styles.cardLeft}>
                                    <h3 style={styles.specName}>{spec.name}</h3>
                                    <p style={styles.specDesc}>
                                        {spec.description || "No description provided"}
                                    </p>
                                </div>
                                <div style={styles.cardActions}>
                                    <button
                                        style={styles.editBtn}
                                        onClick={() => handleEdit(spec)}
                                    >
                                        Edit
                                    </button>
                                    {deletingId === spec.specializationId ? (
                                        <div style={styles.confirmDelete}>
                                            <span style={styles.confirmText}>Sure?</span>
                                            <button
                                                style={styles.confirmYes}
                                                onClick={() => handleDelete(spec.specializationId)}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                style={styles.confirmNo}
                                                onClick={() => setDeletingId(null)}
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={() => setDeletingId(spec.specializationId)}
                                        >
                                            Delete
                                        </button>
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

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px" },
    backBtn: {
        backgroundColor: "transparent", border: "none",
        color: "#2e7d32", cursor: "pointer",
        fontSize: "14px", marginBottom: "20px", padding: "0",
    },
    header: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px",
    },
    title: { color: "#1a1a1a", fontSize: "24px" },
    addBtn: {
        padding: "10px 20px", backgroundColor: "#2e7d32",
        color: "white", border: "none", borderRadius: "6px",
        cursor: "pointer", fontSize: "14px",
    },
    formCard: {
        backgroundColor: "white", borderRadius: "12px",
        padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        marginBottom: "24px",
    },
    formTitle: { color: "#1a1a1a", marginBottom: "16px" },
    field: { marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    optional: { fontWeight: "400", color: "#888" },
    input: {
        padding: "10px 12px", borderRadius: "6px",
        border: "1px solid #ddd", fontSize: "14px", outline: "none",
    },
    textarea: {
        padding: "10px 12px", borderRadius: "6px",
        border: "1px solid #ddd", fontSize: "14px",
        outline: "none", resize: "vertical", fontFamily: "Arial, sans-serif",
    },
    formButtons: { display: "flex", gap: "12px", justifyContent: "flex-end" },
    cancelBtn: {
        padding: "10px 20px", backgroundColor: "white",
        color: "#666", border: "1px solid #ddd",
        borderRadius: "6px", cursor: "pointer", fontSize: "14px",
    },
    saveBtn: {
        padding: "10px 24px", backgroundColor: "#2e7d32",
        color: "white", border: "none", borderRadius: "6px",
        cursor: "pointer", fontSize: "14px",
    },
    list: { display: "flex", flexDirection: "column", gap: "12px" },
    card: {
        backgroundColor: "white", borderRadius: "12px",
        padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    cardLeft: { flex: 1 },
    specName: { color: "#333", marginBottom: "4px", fontSize: "16px" },
    specDesc: { color: "#888", fontSize: "13px" },
    cardActions: { display: "flex", gap: "8px", alignItems: "center" },
    editBtn: {
        padding: "6px 16px", backgroundColor: "#e8f5e9",
        color: "#2e7d32", border: "1px solid #2e7d32",
        borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    },
    deleteBtn: {
        padding: "6px 16px", backgroundColor: "#ffebee",
        color: "#c62828", border: "1px solid #c62828",
        borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    },
    confirmDelete: { display: "flex", alignItems: "center", gap: "6px" },
    confirmText: { fontSize: "13px", color: "#666" },
    confirmYes: {
        padding: "4px 12px", backgroundColor: "#c62828",
        color: "white", border: "none", borderRadius: "4px",
        cursor: "pointer", fontSize: "12px",
    },
    confirmNo: {
        padding: "4px 12px", backgroundColor: "#eee",
        color: "#333", border: "none", borderRadius: "4px",
        cursor: "pointer", fontSize: "12px",
    },
    error: {
        color: "#d32f2f", backgroundColor: "#ffebee",
        padding: "10px", borderRadius: "6px",
        marginBottom: "16px", fontSize: "14px",
    },
    success: {
        color: "#2e7d32", backgroundColor: "#e8f5e9",
        padding: "10px", borderRadius: "6px",
        marginBottom: "16px", fontSize: "14px",
    },
    loadingText: { color: "#888", textAlign: "center", padding: "40px" },
};

export default AdminSpecializations;