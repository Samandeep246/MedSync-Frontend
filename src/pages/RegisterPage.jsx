import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { FaEye, FaEyeSlash, FaBriefcaseMedical } from "react-icons/fa";

function RegisterPage() {
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Step 1 fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Step 2 fields — Patient only
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [bloodType, setBloodType] = useState("");
    const [healthCardNumber, setHealthCardNumber] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleStep1Next = (e) => {
        e.preventDefault();
        setError("");
        if (!firstName || !lastName || !email || !password || !phoneNumber) {
            setError("All fields are required.");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const dto = {
                password,
                role: "Patient",
                patient: {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    dateOfBirth,
                    healthCardNumber,
                    bloodType,
                    gender,
                    address,
                },
            };

            const data = await authService.register(dto);
            login(data);
            navigate("/patient");

        } catch (err) {
            setError(err.response?.data || "Registration failed. Please try again.");
            setStep(1);
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
                    <p style={styles.subtitle}>Create your account</p>
                </div>

                {/* Step Indicator */}
                <div style={styles.stepIndicator}>
                    <div style={step >= 1 ? styles.stepActive : styles.stepInactive}>1</div>
                    <div style={styles.stepLine} />
                    <div style={step >= 2 ? styles.stepActive : styles.stepInactive}>2</div>
                </div>

                {error && <p style={styles.error}>{error}</p>}

                {/* Step 1 — Basic Info */}
                {step === 1 && (
                    <form onSubmit={handleStep1Next}>
                        <div style={styles.row}>
                            <div style={styles.field}>
                                <label style={styles.label}>First Name</label>
                                <input
                                    style={styles.input}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Last Name</label>
                                <input
                                    style={styles.input}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Smith"
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                style={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
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
                                    placeholder="Min 8 chars, uppercase, number, special char"
                                    autoComplete="new-password"
                                    required
                                />
                                <span style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                style={styles.input}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="1234567890"
                                required
                            />
                        </div>

                        <button type="submit" style={styles.button}>
                            Next →
                        </button>

                        <p style={styles.loginText}>
                            Already have an account?{" "}
                            <span style={styles.link} onClick={() => navigate("/login")}>
                                Login here
                            </span>
                        </p>
                    </form>
                )}

                {/* Step 2 — Patient Details */}
                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Date of Birth</label>
                            <input
                                type="date"
                                style={styles.input}
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Blood Type</label>
                            <select
                                style={styles.input}
                                value={bloodType}
                                onChange={(e) => setBloodType(e.target.value)}
                                required
                            >
                                <option value="">Select blood type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Health Card Number</label>
                            <input
                                style={styles.input}
                                value={healthCardNumber}
                                onChange={(e) => setHealthCardNumber(e.target.value)}
                                placeholder="HC123456"
                                required
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Gender</label>
                            <select
                                style={styles.input}
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Address</label>
                            <input
                                style={styles.input}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Main St"
                            />
                        </div>

                        <div style={styles.buttonRow}>
                            <button
                                type="button"
                                style={styles.backButton}
                                onClick={() => setStep(1)}
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                style={styles.button}
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px",
    },
    card: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "480px",
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
    stepIndicator: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
        gap: "8px",
    },
    stepActive: {
        width: "32px", height: "32px", borderRadius: "50%",
        backgroundColor: "#2e7d32", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "bold",
    },
    stepInactive: {
        width: "32px", height: "32px", borderRadius: "50%",
        backgroundColor: "#ddd", color: "#666",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "bold",
    },
    stepLine: { width: "60px", height: "2px", backgroundColor: "#ddd" },
    field: {
        marginBottom: "16px", display: "flex",
        flexDirection: "column", gap: "6px", flex: 1,
    },
    row: { display: "flex", gap: "12px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#444" },
    input: {
        padding: "10px 40px 10px 12px", borderRadius: "6px",
        border: "1px solid #ddd", fontSize: "14px",
        outline: "none", width: "100%", boxSizing: "border-box",
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
    backButton: {
        padding: "12px 24px", backgroundColor: "#f5f5f5",
        color: "#333", border: "1px solid #ddd",
        borderRadius: "6px", fontSize: "14px", cursor: "pointer",
        marginTop: "8px",
    },
    buttonRow: { display: "flex", gap: "12px", alignItems: "center" },
    error: {
        color: "red", marginBottom: "16px",
        textAlign: "center", fontSize: "14px",
        backgroundColor: "#ffebee", padding: "10px", borderRadius: "6px",
    },
    loginText: { textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" },
    link: { color: "#2e7d32", cursor: "pointer", fontWeight: "600" },
};

export default RegisterPage;