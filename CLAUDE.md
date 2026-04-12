# MedSync — Project Context for Claude

## Project Overview
A Healthcare Appointment & Patient Management System with a full-stack implementation:
- **Backend**: ASP.NET Core Web API (.NET 8)
- **Frontend**: React (Vite) with React Router, Axios

---

## Backend — MedSync.API

### Tech Stack
- ASP.NET Core Web API (.NET 8)
- SQL Server LocalDB: `(localdb)\MSSQLLocalDB` — Database: `MedSyncDB`
- Entity Framework Core 8.0 (Code First)
- AutoMapper 12.0.1
- BCrypt.Net-Next 4.0.3
- JWT: Microsoft.AspNetCore.Authentication.JwtBearer 8.0.0
- Swagger / OpenAPI

### Project Location
`C:\Users\SamandeepKaur\Documents\Saman\Projects\MedSync\`
- Solution: `MedSync.slnx`
- API Project: `MedSync.API/`
- Run with: F5 in Visual Studio
- Swagger: `https://localhost:7013/swagger`

### Project Structure
```
MedSync.API/
 ├── Controllers/     — Auth, Specializations, Doctors, DoctorAvailability, Patients, Appointments
 ├── Data/            — MedSyncDbContext.cs
 ├── DTOs/            — All DTOs
 ├── Models/          — Patient, Doctor, Appointment, Specialization, User, DoctorAvailability
 ├── Profiles/        — MedSyncProfile.cs (AutoMapper)
 ├── Repositories/    — IXxxRepository + XxxRepository for all entities
 ├── Services/        — ITokenService + TokenService
 ├── appsettings.json
 └── Program.cs
```

### Completed Modules
1. **Specializations** — Full CRUD
2. **Doctors** — Full CRUD + SpecializationId FK + TimeOnly parsed from string in controller
3. **Patients** — Full CRUD + HealthCard, BloodType
4. **Appointments** — Full CRUD + status transitions + day availability validation
5. **Auth** — JWT Authentication + Register + Login + ForgotPassword + ResetPassword + ChangePassword + Admin CreateDoctor
6. **DoctorAvailability** — GET + PUT per doctor + GET earliest-slots + auto-seed on doctor creation
7. **Business Rules** — 15+ rules implemented
8. **Authorization** — Role-based + Ownership checks
9. **CORS** — Configured for `http://localhost:5173`

### Auth Endpoints
| Endpoint | Access | Description |
|---|---|---|
| `POST /api/auth/register` | Public | Patient self-registration only |
| `POST /api/auth/login` | Public | All roles |
| `POST /api/auth/create-doctor` | Admin only | Creates Doctor record + User account + seeds 7 availability rows |
| `PATCH /api/auth/change-password` | Logged in | Doctor + Patient |
| `POST /api/auth/forgot-password` | Public | Returns reset code (simulated email) |
| `POST /api/auth/reset-password` | Public | Verifies code + sets new password |

### Doctor Availability Endpoints
| Endpoint | Access | Description |
|---|---|---|
| `GET /api/doctors/{id}/availability` | Public | Get all 7 days for a doctor |
| `PUT /api/doctors/{id}/availability` | Doctor (own) | Replace full weekly schedule |
| `GET /api/doctors/earliest-slots?specializationId=x` | Public | All doctors sorted by earliest available day |

### Role Permissions
- **Admin** — created manually in DB, full access
- **Doctor** — created by Admin only via `POST /api/auth/create-doctor`
- **Patient** — self-registers via `POST /api/auth/register`

### DTO Pattern
```csharp
public class XxxDto { }                          // Response
public abstract class XxxManipulationDto { }     // Abstract base
public class XxxCreateDto : XxxManipulationDto { } // POST
public class XxxUpdateDto : XxxManipulationDto { } // PATCH
```

### DoctorAvailability DTOs
```csharp
DoctorAvailabilityDto          // Response — dayOfWeek (int), dayName (string), isAvailable (bool)
DoctorAvailabilityUpdateDto    // PUT body — List<DayAvailabilityItem> Days (exactly 7)
DayAvailabilityItem            // dayOfWeek (int), isAvailable (bool)
DoctorEarliestSlotDto          // Earliest slot per doctor — doctorId, fullName, specialization,
                               // availableFrom, availableTo, earliestDay, earliestDate,
                               // consultationFee, yearsOfExperience, weeklySchedule
```

### DoctorAvailability — How It Works
- Every doctor has exactly **7 rows** in `DoctorAvailabilities` table — one per day (Sun=0 to Sat=6)
- All 7 days default to `IsAvailable = true` when doctor is created
- Doctor can toggle days on/off from their Edit Profile page
- Composite unique index on `(DoctorId, DayOfWeek)` — no duplicates
- Cascade delete — availability rows deleted when doctor is deleted
- Appointment creation and update validate that the selected date's `DayOfWeek` matches an available day

