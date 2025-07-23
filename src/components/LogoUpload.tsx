import React, { useState, useRef } from 'react'
import { Upload, X, Image, AlertCircle } from 'lucide-react'

/**
 * LogoUpload component for uploading dojo and team logos
 * Supports image file upload with preview and validation
 */

interface LogoUploadProps {
  currentLogo?: string
  onLogoChange: (logo: string | null) => void
  label: string
  disabled?: boolean
}

const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogo,
  onLogoChange,
  label,
  disabled = false
}) => {
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Validate file
  const validateFile = async (file: File): Promise<string | null> => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file'
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return 'Image size must be less than 2MB'
    }

    // Check image dimensions (optional - you can adjust these)
    return new Promise<string | null>((resolve) => {
      const img = document.createElement('img')
      img.onload = () => {
        // Max dimensions: 500x500 pixels
        if (img.width > 500 || img.height > 500) {
          resolve('Image dimensions must be 500x500 pixels or smaller')
        } else {
          resolve(null)
        }
      }
      img.onerror = () => resolve('Invalid image file')
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setIsUploading(true)

    try {
      // Validate file
      const validationError = await validateFile(file)
      if (validationError) {
        setError(validationError)
        setIsUploading(false)
        return
      }

      // Convert to base64
      const base64 = await fileToBase64(file)
      onLogoChange(base64)
    } catch (err) {
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle remove logo
  const handleRemoveLogo = () => {
    onLogoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle click on upload area
  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-label-large font-medium text-gray-700">
        {label}
      </label>
      
      {/* Upload Area */}
      <div className="relative">
        {currentLogo ? (
          // Show current logo with remove option
          <div className="relative inline-block">
            <img
              src={currentLogo}
              alt="Logo preview"
              className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          // Show upload area
          <div
            onClick={handleUploadClick}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${disabled 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }
            `}
          >
            <div className="space-y-2">
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  <Image className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="text-body-medium text-gray-600">
                    <span className="font-medium text-primary-600">Click to upload</span>
                    <span> or drag and drop</span>
                  </div>
                  <div className="text-body-small text-gray-500">
                    PNG, JPG up to 2MB (max 500x500px)
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-body-small text-red-800">{error}</p>
        </div>
      )}

      {/* Help text */}
      <div className="text-body-small text-gray-500">
        Upload a logo to represent your {label.toLowerCase()}. The image will be displayed alongside your team information.
      </div>
    </div>
  )
}

export default LogoUpload