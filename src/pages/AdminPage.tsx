import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import AdminControls from '../components/AdminControls'
import CourtManagement from '../components/CourtManagement'
import UserManagement from '../components/UserManagement'
import DojoManagement from '../components/DojoAdminManagement'
import TeamManagement from '../components/TeamManagement'
import { Settings, Users, Trophy, Monitor, BarChart3, Building, UserCheck } from 'lucide-react'

/**
 * AdminPage component - Registration administration interface
 * REGISTRATION-ONLY MODE: Provides admin controls for registration management
 * Tournament features temporarily disabled. See backups/tournament-features/ for restoration.
 */

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const { tournament, teams, dojos, users } = useTournament()
  const [activeTab, setActiveTab] = useState<'users' | 'dojos' | 'teams'>('users')

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    totalTeams: teams.length,
    totalDojos: dojos.length,
    participantUsers: users.filter(u => u.role === 'participant').length,
    adminUsers: users.filter(u => u.role === 'admin').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-small font-bold text-gray-900 mb-2">
            Registration Administration
          </h1>
          <p className="text-body-large text-gray-600">
            Welcome back, {user?.fullName}. Manage registrations, users, and teams.
          </p>
        </div>

        {/* Registration Statistics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-4 text-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-title-large font-bold text-gray-900">{stats.totalUsers}</div>
            <div className="text-body-small text-gray-600">Total Registrations</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-accent-600" />
            </div>
            <div className="text-title-large font-bold text-gray-900">{stats.totalTeams}</div>
            <div className="text-body-small text-gray-600">Teams</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-title-large font-bold text-gray-900">{stats.totalDojos}</div>
            <div className="text-body-small text-gray-600">Dojos</div>
          </div>
          
          <div className="card p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-title-large font-bold text-gray-900">{stats.participantUsers}</div>
            <div className="text-body-small text-gray-600">Participants</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {/* Tournament and Court tabs temporarily disabled for registration-only focus */}
              {/* <button
                onClick={() => setActiveTab('tournament')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'tournament'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                Tournament
              </button>
              <button
                onClick={() => setActiveTab('courts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'courts'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Monitor className="w-5 h-5 inline mr-2" />
                Courts
              </button> */}
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserCheck className="w-5 h-5 inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('dojos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'dojos'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building className="w-5 h-5 inline mr-2" />
                Dojos
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'teams'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Teams
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content - Registration Management Only */}
        <div className="mb-8">
          {/* Tournament and Court management temporarily disabled */}
          {/* {activeTab === 'tournament' && <AdminControls />} */}
          {/* {activeTab === 'courts' && <CourtManagement />} */}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'dojos' && <DojoManagement />}
          {activeTab === 'teams' && <TeamManagement />}
        </div>

        {/* Registration Management Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              User Management
            </h3>
            <p className="text-body-small text-gray-600 mb-4">
              Manage registered participants and their information
            </p>
            <button 
              onClick={() => setActiveTab('users')}
              className="btn-filled w-full"
            >
              Manage Users
            </button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              Dojo Management
            </h3>
            <p className="text-body-small text-gray-600 mb-4">
              Organize and manage dojo registrations
            </p>
            <button 
              onClick={() => setActiveTab('dojos')}
              className="btn-filled w-full"
            >
              Manage Dojos
            </button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              Team Management
            </h3>
            <p className="text-body-small text-gray-600 mb-4">
              View and organize team compositions
            </p>
            <button 
              onClick={() => setActiveTab('teams')}
              className="btn-filled w-full"
            >
              Manage Teams
            </button>
          </div>
        </div>

        {/* Registration-Only Mode Status */}
        <div className="card p-6">
          <h2 className="text-title-large font-semibold text-gray-900 mb-4">
            Current Mode: Registration Collection
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-title-medium font-medium text-blue-900 mb-2">
                ℹ️ Registration-Only Mode Active
              </h3>
              <p className="text-body-medium text-blue-800 mb-3">
                The application is currently focused on collecting tournament registrations. 
                Tournament features (brackets, matches, courts) are temporarily disabled.
              </p>
              <p className="text-body-small text-blue-700">
                Tournament features can be restored using the backups in <code>backups/tournament-features/</code>
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-title-medium font-medium text-gray-900">Active Features</h3>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-900">User Registration & Authentication</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-900">Dojo & Team Management</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-900">Kendo Rank System</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-900">Registration Dashboard</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-title-medium font-medium text-gray-900">Temporarily Disabled</h3>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-600">Tournament Bracket Visualization</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-600">Match Management & Scoring</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-600">Court Management System</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-body-medium text-gray-600">Public Tournament Display</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage