import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import GuildSettings from './components/GuildSettings';
import AutoRole from './components/AutoRole';
import IncomeShop from './components/IncomeShop';
import Leaderboard from './components/Leaderboard';
import BotAdmin from './components/BotAdmin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Redirect root path to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Guild Settings */}
            <Route
              path="/guild/:guildId"
              element={
                <ProtectedRoute>
                  <GuildSettings />
                </ProtectedRoute>
              }
            />

            {/* Auto-Role Settings */}
            <Route
              path="/guild/:guildId/auto-role"
              element={
                <ProtectedRoute>
                  <AutoRole />
                </ProtectedRoute>
              }
            />

            {/* Income Shop Settings */}
            <Route
              path="/guild/:guildId/income-shop"
              element={
                <ProtectedRoute>
                  <IncomeShop />
                </ProtectedRoute>
              }
            />

            {/* Guild-specific Leaderboard */}
            <Route
              path="/dashboard/:guildId/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            {/* Bot Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <BotAdmin />
                </ProtectedRoute>
              }
            />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#fff',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;