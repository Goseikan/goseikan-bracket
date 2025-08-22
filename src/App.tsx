import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TournamentProvider } from './contexts/TournamentContext'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import DashboardPage from './pages/DashboardPage'
// Tournament features temporarily disabled for registration-only focus
// import BracketPage from './pages/BracketPage'
// import ParticipantsPage from './pages/ParticipantsPage'
import AdminPage from './pages/AdminPage'
// import CourtPage from './pages/CourtPage'
// import PublicCourtPage from './pages/PublicCourtPage'
import ProtectedRoute from './components/ProtectedRoute'
import { ScrollToTop } from './hooks/useScrollToTop'

/**
 * Main App component that sets up routing and global context providers
 * Following Material Design 3 principles with mobile-first approach
 * 
 * REGISTRATION-ONLY MODE: Tournament features are temporarily disabled
 * to focus on collecting registrations. See backups/tournament-features/
 * for restoration instructions.
 */
function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <Router>
          <ScrollToTop>
            <div className="min-h-screen bg-white">
              {/* Navigation component with Material Design 3 styling */}
              <Navigation />
              
              {/* Main content area with proper spacing */}
              <main className="pb-safe">
              <Routes>
                {/* Public routes - Registration focused */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/search" element={<SearchPage />} />
                
                {/* Tournament routes temporarily disabled for registration-only focus */}
                {/* <Route path="/bracket" element={<BracketPage />} /> */}
                {/* <Route path="/participants" element={<ParticipantsPage />} /> */}
                {/* <Route path="/court/:courtId/public" element={<PublicCourtPage />} /> */}
                
                {/* Protected routes for authenticated users */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                {/* Tournament court routes temporarily disabled */}
                {/* <Route path="/court/:courtId" element={
                  <ProtectedRoute>
                    <CourtPage />
                  </ProtectedRoute>
                } /> */}
                
                {/* Admin-only routes for registration management */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
          </ScrollToTop>
        </Router>
      </TournamentProvider>
    </AuthProvider>
  )
}

export default App