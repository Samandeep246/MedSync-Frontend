import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import Navbar from "./Navbar";

function ChangePasswordPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password.");
            return;
        }

        setLoading(true);

        try {
            await authService.changePassword(currentPassword, newPassword);
            setSuccess(true);
        } catch (err) {
            const errData = err.response?.data;
            setError(typeof errData === "string" ? errData : "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    // Redirect back based on role
    const handleBack = () => {
        if (user?.role === "Doctor") navigate("/doctor/profile");
        else if (user?.role === "Patient") navigate("/patient/profile");
        else navigate("/");
    };

    return (
        <div style={styles.container}>
            <Navbar role="Patient" />

            {/* Content */}
            <div style={styles.content}>
                <button style={styles.backBtn} onClick={handleBack}>
                    ← Back to Profile
                </button>

                <div style={styles.card}>
                    <h2 style={styles.title}>Change Password</h2>

                    {!success ? (
                        <>
                            {error && <p style={styles.error}>{error}</p>}

                            <form onSubmit={handleSubmit}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Current Password</label>
                                    <div style={styles.inputWrapper}>
                                        <input
                                            type={showCurrent ? "text" : "password"}
                                            style={styles.input}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <span style={styles.eyeIcon} onClick={() => setShowCurrent(!showCurrent)}>
                                            {showCurrent ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>New Password</label>
                                    <div style={styles.inputWrapper}>
                                        <input
                                            type={showNew ? "text" : "password"}
                                            style={styles.input}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 8 chars, uppercase, number, special char"
                                            required
                                        />
                                        <span style={styles.eyeIcon} onClick={() => setShowNew(!showNew)}>
                                            {showNew ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.field}>
                                    <label style={styles.label}>Confirm New Password</label>
                                    <div style={styles.inputWrapper}>
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            style={styles.input}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat new password"
                                            required
                                        />
                                        <span style={styles.eyeIcon} onClick={() => setShowConfirm(!showConfirm)}>
                                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.buttonRow}>
                                    <button
                                        type="button"
                                        style={styles.cancelBtn}
                                        onClick={handleBack}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={styles.saveBtn}
                                        disabled={loading}
                                    >
                                        {loading ? "Changing..." : "Change Password"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div style={styles.successBox}>
                            <div style={styles.successIcon}><FaCheckCircle style={{ color: "#2e7d32", fontSize: "48px" }} /></div>
                            <p style={styles.successText}>Password changed successfully!</p>
                            <p style={styles.successNote}>
                                Your password has been updated.
                            </p>
                            <button style={styles.saveBtn} onClick={handleBack}>
                                Back to Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f8f9fa" },
    content: { maxWidth: "500px", margin: "0 auto", padding: "40px 20px" },
    backBtn: {
        backgroundColor: "transparent", border: "none",
        color: "#2e7d32", cursor: "pointer",
        fontSize: "14px", marginBottom: "20px", padding: "0",
    },
    card: {
        backgroundColor: "white", borderRadius: "12px",
        padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    title: { color: "#1a1a1a", marginBottom: "24px" },
    field: {
        marginBottom: "16px", display: "flex",
        flexDirection: "column", gap: "6px",
    },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    input: {
        padding: "10px 40px 10px 12px", // ← add right padding
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
    },
    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    eyeIcon: {
        position: "absolute",
        right: "12px",
        cursor: "pointer",
        color: "#888",
        fontSize: "16px",
    },
    buttonRow: {
        display: "flex", gap: "12px",
        justifyContent: "flex-end", marginTop: "24px",
    },
    cancelBtn: {
        padding: "12px 24px", backgroundColor: "white",
        color: "#666", border: "1px solid #ddd",
        borderRadius: "6px", cursor: "pointer", fontSize: "14px",
    },
    saveBtn: {
        padding: "12px 32px", backgroundColor: "#2e7d32",
        color: "white", border: "none", borderRadius: "6px",
        cursor: "pointer", fontSize: "14px",
    },
    error: {
        color: "#d32f2f", backgroundColor: "#ffebee",
        padding: "10px", borderRadius: "6px",
        marginBottom: "16px", fontSize: "14px",
    },
    successBox: { textAlign: "center", padding: "20px 0" },
    successIcon: { marginBottom: "8px" },
    successText: { fontSize: "18px", fontWeight: "600", color: "#2e7d32", marginBottom: "8px" },
    successNote: { color: "#888", fontSize: "13px", marginBottom: "24px" },
};

export default ChangePasswordPage;