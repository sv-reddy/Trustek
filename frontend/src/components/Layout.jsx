import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Home, User, Mic } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { address, disconnectWallet } = useWallet()

  const handleLogout = async () => {
    await disconnectWallet()
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mic className="h-8 w-8 text-primary-500" />
              <h1 className="ml-2 text-xl font-bold text-white">TrusTek Fusion</h1>
            </div>

            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/'
                    ? 'bg-dark-700 text-white'
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Home className="inline h-4 w-4 mr-1" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/profile'
                    ? 'bg-dark-700 text-white'
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <User className="inline h-4 w-4 mr-1" />
                Profile
              </Link>
              
              {address && (
                <div className="text-sm text-gray-300 px-3 py-2 bg-dark-700 rounded-md">
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white"
              >
                <LogOut className="inline h-4 w-4 mr-1" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
