import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Billing from './pages/Billing';

import { UIProvider } from './context/UIContext';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Billing />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Placeholder routes for others */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </UIProvider>
    </AuthProvider>
  );
}


export default App;
