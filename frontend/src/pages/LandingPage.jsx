import { Link } from 'react-router-dom'
import { 
  Shield, Zap, TrendingUp, Lock, Bot, Phone, Wallet, 
  ArrowRight, CheckCircle, BarChart3, Globe, Sparkles
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-950">
      {/* Navigation */}
      <nav className="border-b border-blue-800/50 bg-blue-950/80 backdrop-blur-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">TrusTek Fusion</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/login?signup=true"
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/50"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/40 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span className="text-sm text-cyan-300 font-medium">AI-Powered DeFi Trading</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Personal
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500"> AI Trading Agent</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            TrusTek Fusion combines cutting-edge AI with secure blockchain technology to automate 
            your DeFi trading strategies. Trade smarter, not harder.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login?signup=true"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/50"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-blue-800/50 bg-blue-950/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">$50M+</p>
              <p className="text-gray-400">Total Value Locked</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">10K+</p>
              <p className="text-gray-400">Active Traders</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">24/7</p>
              <p className="text-gray-400">Automated Trading</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">98.5%</p>
              <p className="text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose TrusTek Fusion?
            </h2>
            <p className="text-xl text-gray-400">
              Built for the modern DeFi trader who values security and automation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Automation</h3>
              <p className="text-gray-400">
                Advanced machine learning algorithms analyze market trends and execute trades 24/7 
                based on your strategy and risk preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bank-Level Security</h3>
              <p className="text-gray-400">
                Your funds stay in your wallet. Session keys enable automated trading without 
                compromising custody of your assets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Starknet Integration</h3>
              <p className="text-gray-400">
                Built on Starknet for ultra-low fees and lightning-fast transactions. 
                Connect with ArgentX and start trading instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Analytics</h3>
              <p className="text-gray-400">
                Track your portfolio performance with live price feeds from Yahoo Finance 
                and comprehensive profit/loss reports.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Voice Notifications</h3>
              <p className="text-gray-400">
                Get instant SMS and voice call updates on your trades. Stay informed 
                without constantly checking your dashboard.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Risk Management</h3>
              <p className="text-gray-400">
                Set custom volatility limits, position sizes, and rebalance frequencies. 
                The AI works within your defined risk parameters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-500">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Connect Your Wallet</h3>
              <p className="text-gray-400">
                Link your ArgentX wallet to TrusTek Fusion. Your assets remain under your control at all times.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-500">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Set Your Strategy</h3>
              <p className="text-gray-400">
                Choose your risk profile, trading pairs, and automation preferences. Customize to match your goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-500">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Let AI Trade for You</h3>
              <p className="text-gray-400">
                Activate session keys and let the AI handle the rest. Monitor performance anytime on your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-500/10 to-blue-500/10 border border-primary-500/30 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of traders who trust TrusTek Fusion for automated DeFi trading
          </p>
          <Link
            to="/login?signup=true"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Start Trading Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary-500" />
                <span className="font-bold text-white">TrusTek Fusion</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered automated trading on Starknet. Secure, transparent, and always in your control.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-primary-500">Features</a></li>
                <li><a href="#" className="hover:text-primary-500">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-500">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-500">About Us</a></li>
                <li><a href="#" className="hover:text-primary-500">Blog</a></li>
                <li><a href="#" className="hover:text-primary-500">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-500">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-700 pt-8 text-center text-sm text-gray-500">
            © 2025 TrusTek Fusion. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
