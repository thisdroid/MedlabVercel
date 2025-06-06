import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Tests from './components/Tests';
import Reports from './components/Reports';
import Analytics from './components/Analytics';
import Lab from './components/Lab';
import SignIn from './pages/SignIn';
import './App.css'
import logo from './assets/logo.svg';
import { AuthProvider, useAuth } from './AuthContext';

function RequireAuth({ children }) {
  const location = useLocation();
  const { auth } = useAuth();
  if (!auth) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

function AppLayout() {
  const location = window.location.pathname;
  const { auth } = useAuth();
  const isSignIn = location === '/signin';
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Only hide Sidebar on sign-in page */}
      {!isSignIn && auth && <Sidebar />}
      <main className="flex-1">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/patients" element={<RequireAuth><Patients /></RequireAuth>} />
          <Route path="/tests" element={<RequireAuth><Tests /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/lab" element={<Lab />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