### Appointment DTOs
```csharp
// AppointmentDto (Response)
public string? Reason { get; set; }        // stores cancel or reschedule reason (replaces CancellationReason)

// AppointmentManipulationDto (base)
public string? Reason { get; set; }        // used for reschedule reason

// UpdateStatusDto
public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Reason { get; set; }
}
```

### Appointment Reason Field
- `Reason` column replaces old `CancellationReason`
- Cancel reason is required (preset + optional free text)
- Reschedule reason is optional (preset + optional free text)
- One column covers both since they are mutually exclusive

### Patient Cancel/Reschedule Rules
- Patients can cancel or reschedule Scheduled or Confirmed appointments only
- Both actions are blocked within 12 hours of appointment time, enforced on both frontend and backend
- NoShow is set by Doctor only, never auto-assigned

### PATCH /{id}/status Role Rules
- **Admin** — any transition
- **Doctor** — own appointments only, any valid transition
- **Patient** — own appointments only, Cancelled status only, 12-hour guard

### PATCH /{id} Reschedule Role Rules
- **Admin** — any appointment
- **Doctor** — own appointments only
- **Patient** — own appointments only, 12-hour guard

### Soft Delete
- `IsDeleted = true`, `DeletedAt = DateTime.UtcNow`
- Global query filters in DbContext exclude deleted records

### Auto-Generated Numbers
- Doctor: `DOC-0001`, Patient: `PAT-0001`, Appointment: `APT-0001`
- Use `MaxAsync` on the number field to avoid duplicates on failed saves

### Time Handling
- `DoctorDto.AvailableFrom/To` are `string` type
- `DoctorManipulationDto.AvailableFrom/To` are `string` — accept `"HH:mm"` or `"HH:mm:ss"`
- Controller parses string → `TimeOnly` using `TimeOnly.TryParse()`
- AutoMapper ignores `AvailableFrom/To` — set manually in controller
- `Doctor → DoctorDto` maps `TimeOnly` → `"HH:mm"` string

### Password Rules
All passwords must have:
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (`!@#$%^&*`)
- Validated via `IsValidPassword()` private helper in `AuthController`

### Default Test Password
`Test@1234` — used for all test accounts

### JWT Claims
```csharp
ClaimTypes.NameIdentifier  → UserId
ClaimTypes.Email           → Email
ClaimTypes.Role            → Role
"PatientId"                → PatientId (custom claim)
"DoctorId"                 → DoctorId (custom claim)
```

### Important Notes
- Always use `async/await`
- Always use Repository Pattern
- Always follow DTO pattern
- Use `[HttpPatch]` for updates (not PUT)
- Return `UnprocessableEntity(ModelState)` for validation errors
- Return `Conflict()` for duplicates (409)
- Return `BadRequest()` for business rule violations (400)
- Ownership checks on all patient/doctor-specific endpoints
- `PatientsController` — controller level `[Authorize]`, methods override per role
- `DoctorsController` — controller level `[Authorize]`, methods override per role
- `AppointmentsController` — controller level `[Authorize]`, methods override per role
- `DoctorAvailabilityController` — controller level `[Authorize]`, GET is `[AllowAnonymous]`
- `IsWithin12Hours()` — private static helper in `AppointmentsController`, checks if appointment is within 12 hours of current UTC time

---

## Frontend — medsync-frontend

### Tech Stack
- React 18 (Vite)
- React Router DOM
- Axios
- react-icons (FaEye, FaEyeSlash, FaHospital, FaClock, FaDollarSign, FaUserMd, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaCalendarCheck)
- react-datepicker — used in BookAppointment for availability-aware date picking

### Project Location
`C:\Users\SamandeepKaur\Documents\Saman\Projects\medsync-frontend\`
- Run with: `npm run dev`
- URL: `http://localhost:5173`

### Project Structure
```
src/
 ├── components/
 │    └── ProtectedRoute.jsx
 ├── context/
 │    └── AuthContext.jsx
 ├── pages/
 │    ├── LoginPage.jsx
 │    ├── RegisterPage.jsx         — Patient only, 2 step form
 │    ├── ForgotPasswordPage.jsx
 │    ├── ResetPasswordPage.jsx
 │    ├── ChangePasswordPage.jsx
 │    ├── PatientDashboard.jsx
 │    ├── PatientProfile.jsx
 │    ├── PatientEditProfile.jsx
 │    ├── PatientAppointments.jsx
 │    ├── BookAppointment.jsx      — Dual path booking with availability calendar
 │    ├── DoctorDashboard.jsx
 │    ├── DoctorProfile.jsx        — Shows available days as green badges
 │    ├── DoctorEditProfile.jsx    — Day toggle UI + availability save
 │    ├── DoctorAppointments.jsx
 │    ├── AdminDashboard.jsx
 │    ├── AdminSpecializations.jsx
 │    └── AdminDoctors.jsx
 ├── services/
 │    ├── api.js                   — Axios instance + auth interceptor
 │    ├── authService.js
 │    ├── patientService.js
 │    ├── doctorService.js         — includes getAvailability, updateAvailability, getEarliestSlots
 │    ├── appointmentService.js
 │    └── specializationService.js
 ├── styles/
 │    └── datepicker-custom.css    — MedSync green theme for react-datepicker
 └── App.jsx
```

