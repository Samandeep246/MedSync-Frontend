import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import patientService from "../services/patientService";
import { FaEnvelope, FaIdCard, FaTint, FaPhone } from "react-icons/fa";
import Navbar from "./Navbar";

export default function AdminPatients() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await patientService.getAll();
                setPatients(data);
            } catch {
                setError("Failed to load patients.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = patients.filter(p => {
        const q = search.toLowerCase();
        const name = `${p.firstName} ${p.lastName}`.toLowerCase();
        return name.includes(q) || (p.email || "").toLowerCase().includes(q);
    });

    const initials = (p) =>
        `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();

    return (
        <div style={styles.container}>
            <Navbar role="Admin" />

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate("/admin")}>← Back to Dashboard</button>

                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>Patients</h1>
                        <span style={styles.badge}>{patients.length} total</span>
                    </div>
                </div>

                <input
                    style={styles.search}
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {error && <div style={styles.errorMsg}>{error}</div>}

                {loading ? (
                    <p style={styles.emptyMsg}>Loading...</p>
                ) : filtered.length === 0 ? (
                    <p style={styles.emptyMsg}>{search ? "No patients match your search." : "No patients found."}</p>
                ) : (
                    filtered.map((p, idx) => (
                        <div key={p.id ?? idx} style={styles.card}>
                            <div style={styles.patientRow}>
                                <div style={styles.avatar}>{initials(p)}</div>
                                <div style={styles.patientInfo}>
                                    <div style={styles.patientName}>{p.firstName} {p.lastName}</div>
                                    <div style={styles.patientSub}>Patient #{p.patientNumber || p.id}</div>
                                    <div style={styles.patientDetails}>
                                        <span key="email" style={styles.detailItem}><FaEnvelope style={styles.icon} /> {p.email}</span>
                                        {p.healthCardNumber && <span key="hcard" style={styles.detailItem}><FaIdCard style={styles.icon} /> {p.healthCardNumber}</span>}
                                        {p.bloodType && <span key="blood" style={styles.detailItem}><FaTint style={styles.icon} /> {p.bloodType}</span>}
                                        {p.phoneNumber && <span key="phone" style={styles.detailItem}><FaPhone style={styles.icon} /> {p.phoneNumber}</span>}
                                    </div>
                                </div>
                            </div>
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
    search: {
        width: "100%", padding: "10px 14px", borderRadius: "6px",
        border: "1px solid #ccc", fontSize: "14px",
        marginBottom: "20px", boxSizing: "border-box",
    },
    card: {
        backgroundColor: "white", borderRadius: "12px", padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "14px",
    },
    patientRow: { display: "flex", alignItems: "center", gap: "16px" },
    avatar: {
        width: "48px", height: "48px", borderRadius: "50%",
        backgroundColor: "#1565c0", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "700", fontSize: "17px", flexShrink: 0,
    },
    patientInfo: { flex: 1 },
    patientName: { fontWeight: "700", fontSize: "16px", color: "#1a1a1a" },
    patientSub: { color: "#555", fontSize: "13px", marginBottom: "4px" },
    patientDetails: { display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "13px", color: "#666", marginTop: "4px" },
    detailItem: { display: "flex", alignItems: "center", gap: "5px" },
    icon: { color: "#2e7d32", fontSize: "13px", flexShrink: 0 },
    errorMsg: {
        backgroundColor: "#ffebee", color: "#d32f2f",
        borderRadius: "6px", padding: "10px 16px", marginBottom: "16px",
    },
    emptyMsg: { color: "#666", textAlign: "center", padding: "32px" },
};