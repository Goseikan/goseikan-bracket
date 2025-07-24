import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize sample data before rendering the app
const initializeSampleData = async () => {
  const { initializeSampleData } = await import('./utils/sampleData')
  initializeSampleData()
}

initializeSampleData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
