import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer'; // Import Footer
import Showcase from './components/Home/Showcase';
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
import './App.css'; // Make sure to import App.css

// Component to conditionally show footer
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Don't show footer on these routes
  const noFooterRoutes = [
    '/admin', '/admin/add-question', '/admin/questions', '/admin/results', 
    '/admin/users', '/admin/monitoring', '/student', '/exam', '/result'
  ];
  
  const showFooter = !noFooterRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
};

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
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Layout>
                  <Showcase user={user} />
                </Layout>
              } 
            />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to={isAdmin(user) ? "/admin" : "/student"} /> : 
                <Layout>
                  <Login onLogin={handleLogin} />
                </Layout>
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to={isAdmin(user) ? "/admin" : "/student"} /> : 
                <Layout>
                  <Register onLogin={handleLogin} />
                </Layout>
              } 
            />
            
            {/* Admin Routes - No Footer */}
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
            
            {/* Student Routes - No Footer */}
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
            
            {/* Fallback Route */}
            <Route 
              path="*" 
              element={<Navigate to="/" />} 
            />
          </Routes>
        </div>
      </div>
    </WebcamProvider>
  );
}

export default App;