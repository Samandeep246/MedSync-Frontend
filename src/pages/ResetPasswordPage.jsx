import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../services/authService";
import { FaEye, FaEyeSlash, FaCheckCircle, FaBriefcaseMedical } from "react-icons/fa";

function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Pre-fill code from URL if coming from ForgotPasswordPage
    const [code, setCode] = useState(searchParams.get("code") || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(code, newPassword);
            setSuccess(true);
        } catch (err) {
            const errData = err.response?.data;
            setError(typeof errData === "string" ? errData : "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoWrap}>
                        <FaBriefcaseMedical style={styles.logoIcon} />
                    </div>
                    <h2 style={styles.title}>MedSync</h2>
                    <p style={styles.subtitle}>Reset your password</p>  {/* keep your subtitle as-is */}
                </div>

                {!success ? (
                    <>
                        {error && <p style={styles.error}>{error}</p>}

                        <form onSubmit={handleSubmit}>
                            <div style={styles.field}>
                                <label style={styles.label}>Reset Code</label>
                                <input
                                    style={styles.input}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter 6 digit code"
                                    required
                                />
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
                                <label style={styles.label}>Confirm Password</label>
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

                            <button
                                type="submit"
                                style={styles.button}
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={styles.successBox}>
                        <div style={styles.successIcon}><FaCheckCircle style={{ color: "#2e7d32", fontSize: "48px" }} /></div>
                        <p style={styles.successText}>Password reset successfully!</p>
                        <p style={styles.successNote}>
                            You can now login with your new password.
                        </p>
                        <button
                            style={styles.button}
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                <p style={styles.backText}>
                    Remember your password?{" "}
                    <span style={styles.link} onClick={() => navigate("/login")}>
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex", justifyContent: "center",
        alignItems: "center", minHeight: "100vh",
        backgroundColor: "#f8f9fa", padding: "20px",
    },
    card: {
        backgroundColor: "white", padding: "40px",
        borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        width: "100%", maxWidth: "420px",
    },
    header: { textAlign: "center", marginBottom: "24px" },
    logoWrap: {
        width: "72px", height: "72px", borderRadius: "50%",
        backgroundColor: "#e8f5e9", display: "flex",
        alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px auto",
    },
    logoIcon: { fontSize: "36px", color: "#2e7d32" },
    title: { color: "#2e7d32", fontSize: "24px", margin: "8px 0 4px" },
    subtitle: { color: "#666", fontSize: "14px" },
    field: {
        marginBottom: "16px", display: "flex",
        flexDirection: "column", gap: "6px",
    },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    input: {
        padding: "10px 40px 10px 12px", borderRadius: "6px",
        border: "1px solid #ddd", fontSize: "14px", outline: "none",
        width: "100%", boxSizing: "border-box",
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
    button: {
        width: "100%", padding: "12px",
        backgroundColor: "#2e7d32", color: "white",
        border: "none", borderRadius: "6px",
        fontSize: "16px", cursor: "pointer", marginTop: "8px",
    },
    error: {
        color: "#d32f2f", backgroundColor: "#ffebee",
        padding: "10px", borderRadius: "6px",
        marginBottom: "16px", fontSize: "14px",
    },
    successBox: { textAlign: "center" },
    successIcon: { marginBottom: "8px" },
    successText: { fontSize: "18px", fontWeight: "600", color: "#2e7d32", marginBottom: "8px" },
    successNote: { color: "#888", fontSize: "13px", marginBottom: "24px" },
    backText: {
        textAlign: "center", marginTop: "16px",
        fontSize: "14px", color: "#666",
    },
    link: { color: "#2e7d32", cursor: "pointer", fontWeight: "600" },
};

export default ResetPasswordPage;