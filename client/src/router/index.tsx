import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/login';
import { AdminLayout } from '../layouts/admin-layout';
import { FacultyLayout } from '../layouts/faculty-layout';
import { StudentLayout } from '../layouts/student-layout';
import { ProtectedRoute } from './protected-route';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Admin Dashboard</div> },
    ],
  },
  {
    path: '/faculty',
    element: (
      <ProtectedRoute role="faculty">
        <FacultyLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Faculty Dashboard</div> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute role="student">
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Student Dashboard</div> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);
