import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, DUMMY_USERS, type User } from '../../context/AuthContext'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import pradeshiyaSabhaImg from '../../assets/pradeshiyasabha.png'

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  // 1 = Credentials, 2 = OTP
  const [step, setStep] = useState<number>(1)
  const [orgId, setOrgId] = useState<string>('1999701')
  const [password, setPassword] = useState<string>('1999@Thuhina')
  const [otp, setOtp] = useState<string>('123456')
  const [selectedUser, setSelectedUser] = useState<User>(DUMMY_USERS.admin)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // Quick select helper for testing
  const selectQuickUser = (type: 'admin' | 'staff') => {
    if (type === 'admin') {
      setSelectedUser(DUMMY_USERS.admin)
      setOrgId('1999701')
      setPassword('admin@123')
    } else {
      setSelectedUser(DUMMY_USERS.staff)
      setOrgId('1999703')
      setPassword('staff@123')
    }
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    // Check if staff
    if (orgId.includes('703') || orgId.toLowerCase().includes('staff')) {
      setSelectedUser(DUMMY_USERS.staff)
    } else {
      setSelectedUser(DUMMY_USERS.admin)
    }
    setStep(2)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Perform login with selected user and save session
    login(selectedUser)
    navigate('/overview')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <TopBar hideNav />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-gray-100 min-h-[560px]">
          {/* Left Column: Branding / Banner */}
          <div className="md:col-span-6 bg-[#801028] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[480px]">
            {/* Background Image */}
            <img
              src={pradeshiyaSabhaImg}
              alt="Homagama Pradeshiya Sabha Building"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-50 transition-transform duration-700 hover:scale-105 pointer-events-none"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#400510] via-[#801028]/10 to-transparent pointer-events-none" />



            {/* Bottom Text */}
            <div className="relative z-10 mt-auto pt-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 drop-shadow">
                Empowering Homagama
              </h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed font-light drop-shadow">
                Welcome to our Unified Digital Gateway. Celebrating one year of digital transformation, we are committed to providing a seamless, transparent, and efficient administrative experience for all our citizens.
              </p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-white relative">
            {/* Tab Header */}
            <div className="mb-6">
              <span className="text-sm font-bold text-[#003366] pb-2 border-b-2 border-[#003366] inline-block">
                Staff Login
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Staff Login
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Please provide your details to receive an authentication code.
            </p>

            {/* Quick Test Demo Selector */}
            <div className="mb-6 bg-red-50/80 border border-red-100 rounded-xl p-3">
              <p className="text-xs font-bold text-[#A31736] mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <span>⚡ Quick Test Account Selector</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectQuickUser('admin')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-left flex flex-col ${selectedUser.role === 'admin'
                    ? 'bg-[#A31736] text-white border-[#A31736] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'
                    }`}
                >
                  <span>Admin User</span>
                  <span className={`text-[10px] font-normal ${selectedUser.role === 'admin' ? 'text-white/80' : 'text-gray-500'}`}>
                    Full Access (All + My Appts)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickUser('staff')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-left flex flex-col ${selectedUser.role === 'staff'
                    ? 'bg-[#A31736] text-white border-[#A31736] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'
                    }`}
                >
                  <span>Staff Member</span>
                  <span className={`text-[10px] font-normal ${selectedUser.role === 'staff' ? 'text-white/80' : 'text-gray-500'}`}>
                    Limited (Only My Appts)
                  </span>
                </button>
              </div>
            </div>

            {/* Step 1: Credentials Form */}
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Organization ID
                  </label>
                  <input
                    type="text"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    placeholder="Ex:1999703"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A31736] focus:border-transparent text-sm transition-all bg-gray-50/50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ex:1999@Thuhina"
                      required
                      className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A31736] focus:border-transparent text-sm transition-all bg-gray-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#A31736] hover:bg-[#801028] active:bg-[#600b1d] text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    <span>Send OTP</span>
                    <SendIcon />
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: OTP Form */
              <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 text-xs text-gray-600">
                  <span>OTP dispatched for <strong>{selectedUser.name}</strong> ({selectedUser.email}).</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Ex:1999703"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A31736] focus:border-transparent text-sm transition-all bg-gray-50/50 focus:bg-white tracking-widest font-mono font-semibold"
                  />
                  <p className="text-xs text-gray-400 mt-1">Use dummy OTP: 123456</p>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-[#A31736] hover:bg-[#801028] active:bg-[#600b1d] text-white font-medium py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    <span>Login</span>
                    <SendIcon />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-800 py-1 transition-colors"
                  >
                    ← Back to credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LoginPage
