import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, Trophy, User, Settings, LogOut, Sword } from 'lucide-react'

/**
 * Navigation component with Material Design 3 styling
 * Responsive mobile-first navigation with authentication-aware menu items
 */

const Navigation: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  // Close mobile menu when clicking nav items
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Check if current path is active
  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  // Navigation items based on authentication state
  const getNavItems = () => {
    const publicItems = [
      { label: 'Home', path: '/', icon: Trophy },
      { label: 'Bracket', path: '/bracket', icon: Sword }
    ]

    if (!user) {
      return [
        ...publicItems,
        { label: 'Login', path: '/login', icon: User },
        { label: 'Register', path: '/register', icon: User }
      ]
    }

    const authenticatedItems = [
      ...publicItems,
      { label: 'Dashboard', path: '/dashboard', icon: User }
    ]

    if (user.role === 'admin') {
      authenticatedItems.push({ label: 'Admin', path: '/admin', icon: Settings })
    }

    return authenticatedItems
  }

  const navItems = getNavItems()

  return (
    <nav className="nav-bar sticky top-0 z-50 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-headline-small font-medium text-gray-900 hover:text-primary-600 transition-colors"
            onClick={closeMobileMenu}
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block">Kendo Tournament</span>
            <span className="sm:hidden">Tournament</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* User menu for authenticated users */}
            {user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-gray-500 text-xs">{user.kendoRank}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Mobile user info and logout */}
              {user && (
                <>
                  <div className="px-4 py-3 border-t border-gray-200 mt-4">
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.kendoRank}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation