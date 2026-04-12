import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBriefcaseMedical } from "react-icons/fa";

export default function Navbar({ role }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName}`
        : role || "User";

    return (
        <div style={styles.navbar}>
            <div style={styles.navLogo}>
                <FaBriefcaseMedical style={{ color: "#2e7d32", fontSize: "22px", marginRight: "8px" }} />
                MedSync
            </div>
            <div style={styles.navRight}>
                <span style={styles.navName}>{displayName}</span>
                <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

const styles = {
    navbar: {
        backgroundColor: "white", padding: "16px 32px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    navLogo: { fontSize: "20px", fontWeight: "bold", color: "#2e7d32", display: "flex", alignItems: "center" },
    navRight: { display: "flex", alignItems: "center", gap: "16px" },
    navName: { fontSize: "14px", color: "#666" },
    logoutBtn: {
        padding: "8px 16px", backgroundColor: "white",
        color: "#d32f2f", borderWidth: "1px", borderStyle: "solid", borderColor: "#d32f2f",
        borderRadius: "6px", cursor: "pointer", fontSize: "14px",
    },
};