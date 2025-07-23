import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoginCredentials } from '../types'
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'

/**
 * LoginPage component with Material Design 3 styling
 * Handles user authentication
 */

const LoginPage: React.FC = () => {
  const { login, loading, error, clearError, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already logged in - only on successful login, not on route changes
  // useEffect(() => {
  //   if (user && location.pathname === '/login') {
  //     const from = (location.state as any)?.from?.pathname || '/dashboard'
  //     navigate(from, { replace: true })
  //   }
  // }, [user, navigate, location.pathname, location.state])

  // Form state
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Clear auth error when component mounts
  useEffect(() => {
    clearError()
  }, [])

  // Handle input changes
  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific errors
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!credentials.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!credentials.password) {
      errors.password = 'Password is required'
    }

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
      await login(credentials)
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      // Error is handled by auth context
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-headline-large font-bold text-gray-900">
            Sign In
          </h1>
          <p className="text-body-large text-gray-600 mt-2">
            Welcome back to the tournament
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-body-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-label-large font-medium text-blue-900 mb-2">Demo Credentials</h3>
              <div className="space-y-1 text-body-small text-blue-800">
                <p><strong>Admin:</strong> admin@tournament.com / admin123</p>
                <p><strong>User:</strong> joshua.rhodes@bnkc.com / password123</p>
              </div>
            </div>

            {/* Email */}
            <div className="input-field">
              <label className="block text-label-large font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input ${formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email address"
                disabled={loading}
                autoComplete="email"
              />
              {formErrors.email && (
                <p className="mt-2 text-body-small text-red-600">{formErrors.email}</p>
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
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input pr-12 ${formErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-filled w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-body-medium text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage