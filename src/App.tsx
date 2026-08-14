import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { InternshipPage } from './pages/public/InternshipPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentTests } from './pages/student/StudentTests';
import { TakeTestPage } from './pages/student/TakeTestPage';
import { TestResultPage } from './pages/student/TestResultPage';
import { StudentPerformance } from './pages/student/StudentPerformance';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentInternships } from './pages/student/StudentInternships';
import { StudentAnnouncements } from './pages/student/StudentAnnouncements';
import { StudentProfile } from './pages/student/StudentProfile';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffBatches } from './pages/staff/StaffBatches';
import { StaffAttendance } from './pages/staff/StaffAttendance';
import { StaffTests } from './pages/staff/StaffTests';
import { StaffResults } from './pages/staff/StaffResults';
import { StaffAnnouncements } from './pages/staff/StaffAnnouncements';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminBatches } from './pages/admin/AdminBatches';
import { AdminTests } from './pages/admin/AdminTests';
import { AdminInternships } from './pages/admin/AdminInternships';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminCMS } from './pages/admin/AdminCMS';
import { AdminReports } from './pages/admin/AdminReports';

// Guarded Route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'staff' | 'student')[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/internship" element={<InternshipPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Student Portal Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="tests" element={<StudentTests />} />
        <Route path="tests/take/:id" element={<TakeTestPage />} />
        <Route path="results/:attemptId" element={<TestResultPage />} />
        <Route path="performance" element={<StudentPerformance />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="internships" element={<StudentInternships />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* 3. Staff Portal Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="batches" element={<StaffBatches />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="tests" element={<StaffTests />} />
        <Route path="results" element={<StaffResults />} />
        <Route path="announcements" element={<StaffAnnouncements />} />
      </Route>

      {/* 4. Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="batches" element={<AdminBatches />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="results" element={<StaffResults />} />
        <Route path="internships" element={<AdminInternships />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="cms" element={<AdminCMS />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* 5. Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
