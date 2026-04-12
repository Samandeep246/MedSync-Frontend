import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
    const { user, token } = useAuth();

    // Not logged in → redirect to login
    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    // Wrong role → redirect to login
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    // Authorized → show the page
    return children;
}

export default ProtectedRoute;