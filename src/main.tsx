import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize sample data before rendering the app
const initializeSampleData = async () => {
  const { initializeSampleData, forceResetSampleData } = await import('./utils/sampleData')
  
  // Check if super admin exists in current data
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
  const hasSuperAdmin = existingUsers.some((user: any) => user.role === 'super_admin')
  
  if (!hasSuperAdmin) {
    // Force reset if super admin doesn't exist (ensures we have latest data structure)
    forceResetSampleData()
  } else {
    // Normal initialization
    initializeSampleData()
  }
}

initializeSampleData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
