import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import React from 'react'

/**
 * Custom hook to scroll to top on route changes
 * Automatically scrolls to the top of the page when the user navigates to a new route
 * Accounts for fixed/sticky navigation bar height
 */
export const useScrollToTop = () => {
  const location = useLocation()

  useEffect(() => {
    // Force scroll to top immediately and then with smooth behavior
    // This ensures it works for all routes including login/register/home
    
    // Immediate scroll to ensure it happens
    window.scrollTo(0, 0)
    
    // Follow up with smooth scroll for better UX
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }, 10) // Very short delay to ensure DOM is ready

    return () => clearTimeout(scrollTimeout)
  }, [location.pathname, location.search]) // Also trigger on search changes
}

/**
 * Component wrapper that provides scroll-to-top functionality
 * Use this component to wrap your app or specific routes
 */
export const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useScrollToTop()
  return <>{children}</>
}

export default useScrollToTop