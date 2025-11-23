import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, Phone, Globe, TrendingUp, AlertCircle, ArrowRight, Check } from 'lucide-react'

export default function ProfileCompletionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const totalSteps = 2

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    display_name: '',
    phone_number: '',
    
    // Step 2: Trading Preferences
    risk_profile: 'Balanced',
    trading_pairs: ['ETH/USDC', 'STRK/ETH'],
    max_rebalance_size: 10,
    voice_language: 'English',
    sms_notifications: false,
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTradingPairToggle = (pair) => {
    setFormData(prev => ({
      ...prev,
      trading_pairs: prev.trading_pairs.includes(pair)
        ? prev.trading_pairs.filter(p => p !== pair)
        : [...prev.trading_pairs, pair]
    }))
  }

  const validateStep1 = () => {
    if (!formData.display_name.trim()) {
      setError('Please enter your display name')
      return false
    }
    if (!formData.phone_number.trim()) {
      setError('Please enter your phone number')
      return false
    }
    if (!/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
      setError('Please enter a valid phone number')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.trading_pairs.length === 0) {
      setError('Please select at least one trading pair')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateStep2()) return
    
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      console.log('📝 Creating profile for user:', user.id)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            display_name: formData.display_name,
            phone_number: formData.phone_number,
            risk_profile: formData.risk_profile,
            trading_pairs: formData.trading_pairs,
            max_rebalance_size: formData.max_rebalance_size,
            voice_language: formData.voice_language,
            sms_notifications: formData.sms_notifications,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: user.id,
              display_name: formData.display_name,
              phone_number: formData.phone_number,
              risk_profile: formData.risk_profile,
              trading_pairs: formData.trading_pairs,
              max_rebalance_size: formData.max_rebalance_size,
              voice_language: formData.voice_language,
              sms_notifications: formData.sms_notifications,
            },
          ])

        if (insertError) throw insertError
      }

      console.log('✅ Profile created/updated successfully')
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('❌ Profile creation error:', err)
      setError(err.message || 'Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-full mb-4">
            <User className="h-8 w-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">Help us personalize your trading experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-500" />
                    Basic Information
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Let's start with some basic details about you
                  </p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => handleChange('display_name', e.target.value)}
                    placeholder="How should we call you?"
                    className="input-field"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">This name will be displayed in your profile</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleChange('phone_number', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">For SMS notifications and account verification</p>
                </div>

                {/* Voice Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Language
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <select
                      value={formData.voice_language}
                      onChange={(e) => handleChange('voice_language', e.target.value)}
                      className="input-field pl-12"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Voice-to-voice AI feature coming soon</p>
                </div>
              </div>
            )}

            {/* Step 2: Trading Preferences */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary-500" />
                    Trading Preferences
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Configure your trading strategy and risk tolerance
                  </p>
                </div>

                {/* Risk Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Risk Profile *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Conservative', 'Balanced', 'Aggressive'].map((profile) => (
                      <button
                        key={profile}
                        type="button"
                        onClick={() => handleChange('risk_profile', profile)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.risk_profile === profile
                            ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                            : 'border-dark-600 bg-dark-700/50 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-medium">{profile}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trading Pairs */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Trading Pairs * <span className="text-gray-500 text-xs">(Select at least one)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['ETH/USDC', 'STRK/ETH', 'BTC/USDC', 'STRK/USDC'].map((pair) => (
                      <button
                        key={pair}
                        type="button"
                        onClick={() => handleTradingPairToggle(pair)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.trading_pairs.includes(pair)
                            ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                            : 'border-dark-600 bg-dark-700/50 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{pair}</span>
                          {formData.trading_pairs.includes(pair) && (
                            <Check className="h-5 w-5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Rebalance Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Max Position Shift per Trade: {formData.max_rebalance_size}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="5"
                    value={formData.max_rebalance_size}
                    onChange={(e) => handleChange('max_rebalance_size', parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative (5%)</span>
                    <span>Aggressive (25%)</span>
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Enable SMS Notifications</p>
                    <p className="text-sm text-gray-400">Get alerts for important trades and events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sms_notifications}
                      onChange={(e) => handleChange('sms_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Skip for now
                </button>
              </div>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-gray-500 mt-6">
          You can always update these preferences later in your profile settings
        </p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
