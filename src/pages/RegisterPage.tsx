import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import { RegisterData, KendoRank } from '../types'
import RankSelector from '../components/RankSelector'
import { User, Users, Eye, EyeOff, AlertCircle } from 'lucide-react'

/**
 * RegisterPage component with Material Design 3 styling
 * Handles user registration with dojo/team selection and kendo rank
 */

const RegisterPage: React.FC = () => {
  const { register, loading, error, clearError } = useAuth()
  const { dojos, teams, getUsersByDojoId, loadTournamentData } = useTournament()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    dojoName: '',
    teamName: '',
    kendoRank: 'Mudansha',
    auskfId: ''
  })
  
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Dojo and team suggestions
  const [dojoSuggestions, setDojoSuggestions] = useState<string[]>([])
  const [teamSuggestions, setTeamSuggestions] = useState<string[]>([])
  const [selectedDojo, setSelectedDojo] = useState<string>('')
  const [showDojoSuggestions, setShowDojoSuggestions] = useState(false)
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false)

  // Refs for click-away functionality
  const dojoDropdownRef = useRef<HTMLDivElement>(null)
  const teamDropdownRef = useRef<HTMLDivElement>(null)

  // Clear auth error when component mounts
  useEffect(() => {
    clearError()
  }, [])

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dojoDropdownRef.current && !dojoDropdownRef.current.contains(event.target as Node)) {
        setShowDojoSuggestions(false)
      }
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setShowTeamSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Update dojo suggestions based on input
  useEffect(() => {
    if (formData.dojoName.length > 0) {
      const suggestions = dojos
        .filter(dojo => dojo.name.toLowerCase().includes(formData.dojoName.toLowerCase()))
        .map(dojo => dojo.name)
        .slice(0, 5)
      setDojoSuggestions(suggestions)
    } else {
      // Show all dojos when field is empty but focused
      const allDojos = dojos.map(dojo => dojo.name).slice(0, 5)
      setDojoSuggestions(allDojos)
    }
  }, [formData.dojoName, dojos])

  // Update team suggestions based on selected dojo
  useEffect(() => {
    const dojo = dojos.find(d => d.name === selectedDojo)
    if (dojo) {
      const dojoTeams = teams.filter(team => team.dojoId === dojo.id)
      if (formData.teamName && formData.teamName.length > 0) {
        const suggestions = dojoTeams
          .filter(team => team.name.toLowerCase().includes(formData.teamName!.toLowerCase()))
          .map(team => team.name)
          .slice(0, 5)
        setTeamSuggestions(suggestions)
      } else {
        // Show all teams in dojo when field is empty but focused
        const allTeams = dojoTeams.map(team => team.name).slice(0, 5)
        setTeamSuggestions(allTeams)
      }
    } else {
      setTeamSuggestions([])
    }
  }, [formData.teamName, selectedDojo, dojos, teams])

  // Handle form input changes
  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific errors
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Update selected dojo when dojo name changes
    if (field === 'dojoName') {
      const matchingDojo = dojos.find(d => d.name === value)
      setSelectedDojo(matchingDojo ? value : '')
      
      // Clear team name if dojo changes
      if (formData.dojoName !== value) {
        setFormData(prev => ({ ...prev, teamName: '' }))
      }
    }
  }

  // Handle dojo suggestion selection
  const handleDojoSelect = (dojoName: string) => {
    handleInputChange('dojoName', dojoName)
    setDojoSuggestions([])
    setShowDojoSuggestions(false)
  }

  // Handle team suggestion selection  
  const handleTeamSelect = (teamName: string) => {
    handleInputChange('teamName', teamName)
    setTeamSuggestions([])
    setShowTeamSuggestions(false)
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required'
    }

    if (!formData.dojoName.trim()) {
      errors.dojoName = 'Dojo name is required'
    }

    if (!formData.auskfId.trim()) {
      errors.auskfId = 'AUSKF ID is required'
    }

    if (!formData.kendoRank) {
      errors.kendoRank = 'Kendo rank is required'
    }

    // Team name is now optional - no validation required

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await register(formData)
      
      // Refresh tournament data to include the new user immediately
      await loadTournamentData()
      
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by auth context
      console.error('Registration failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-headline-large font-bold text-gray-900">
            Tournament Registration
          </h1>
          <p className="text-body-large text-gray-600 mt-2">
            Join the kendo tournament and compete with the best
          </p>
        </div>

        {/* Registration Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-body-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="input-field">
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`input ${formErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your full name"
                disabled={loading}
              />
              {formErrors.fullName && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="input-field">
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input ${formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email address"
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="input-field">
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`input ${formErrors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
              {formErrors.dateOfBirth && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.dateOfBirth}</p>
              )}
            </div>

            {/* AUSKF ID */}
            <div className="input-field">
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                AUSKF ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.auskfId}
                onChange={(e) => handleInputChange('auskfId', e.target.value)}
                className={`input ${formErrors.auskfId ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your AUSKF membership ID"
                disabled={loading}
              />
              {formErrors.auskfId && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.auskfId}</p>
              )}
            </div>

            {/* Kendo Rank */}
            <RankSelector
              value={formData.kendoRank}
              onChange={(rank) => handleInputChange('kendoRank', rank)}
              error={formErrors.kendoRank}
              required
            />

            {/* Dojo Name */}
            <div className="input-field relative" ref={dojoDropdownRef}>
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Dojo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dojoName}
                onChange={(e) => handleInputChange('dojoName', e.target.value)}
                onFocus={() => {
                  setShowDojoSuggestions(true)
                }}
                className={`input ${formErrors.dojoName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Start typing your dojo name"
                disabled={loading}
              />
              
              {/* Dojo Suggestions */}
              {showDojoSuggestions && dojoSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {dojoSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDojoSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                  {!dojoSuggestions.includes(formData.dojoName) && formData.dojoName.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDojoSelect(formData.dojoName)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-primary-600 border-t border-gray-200"
                    >
                      Create new dojo: "{formData.dojoName}"
                    </button>
                  )}
                </div>
              )}
              
              {formErrors.dojoName && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.dojoName}</p>
              )}
            </div>

            {/* Team Name */}
            <div className="input-field relative" ref={teamDropdownRef}>
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Team <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => handleInputChange('teamName', e.target.value)}
                onFocus={() => {
                  if (selectedDojo) {
                    setShowTeamSuggestions(true)
                  }
                }}
                className={`input ${formErrors.teamName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Start typing your team name (optional)"
                disabled={loading || !selectedDojo}
              />
              
              {/* Team Suggestions */}
              {showTeamSuggestions && teamSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {teamSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTeamSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                  {formData.teamName && !teamSuggestions.includes(formData.teamName) && formData.teamName.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleTeamSelect(formData.teamName!)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-primary-600 border-t border-gray-200"
                    >
                      Create new team: "{formData.teamName}"
                    </button>
                  )}
                </div>
              )}
              
              {formErrors.teamName && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.teamName}</p>
              )}
            </div>

            {/* Password */}
            <div className="input-field">
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input pr-12 ${formErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="input-field">
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input pr-12 ${formErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-filled w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                <>
                  <User className="w-5 h-5 mr-2" />
                  Register for Tournament
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-body-medium text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage