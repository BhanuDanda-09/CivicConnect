import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CitizenLayout from './layouts/CitizenLayout';
import AdminLayout from './layouts/AdminLayout';
import WorkerLayout from './layouts/WorkerLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetails from './pages/citizen/ComplaintDetails';
import Feedback from './pages/citizen/Feedback';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageComplaints from './pages/admin/ManageComplaints';
import ManageWorkers from './pages/admin/ManageWorkers';
import ManageUsers from './pages/admin/ManageUsers';
import Analytics from './pages/admin/Analytics';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AssignedTasks from './pages/worker/AssignedTasks';
import TaskDetails from './pages/worker/TaskDetails';

// Role Guard Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast Notification Container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#fff',
              fontSize: '12px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Citizen Protected Routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                <CitizenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/citizen/dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="submit-complaint" element={<SubmitComplaint />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="complaints/:id" element={<ComplaintDetails />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>

          {/* Municipal Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<ManageComplaints />} />
            <Route path="workers" element={<ManageWorkers />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Field Worker Protected Routes */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={['worker', 'admin']}>
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/worker/dashboard" replace />} />
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="tasks" element={<AssignedTasks />} />
            <Route path="tasks/:id" element={<TaskDetails />} />
          </Route>

          {/* Catch-All 404 Route */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
