import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";   // ← added useSearchParams
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { FaEye, FaEyeSlash, FaBriefcaseMedical } from "react-icons/fa";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirect");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            login(data);

            // ── go to redirect URL if present, otherwise default dashboard ──
            if (redirectTo) {
                navigate(redirectTo);
            } else if (data.role === "Admin") {
                navigate("/admin");
            } else if (data.role === "Doctor") {
                navigate("/doctor");
            } else {
                navigate("/patient");
            }
            // ─────────────────────────────────────────────────────────────────────

        } catch (err) {
            setError("Invalid email or password.");
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
                    <p style={styles.subtitle}>Sign in to your account</p>
                </div>

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
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                style={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <span style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <p style={styles.forgotText}>
                        <span style={styles.link} onClick={() => navigate("/forgot-password")}>
                            Forgot password?
                        </span>
                    </p>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p style={styles.registerText}>
                    Don't have an account?{" "}
                    <span style={styles.link} onClick={() => navigate("/register")}>
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh",
        backgroundColor: "#f8f9fa",
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
    title: { color: "#2e7d32", fontSize: "24px", margin: "0 0 4px" },
    subtitle: { color: "#666", fontSize: "14px", margin: 0 },
    field: {
        marginBottom: "16px", display: "flex",
        flexDirection: "column", gap: "6px",
    },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    input: {
        padding: "10px 40px 10px 12px", borderRadius: "6px",
        border: "1px solid #ddd", fontSize: "14px",
        outline: "none", width: "100%", boxSizing: "border-box",
    },
    inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
    eyeIcon: { position: "absolute", right: "12px", cursor: "pointer", color: "#888", fontSize: "16px" },
    button: {
        width: "100%", padding: "12px", backgroundColor: "#2e7d32",
        color: "white", border: "none", borderRadius: "6px",
        fontSize: "16px", cursor: "pointer", marginTop: "8px",
    },
    error: {
        color: "#d32f2f", marginBottom: "16px", textAlign: "center",
        fontSize: "14px", backgroundColor: "#ffebee",
        padding: "10px", borderRadius: "6px",
    },
    forgotText: { textAlign: "right", fontSize: "13px", marginTop: "4px", marginBottom: "8px" },
    registerText: { textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" },
    link: { color: "#2e7d32", cursor: "pointer", fontWeight: "600" },
};

export default LoginPage;