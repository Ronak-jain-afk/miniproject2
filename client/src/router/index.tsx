import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/login';
import { AdminLayout } from '../layouts/admin-layout';
import { FacultyLayout } from '../layouts/faculty-layout';
import { StudentLayout } from '../layouts/student-layout';
import { DepartmentsPage } from '../pages/departments/page';
import { CoursesPage } from '../pages/courses/page';
import { SemestersPage } from '../pages/semesters/page';
import { SubjectsPage } from '../pages/subjects/page';
import { SectionsPage } from '../pages/sections/page';
import { StudentsPage } from '../pages/students/page';
import { FacultyPage } from '../pages/faculty/page';
import { RulesPage } from '../pages/rules/page';
import { TakeAttendancePage } from '../pages/attendance/take-attendance';
import { SessionsPage } from '../pages/attendance/sessions';
import { StudentAttendancePage } from '../pages/attendance/student-view';
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
      { path: 'departments', element: <DepartmentsPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'semesters', element: <SemestersPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'sections', element: <SectionsPage /> },
      { path: 'students', element: <StudentsPage /> },
      { path: 'faculty', element: <FacultyPage /> },
      { path: 'rules', element: <RulesPage /> },
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
      { path: 'attendance', element: <TakeAttendancePage /> },
      { path: 'sessions', element: <SessionsPage /> },
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
      { path: 'attendance', element: <StudentAttendancePage /> },
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
