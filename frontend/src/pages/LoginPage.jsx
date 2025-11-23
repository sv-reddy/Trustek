import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const [isLogin, setIsLogin] = useState(!searchParams.get('signup'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const result = await signIn(email, password)
        console.log('Login successful:', result)
        navigate('/dashboard')
      } else {
        if (!phoneNumber) {
          setError('Phone number is required for registration')
          setLoading(false)
          return
        }
        const result = await signUp(email, password, phoneNumber)
        console.log('Signup successful:', result)
        
        // With email confirmation disabled, we should get a session immediately
        if (result.session) {
          console.log('✅ Signup complete with session, navigating to dashboard')
          navigate('/dashboard')
        } else if (result.user) {
          // Fallback: no session means confirmation is still required
          setError('✅ Account created! Please check your email to verify your account.')
          setIsLogin(true)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      
      // Provide more specific error messages
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email address. Check your inbox for the confirmation link.')
      } else if (err.message?.includes('User already registered')) {
        setError('This email is already registered. Please login instead.')
      } else if (err.message?.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.')
      } else if (err.message?.includes('Unable to validate email')) {
        setError('Invalid email format. Please check your email address.')
      } else if (err.message?.includes('signup disabled')) {
        setError('Signups are currently disabled. Please contact support.')
      } else {
        setError(err.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">TrusTek Fusion</h1>
          <p className="text-gray-400">Voice-Controlled Financial Agent on Starknet</p>
        </div>

        <div className="card">
          <div className="flex mb-6 bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition-colors ${
                isLogin ? 'bg-primary-600 text-white' : 'text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition-colors ${
                !isLogin ? 'bg-primary-600 text-white' : 'text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required={!isLogin}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="+1234567890"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