### Routes
```
/login                    Public
/register                 Public — Patient only
/forgot-password          Public
/reset-password           Public
/patient                  Patient only
/patient/profile          Patient only
/patient/profile/edit     Patient only
/patient/change-password  Patient only
/patient/appointments     Patient only
/patient/book             Patient only
/doctor                   Doctor only
/doctor/profile           Doctor only
/doctor/profile/edit      Doctor only
/doctor/change-password   Doctor only
/doctor/appointments      Doctor only
/admin                    Admin only
/admin/specializations    Admin only
/admin/doctors            Admin only
```

### Auth Flow
- Token stored in `localStorage`
- `AuthContext` provides `user`, `token`, `login`, `logout`
- User object: `{ email, role, firstName, lastName, patientId, doctorId }`
- `ProtectedRoute` checks token + role before rendering page

### BookAppointment — Dual Path Flow
```
Step 1: Select Specialization
        |
Step 2: Choose path
  +---------------------+  +----------------------+
  | Preferred Doctor    |  | Find Earliest Slot   |
  +---------------------+  +----------------------+

Path A (Preferred Doctor):
  Select Doctor -> Doctor card (days + hours) ->
  Select available day -> Calendar (only valid days clickable) ->
  Pick time -> Confirm

Path B (Earliest Slot):
  Sorted doctor list (soonest first, tiebreak by opening time) ->
  Click doctor -> Doctor card appears ->
  Day pre-filled -> Calendar -> Pick time -> Confirm

Both paths converge at -> Book Appointment
```

### DoctorEditProfile — Availability Toggles
- Loads existing availability on mount via `getAvailability`
- 7 day buttons — green = available, grey = unavailable
- Click to toggle
- Saves both profile + availability on Save Changes
- Availability and profile saves are independent — one failing won't block the other

### DoctorProfile — Available Days Badges
- Loads availability separately from profile
- Shows only `isAvailable = true` days as green badges
- Shows combined Available Hours row (from – to)

### Design System
- Style approach: Inline styles (to be refactored to CSS Modules later)
- Primary color: `#2e7d32` (green)
- Background: `#f0f7f0`
- Error color: `#d32f2f`
- Card shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Border radius: `12px` for cards, `6px` for inputs/buttons

### API Base URL
`https://localhost:7013/api`

### Services Pattern
Each service file handles API calls for one entity:
- Auth header added automatically via axios interceptor in `api.js`
- Public endpoints called without auth header automatically
- Protected endpoints include `Authorization: Bearer {token}` automatically

### appointmentService.js Methods
- `getAll()` — fetch all appointments
- `update(id, data)` — reschedule via `PATCH /appointments/{id}`
- `updateStatus(id, status, reason)` — sends `{ status, reason }` as body via `PATCH /appointments/{id}/status`

### Completed Pages
- **AdminDashboard** — Stats cards (Doctors, Patients, Appointments, Specializations counts) + navigation cards
- **AdminPatients** — View all patients, search by name/email, total count badge
- **AdminAppointments** — Filter by status, Export CSV/PDF, Confirm/Cancel/Delete actions
- **AdminDoctors** — View all doctors, create doctor account, toggle active status
- **AdminSpecializations** — Full CRUD
- **DoctorDashboard** — Stats cards (Scheduled, Confirmed, Completed, Cancelled) + navigation cards + Today's Appointments section + Upcoming Appointments section
- **PatientDashboard** — Stats cards (Upcoming, Confirmed, Completed, Cancelled) + navigation cards (My Profile, My Appointments, Book Appointment)
- **PatientAppointments** — Cancel + Reschedule buttons on Scheduled/Confirmed appointments. Within 12h shows greyed out disabled buttons instead. Inline expand panel for both actions. Cancel presets: Feeling better, Work conflict, Emergency, Transportation issue, Doctor unavailable, Other. Reschedule presets: Work conflict, Personal emergency, Transportation issue, Prefer a different time, Other. All filter pills including NoShow.

### Known Issues / Future Work
- Style refactor: inline styles → CSS Modules
- Email service: Forgot Password currently returns code directly (no real email)
- Appointment ratings not built yet
- Pagination not built yet
- Service layer: Business logic currently in controllers (Fat Controller pattern)
