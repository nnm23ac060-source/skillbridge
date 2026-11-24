import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import Internships from './pages/student/Internships.jsx';
import InternshipDetails from './pages/student/InternshipDetails.jsx';
import MyApplications from './pages/student/MyApplications.jsx';
import Profile from './pages/student/Profile.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageInternships from './pages/admin/ManageInternships.jsx';
import Applicants from './pages/admin/Applicants.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Root router — all planned routes are registered.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Guests only (already-logged-in users bounce to their dashboard) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student area — role: student */}
        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="internships" element={<Internships />} />
            <Route path="internships/:id" element={<InternshipDetails />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin area — role: admin */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="internships" element={<ManageInternships />} />
            <Route path="applications" element={<Applicants />} />
          </Route>
        </Route>

        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '10px',
            fontSize: '14px',
            boxShadow: '0 10px 30px -10px rgb(15 23 42 / 0.35)',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#f8fafc' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
        }}
      />
    </AuthProvider>
  );
}
