import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isProfileComplete } from '../lib/profileHelpers'

export default function ProtectedRoute({ children, requireCompleteProfile = false }) {
  const { user, loading: authLoading } = useAuth()
  const [profileComplete, setProfileComplete] = useState(null)
  const [checking, setChecking] = useState(requireCompleteProfile)

  useEffect(() => {
    const checkProfile = async () => {
      if (user && requireCompleteProfile) {
        setChecking(true)
        const complete = await isProfileComplete(user.id)
        setProfileComplete(complete)
        setChecking(false)
      }
    }

    checkProfile()
  }, [user, requireCompleteProfile])

  // Show loading while checking auth
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect to profile completion if required and not complete
  if (requireCompleteProfile && profileComplete === false) {
    return <Navigate to="/complete-profile" replace />
  }

  // Render children if all checks pass
  return children
}
