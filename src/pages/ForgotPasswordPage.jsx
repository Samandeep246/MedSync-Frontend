import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { FaCheckCircle, FaBriefcaseMedical } from "react-icons/fa";

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await authService.forgotPassword(email);
            setResetCode(data.resetCode);
            setSubmitted(true);
        } catch (err) {
            setError("Something went wrong. Please try again.");
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

                {!submitted ? (
                    <>
                        <p style={styles.instruction}>
                            Enter your email to get a reset code.
                        </p>

                        {error && <p style={styles.error}>{error}</p>}

                        <form onSubmit={handleSubmit}>
                            <div style={styles.field}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    style={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                style={styles.button}
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Reset Code"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={styles.successBox}>
                        <div style={styles.successIcon}><FaCheckCircle style={{ color: "#2e7d32", fontSize: "48px" }} /></div>
                        <p style={styles.successText}>Reset code generated!</p>
                        <p style={styles.codeNote}>
                            In production this would be sent to your email.
                        </p>

                        {/* Show code — remove in production */}
                        <div style={styles.codeBox}>
                            <p style={styles.codeLabel}>Your reset code:</p>
                            <p style={styles.codeValue}>{resetCode}</p>
                        </div>

                        <button
                            style={styles.button}
                            onClick={() => navigate(`/reset-password?code=${resetCode}`)}
                        >
                            Continue to Reset Password
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
    instruction: {
        color: "#666", fontSize: "14px",
        marginBottom: "24px", textAlign: "center",
    },
    field: {
        marginBottom: "16px", display: "flex",
        flexDirection: "column", gap: "6px",
    },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    input: {
        padding: "10px 12px", borderRadius: "6px",
        border: "1px solid #ddd", fontSize: "14px", outline: "none",
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
    codeNote: { color: "#888", fontSize: "13px", marginBottom: "16px" },
    codeBox: {
        backgroundColor: "#f8f9fa", borderRadius: "8px",
        padding: "16px", marginBottom: "24px",
    },
    codeLabel: { color: "#666", fontSize: "13px", marginBottom: "8px" },
    codeValue: {
        fontSize: "32px", fontWeight: "bold",
        color: "#2e7d32", letterSpacing: "8px",
    },
    backText: {
        textAlign: "center", marginTop: "16px",
        fontSize: "14px", color: "#666",
    },
    link: { color: "#2e7d32", cursor: "pointer", fontWeight: "600" },
};

export default ForgotPasswordPage;