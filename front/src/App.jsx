import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Login/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import AttendancePage from './pages/Attendance/AttendancePage';
import FaceAttendancePage from './pages/FaceAttendance/FaceAttendancePage';
import AutomaticAttendancePage from './pages/AutomaticAttendance/AutomaticAttendancePage';
import ReportsPage from './pages/Reports/ReportsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import UsersPage from './pages/Users/UsersPage';
import AdminPage from './pages/Admin/AdminPage';
import ManageEmployeesPage from './pages/HR/ManageEmployeesPage';
import DepartmentPage from './pages/Department/DepartmentPage';
import ClassesPage from './pages/Instructor/ClassesPage';
import FinancePage from './pages/Finance/FinancePage';
import AdministrationPage from './pages/Administration/AdministrationPage';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/attendance" element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          } />
          
          <Route path="/face-attendance" element={
            <ProtectedRoute requiredRole="student">
              <FaceAttendancePage />
            </ProtectedRoute>
          } />
          
          <Route path="/automatic-attendance" element={
            <ProtectedRoute requiredRole="student">
              <AutomaticAttendancePage />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute requiredRole={['admin', 'hr_officer', 'department_head', 'instructor', 'finance_officer']}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute requiredRole="admin">
              <UsersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } />
          
          <Route path="/manage-employees" element={
            <ProtectedRoute requiredRole="hr_officer">
              <ManageEmployeesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/department" element={
            <ProtectedRoute requiredRole="department_head">
              <DepartmentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/classes" element={
            <ProtectedRoute requiredRole="instructor">
              <ClassesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/finance" element={
            <ProtectedRoute requiredRole="finance_officer">
              <FinancePage />
            </ProtectedRoute>
          } />
          
          <Route path="/administration" element={
            <ProtectedRoute requiredRole="administrative_officer">
              <AdministrationPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}