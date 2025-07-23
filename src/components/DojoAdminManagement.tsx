import React, { useState } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import { Dojo } from '../types'
import LogoUpload from './LogoUpload'
import { Building, Trash2, Edit3, AlertTriangle, X, Users, Trophy, Check } from 'lucide-react'

/**
 * DojoAdminManagement component - Admin interface for managing dojos
 * Allows admins to view, edit logos, and delete dojos with confirmation dialogs
 */

const DojoAdminManagement: React.FC = () => {
  const { dojos, teams, users, updateDojo, deleteDojo } = useTournament()
  const [editingNameDojo, setEditingNameDojo] = useState<Dojo | null>(null)
  const [editingLogoDojo, setEditingLogoDojo] = useState<Dojo | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [deletingDojo, setDeletingDojo] = useState<Dojo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter dojos based on search query
  const filteredDojos = dojos.filter(dojo => 
    dojo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get statistics for a dojo
  const getDojoStats = (dojo: Dojo) => {
    const dojoTeams = teams.filter(team => team.dojoId === dojo.id)
    const dojoUsers = users.filter(user => user.dojoId === dojo.id)
    return {
      teamCount: dojoTeams.length,
      memberCount: dojoUsers.length
    }
  }

  // Handle dojo deletion with confirmation
  const handleDeleteDojo = async () => {
    if (!deletingDojo) return

    try {
      await deleteDojo(deletingDojo.id)
      setDeletingDojo(null)
    } catch (error) {
      console.error('Failed to delete dojo:', error)
    }
  }

  // Handle name editing start
  const handleStartNameEdit = (dojo: Dojo) => {
    setEditingNameDojo(dojo)
    setEditingName(dojo.name)
  }

  // Handle name save
  const handleNameSave = async () => {
    if (!editingNameDojo || !editingName.trim()) return

    try {
      await updateDojo(editingNameDojo.id, { name: editingName.trim() })
      setEditingNameDojo(null)
      setEditingName('')
    } catch (error) {
      console.error('Failed to update dojo name:', error)
    }
  }

  // Handle name cancel
  const handleNameCancel = () => {
    setEditingNameDojo(null)
    setEditingName('')
  }

  // Handle logo upload
  const handleLogoUpdate = async (dojo: Dojo, logoData: string) => {
    try {
      await updateDojo(dojo.id, { logo: logoData })
      // Don't close modal - let user close it manually
    } catch (error) {
      console.error('Failed to update dojo logo:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title-large font-semibold text-gray-900">Dojo Management</h2>
          <p className="text-body-medium text-gray-600 mt-1">
            Manage tournament dojos and their logos
          </p>
        </div>
        <div className="text-right">
          <div className="text-headline-small font-bold text-primary-600">{filteredDojos.length}</div>
          <div className="text-body-small text-gray-600">Total Dojos</div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Search dojos by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Dojos Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDojos.map((dojo) => {
          const stats = getDojoStats(dojo)
          
          return (
            <div key={dojo.id} className="card p-6">
              {/* Dojo Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {/* Dojo Logo */}
                  {dojo.logo ? (
                    <img
                      src={dojo.logo}
                      alt={`${dojo.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-primary-200 mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-200 rounded-lg flex items-center justify-center mr-3">
                      <Building className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {editingNameDojo?.id === dojo.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="text-title-medium font-semibold text-gray-900 bg-white border border-primary-300 rounded px-2 py-1 flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNameSave()
                            if (e.key === 'Escape') handleNameCancel()
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleNameSave}
                          className="text-green-600 hover:text-green-700 p-1 rounded"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNameCancel}
                          className="text-gray-600 hover:text-gray-700 p-1 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 
                        className="text-title-medium font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
                        onClick={() => handleStartNameEdit(dojo)}
                        title="Click to edit name"
                      >
                        {dojo.name}
                      </h3>
                    )}
                    <p className="text-body-small text-gray-500">
                      ID: {dojo.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingLogoDojo(dojo)}
                    className="text-primary-600 hover:text-primary-700 p-1 rounded"
                    title="Edit Logo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingDojo(dojo)}
                    className="text-red-600 hover:text-red-700 p-1 rounded"
                    title="Delete Dojo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-accent-600 mr-1" />
                  </div>
                  <div className="text-title-medium font-bold text-gray-900">{stats.teamCount}</div>
                  <div className="text-body-small text-gray-600">Teams</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-primary-600 mr-1" />
                  </div>
                  <div className="text-title-medium font-bold text-gray-900">{stats.memberCount}</div>
                  <div className="text-body-small text-gray-600">Members</div>
                </div>
              </div>

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-body-small text-gray-500">
                  Created: {new Date(dojo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {filteredDojos.length === 0 && (
        <div className="card p-12 text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
            No dojos found
          </h3>
          <p className="text-body-medium text-gray-600">
            {searchQuery ? 'Try adjusting your search criteria.' : 'No dojos have been registered yet.'}
          </p>
        </div>
      )}

      {/* Logo Edit Modal */}
      {editingLogoDojo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-medium font-semibold text-gray-900">
                Update Dojo Logo
              </h3>
              <button
                onClick={() => setEditingLogoDojo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-body-medium text-gray-600 mb-2">
                Updating logo for: <strong>{editingLogoDojo.name}</strong>
              </p>
              
              {/* Current Logo */}
              {editingLogoDojo.logo && (
                <div className="mb-4">
                  <p className="text-body-small text-gray-500 mb-2">Current Logo:</p>
                  <img
                    src={editingLogoDojo.logo}
                    alt="Current logo"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>

            <LogoUpload
              currentLogo={editingLogoDojo.logo}
              onLogoChange={(logoData) => logoData && handleLogoUpdate(editingLogoDojo, logoData)}
              label="Upload New Logo"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setEditingLogoDojo(null)}
                className="btn-outlined"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDojo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-title-medium font-semibold text-gray-900">
                Delete Dojo
              </h3>
            </div>
            
            {(() => {
              const stats = getDojoStats(deletingDojo)
              return (
                <div>
                  <p className="text-body-medium text-gray-600 mb-4">
                    Are you sure you want to delete <strong>{deletingDojo.name}</strong>?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-body-small text-red-800 font-medium mb-2">
                      This will also delete:
                    </p>
                    <ul className="text-body-small text-red-700 space-y-1">
                      <li>• {stats.teamCount} team{stats.teamCount !== 1 ? 's' : ''}</li>
                      <li>• {stats.memberCount} member{stats.memberCount !== 1 ? 's' : ''}</li>
                    </ul>
                    <p className="text-body-small text-red-800 font-medium mt-2">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              )
            })()}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingDojo(null)}
                className="btn-outlined"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleDeleteDojo}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Dojo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DojoAdminManagement