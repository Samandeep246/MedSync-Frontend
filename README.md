# MedSync Frontend 🏥

A full-featured **Healthcare Appointment & Patient Management** frontend built with React 18, Vite, React Router, and Axios.

> 🔗 Backend Repository: [MedSync-API](https://github.com/Samandeep246/MedSync-API)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Icons | react-icons |
| Date Picker | react-datepicker |
| Auth | JWT (stored in localStorage) |

---

## Project Structure

```
src/
 ├── components/
 │    └── ProtectedRoute.jsx       — Route guard by role
 ├── context/
 │    └── AuthContext.jsx          — Global auth state
 ├── pages/
 │    ├── LoginPage.jsx
 │    ├── RegisterPage.jsx         — Patient only, 2-step form
 │    ├── ForgotPasswordPage.jsx
 │    ├── ResetPasswordPage.jsx
 │    ├── ChangePasswordPage.jsx
 │    ├── AdminDashboard.jsx       — Stats + navigation cards
 │    ├── AdminSpecializations.jsx — Full CRUD
 │    ├── AdminDoctors.jsx         — Create doctors, toggle active
 │    ├── AdminPatients.jsx        — View/search patients
 │    ├── AdminAppointments.jsx    — Filter, export CSV/PDF
 │    ├── DoctorDashboard.jsx      — Stats + today's appointments
 │    ├── DoctorProfile.jsx        — Shows available days as badges
 │    ├── DoctorEditProfile.jsx    — Day toggle availability UI
 │    ├── DoctorAppointments.jsx
 │    ├── PatientDashboard.jsx     — Stats + navigation cards
 │    ├── PatientProfile.jsx
 │    ├── PatientEditProfile.jsx
 │    ├── PatientAppointments.jsx  — Cancel + reschedule inline
 │    └── BookAppointment.jsx      — Dual path booking flow
 ├── services/
 │    ├── api.js                   — Axios instance + auth interceptor
 │    ├── authService.js
 │    ├── patientService.js
 │    ├── doctorService.js
 │    ├── appointmentService.js
 │    └── specializationService.js
 ├── styles/
 │    └── datepicker-custom.css    — Custom green theme
 └── App.jsx
```

---

## Features

- ✅ **Role-Based Access** — Separate dashboards for Admin, Doctor, Patient
- ✅ **Protected Routes** — JWT token + role check before rendering
- ✅ **Book Appointment — Dual Path Flow**
  - Path A: Choose preferred doctor → pick available day → calendar → confirm
  - Path B: Find earliest slot → sorted by soonest availability → confirm
- ✅ **Doctor Availability Toggles** — Day-by-day weekly schedule management
- ✅ **Cancel & Reschedule** — Inline expand panel with preset reasons
- ✅ **12-Hour Guard** — Cancel/reschedule blocked within 12 hours
- ✅ **Admin Exports** — Export appointments as CSV or PDF
- ✅ **Forgot/Reset Password** — Full flow with reset code
- ✅ **Availability Calendar** — Only valid days are clickable

---

## Routes

| Route | Access | Page |
|---|---|---|
| `/login` | Public | Login |
| `/register` | Public | Patient registration (2-step) |
| `/forgot-password` | Public | Forgot password |
| `/reset-password` | Public | Reset with code |
| `/admin` | Admin | Admin dashboard |
| `/admin/specializations` | Admin | Manage specializations |
| `/admin/doctors` | Admin | Manage doctors |
| `/doctor` | Doctor | Doctor dashboard |
| `/doctor/profile` | Doctor | Doctor profile |
| `/doctor/profile/edit` | Doctor | Edit profile + availability |
| `/doctor/appointments` | Doctor | Manage appointments |
| `/patient` | Patient | Patient dashboard |
| `/patient/profile` | Patient | Patient profile |
| `/patient/appointments` | Patient | View + cancel/reschedule |
| `/patient/book` | Patient | Book appointment |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS version)
- [MedSync API](https://github.com/Samandeep246/MedSync-API) running locally

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Samandeep246/MedSync-Frontend.git
cd MedSync-Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Make sure the backend is running**

The API should be running at:
```
https://localhost:7013
```

4. **Run the app**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

---

## Auth Flow

- JWT token stored in `localStorage` after login
- `AuthContext` provides `user`, `token`, `login`, `logout` globally
- `ProtectedRoute` checks token + role before rendering any page
- Axios interceptor automatically attaches `Authorization: Bearer {token}` to all requests

---

## Design System

| Property | Value |
|---|---|
| Primary Color | `#2e7d32` (Green) |
| Background | `#f0f7f0` |
| Error Color | `#d32f2f` |
| Card Shadow | `0 2px 8px rgba(0,0,0,0.08)` |
| Border Radius | `12px` cards, `6px` inputs |
| Style Approach | Inline styles (CSS Modules planned) |
