import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TournamentProvider } from './contexts/TournamentContext'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BracketPage from './pages/BracketPage'
import AdminPage from './pages/AdminPage'
import CourtPage from './pages/CourtPage'
import PublicCourtPage from './pages/PublicCourtPage'
import ProtectedRoute from './components/ProtectedRoute'

/**
 * Main App component that sets up routing and global context providers
 * Following Material Design 3 principles with mobile-first approach
 */
function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <Router>
          <div className="min-h-screen bg-white">
            {/* Navigation component with Material Design 3 styling */}
            <Navigation />
            
            {/* Main content area with proper spacing */}
            <main className="pb-safe">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/bracket" element={<BracketPage />} />
                <Route path="/court/:courtId/public" element={<PublicCourtPage />} />
                
                {/* Protected routes for authenticated users */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/court/:courtId" element={
                  <ProtectedRoute>
                    <CourtPage />
                  </ProtectedRoute>
                } />
                
                {/* Admin-only routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </TournamentProvider>
    </AuthProvider>
  )
}

export default App