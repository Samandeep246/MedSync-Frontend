import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";
import PatientEditProfile from "./pages/PatientEditProfile";
import PatientAppointments from "./pages/PatientAppointments";
import BookAppointment from "./pages/BookAppointment";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorEditProfile from "./pages/DoctorEditProfile";
import DoctorAppointments from "./pages/DoctorAppointments";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSpecializations from "./pages/AdminSpecializations";
import AdminDoctors from "./pages/AdminDoctors";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminPatients from "./pages/AdminPatients";
import AdminAppointments from "./pages/AdminAppointments";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Patient routes */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <PatientProfile />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile/edit" element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <PatientEditProfile />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <PatientAppointments />
            </ProtectedRoute>
          } />
          <Route path="/patient/book" element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <BookAppointment />
            </ProtectedRoute>
          } />
          <Route path="/patient/change-password" element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile" element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorProfile />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile/edit" element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorEditProfile />
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorAppointments />
            </ProtectedRoute>
          } />
          <Route path="/doctor/change-password" element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/specializations" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminSpecializations />
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDoctors />
            </ProtectedRoute>
          } />

          <Route path="/admin/patients" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminPatients />
            </ProtectedRoute>
          } />

          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminAppointments />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;