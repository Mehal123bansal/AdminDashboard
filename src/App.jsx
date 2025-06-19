import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = Boolean(localStorage.getItem('currentUser'));
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔸 Default: Redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔐 Login Page */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 Dashboard - Protected */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 🔻 Catch-all: Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
