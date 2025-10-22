import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import AddQuestion from './components/Admin/AddQuestion';
import ManageQuestions from './components/Admin/ManageQuestions';
import ViewResults from './components/Admin/ViewResults';
import UserManagement from './components/Admin/UserManagement';
import LiveMonitoring from './components/Admin/LiveMonitoring';
import StudentDashboard from './components/Student/StudentDashboard';
import Exam from './components/Student/Exam';
import Result from './components/Student/Result';
import ProtectedRoute from './components/Common/ProtectedRoute';
import { WebcamProvider } from './context/WebcamContext';
import { getCurrentUser, isAdmin } from './utils/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <WebcamProvider>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container-fluid p-0">
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? <Navigate to={isAdmin(user) ? "/admin" : "/student"} /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to={isAdmin(user) ? "/admin" : "/student"} /> : 
                <Register />
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute user={user} adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/add-question" 
              element={
                <ProtectedRoute user={user} adminOnly={true}>
                  <AddQuestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/questions" 
              element={
                <ProtectedRoute user={user} adminOnly={true}>
                  <ManageQuestions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/results" 
              element={
                <ProtectedRoute user={user} adminOnly={true}>
                  <ViewResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute user={user} adminOnly={true}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/monitoring" 
              element={
                <ProtectedRoute user={user} adminOnly={true}>
                  <LiveMonitoring />
                </ProtectedRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute user={user}>
                  <StudentDashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exam" 
              element={
                <ProtectedRoute user={user}>
                  <Exam user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/result" 
              element={
                <ProtectedRoute user={user}>
                  <Result user={user} />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to={user ? (isAdmin(user) ? "/admin" : "/student") : "/login"} />} />
          </Routes>
        </div>
      </div>
    </WebcamProvider>
  );
}

export default App;