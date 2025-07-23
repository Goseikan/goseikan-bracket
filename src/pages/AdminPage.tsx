import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import AdminControls from '../components/AdminControls'
import CourtManagement from '../components/CourtManagement'
import { Settings, Users, Trophy, Monitor, BarChart3 } from 'lucide-react'

/**
 * AdminPage component - Tournament administration interface
 * Provides admin controls for tournament management
 */

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const { tournament, teams, dojos, users } = useTournament()
  const [activeTab, setActiveTab] = useState<'tournament' | 'courts'>('tournament')

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
            Tournament Administration
          </h1>
          <p className="text-body-large text-gray-600">
            Welcome back, {user?.fullName}. Manage tournament settings and progression.
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card p-4 text-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-title-large font-bold text-gray-900">{stats.totalUsers}</div>
            <div className="text-body-small text-gray-600">Total Users</div>
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
              <Settings className="w-5 h-5 text-green-600" />
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
          
          <div className="card p-4 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Monitor className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-title-large font-bold text-gray-900">{tournament?.courts.length || 0}</div>
            <div className="text-body-small text-gray-600">Courts</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tournament')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'tournament'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                Tournament Controls
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
                Court Management
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'tournament' && <AdminControls />}
          {activeTab === 'courts' && <CourtManagement />}
        </div>

        {/* Admin Functions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              Tournament Settings
            </h3>
            <p className="text-body-small text-gray-600 mb-4">
              Configure tournament parameters and rules
            </p>
            <button className="btn-outlined w-full" disabled>
              Coming Soon
            </button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              User Management
            </h3>
            <p className="text-body-small text-gray-600 mb-4">
              Manage participants and team assignments
            </p>
            <button className="btn-outlined w-full" disabled>
              Coming Soon
            </button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              Match Management
            </h3>
            <p className="text-body-small text-gray-600 mb-4">
              View and manage individual matches
            </p>
            <button className="btn-outlined w-full" disabled>
              Coming Soon
            </button>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              Court Management
            </h3>
            <p className="text-body-small text-gray-600 mb-4">
              Monitor matches and scoring in real-time
            </p>
            <button className="btn-outlined w-full" disabled>
              Coming Soon
            </button>
          </div>
        </div>

        {/* Development Status */}
        <div className="card p-6">
          <h2 className="text-title-large font-semibold text-gray-900 mb-4">
            Development Status
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-title-medium font-medium text-gray-900">Completed Features</h3>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">User Registration & Authentication</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">Sample Data Generation (Michigan Cup)</span>
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
                <span className="text-body-medium text-gray-900">Seed Group Generation</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">Tournament Bracket Visualization</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-title-medium font-medium text-gray-900">In Development</h3>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">Round-robin Match Simulation</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">Double Elimination Bracket</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">Court Management System</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">Real-time Scoring (Men/Kote/Tsuki/Do/Hansoku)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-body-medium text-gray-900">Public Court Display</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage