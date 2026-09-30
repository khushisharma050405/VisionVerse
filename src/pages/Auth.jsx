import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAuth = (e) => {
    e.preventDefault()
    setErr('')
    setSuccess('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setErr('Please enter a valid email address.')
    }
    if (!password || password.length < 6) {
      return setErr('Password must be at least 6 characters long.')
    }

    setLoading(true)

    let users = []
    try {
      const stored = localStorage.getItem('visionverse.users')
      users = stored ? JSON.parse(stored) : []
    } catch {
      users = []
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setLoading(false)
        return setErr('Please enter your full name.')
      }
      if (password !== confirmPassword) {
        setLoading(false)
        return setErr('Passwords do not match.')
      }
      const existing = users.find((u) => u.email === cleanEmail)
      if (existing) {
        setLoading(false)
        return setErr('An account with this email already exists. Please sign in.')
      }

      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password: password,
        createdAt: Date.now(),
      }
      users.push(newUser)
      localStorage.setItem('visionverse.users', JSON.stringify(users))

      setTimeout(() => {
        setLoading(false)
        onLogin({
          name: newUser.name,
          email: newUser.email,
          rememberMe,
        })
      }, 350)
    } else {
      const user = users.find((u) => u.email === cleanEmail)
      if (user && user.password !== password) {
        setLoading(false)
        return setErr('Incorrect password. Please try again.')
      }

      const userName = user ? user.name : cleanEmail.split('@')[0].replace(/[._]/g, ' ')

      setTimeout(() => {
        setLoading(false)
        onLogin({
          name: userName.charAt(0).toUpperCase() + userName.slice(1),
          email: cleanEmail,
          rememberMe,
        })
      }, 350)
    }
  }

  const handleQuickDemo = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin({
        name: 'Vision Explorer',
        email: 'demo@visionverse.ai',
        rememberMe: true,
      })
    }, 250)
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    if (!forgotEmail || !forgotEmail.includes('@')) {
      return setErr('Please enter a valid email for password recovery.')
    }
    setForgotSent(true)
    setErr('')
  }

  return (
    <div
      className="relative min-h-screen w-full text-[#FAF4E8] overflow-hidden flex flex-col justify-between select-none"
      style={{
        backgroundColor: '#202816',
        backgroundImage: `radial-gradient(ellipse at 32% 44%, #384626 0%, #29341C 38%, #1F2715 72%, #151B0E 100%)`,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP EDITORIAL NAVIGATION BAR (1:1 with reference)
      ────────────────────────────────────────────────────────────── */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-7 pb-4 flex items-center justify-between text-[11px] sm:text-xs tracking-[0.24em] uppercase font-sans">
        {/* Left Spacer to keep center brand aligned */}
        <div className="flex-1 hidden sm:block" />

        {/* Center Brand */}
        <div className="text-center">
          <span className="font-editorial text-sm sm:text-base tracking-[0.3em] font-bold text-[#FAF4E8]">
            VISIONVERSE
          </span>
        </div>

        {/* Right Nav */}
        <div className="flex-1 flex items-center justify-end gap-6 sm:gap-9 text-[#A2AA8A]">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="hover:text-[#FAF4E8] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Instant Demo Access"
          >
            <Sparkles size={13} className="text-[#C1BD63]" />
            <span className="hidden sm:inline">DEMO</span>
          </button>
          <span
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setForgotOpen(false)
              setErr('')
            }}
            className="font-bold text-[#FAF4E8] hover:text-[#C1BD63] transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN SECTION: BALANCED 2-COLUMN GRID (EQUAL SPACES, NO COLLISION)
      ────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-8 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-14 xl:gap-20 w-full">
          
          {/* ── LEFT: TEXTUAL HERO (6 COLS, 2-3 SIZES SMALLER) ── */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left max-w-lg">
            {/* Italic script accent */}
            <p className="font-script italic text-2xl sm:text-3xl text-[#D8CEB6] mb-1 font-normal tracking-wide drop-shadow">
              Visual Intelligence
            </p>

            {/* VISIONVERSE headline: 2-3 sizes smaller, refined proportion */}
            <h1 className="font-editorial font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] tracking-tight text-[#FAF4E8] uppercase leading-[0.95] drop-shadow-md mb-5">
              VISIONVERSE
            </h1>

            {/* Editorial quote with vertical accent line */}
            <div className="border-l-2 border-[#A8A162]/60 pl-4 py-1 mb-5">
              <p className="font-script italic text-xl sm:text-2xl text-[#EAE2D0] leading-snug">
                “Every image has a story.
                <br />
                <span className="text-[#C8C278]">Let AI put it into words.”</span>
              </p>
            </div>

            {/* Contextual subtext */}
            <p className="font-sans text-xs sm:text-sm text-[#DDD4BF]/80 leading-relaxed max-w-md mb-6">
              Sign back in to your account to generate natural language captions, inspect ViT spatial attention heatmaps, and experience state-of-the-art vision models.
            </p>

            {/* Model Status Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#E5DEC9] w-fit">
              <span className="w-2 h-2 rounded-full bg-[#8EBF65] animate-pulse" />
              <span>SALESFORCE BLIP &middot; NEURAL INFERENCE READY</span>
            </div>
          </div>

          {/* ── RIGHT: WARM CREAM LOGIN PORTAL (6 COLS, BALANCED) ── */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[460px] bg-[#F7ECE1] text-[#2B3521] rounded-xl shadow-2xl shadow-black/50 p-8 sm:p-10 lg:p-12 min-h-[560px] flex flex-col justify-between transition-all">
            
            <div>
              {/* Card Title */}
              <h2 className="font-editorial font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#2B3521] leading-none mb-8">
                {forgotOpen
                  ? 'PASSWORD'
                  : mode === 'login'
                  ? 'YOUR ACCOUNT'
                  : 'YOUR ACCOUNT'}
              </h2>

              {/* Error Alert */}
              {err && (
                <div role="alert" className="mb-5 p-3 rounded bg-[#FBE5DE] border border-[#EAC2B7] text-[#862518] text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div role="status" className="mb-5 p-3 rounded bg-[#E4EFE2] border border-[#BFDCB9] text-[#1E5C25] text-xs flex items-start gap-2">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Forgot Password Flow */}
              {forgotOpen ? (
                <div className="space-y-5">
                  {forgotSent ? (
                    <div className="p-4 rounded bg-[#E4EFE2] text-[#254C1C] text-xs space-y-2">
                      <p className="font-semibold">Reset Link Simulated</p>
                      <p>Instructions have been simulated for {forgotEmail}.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotOpen(false)
                          setForgotSent(false)
                        }}
                        className="mt-3 px-5 py-2.5 bg-[#969845] hover:bg-[#85873C] text-white font-editorial font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
                      >
                        BACK TO LOGIN
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotSubmit} className="space-y-5">
                      <div>
                        <label className="block text-xs font-black tracking-widest uppercase text-[#2B3521] mb-2 font-editorial">
                          EMAIL
                        </label>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full bg-[#EFE3D3]/70 border border-[#D5C9B5] focus:bg-white focus:border-[#4B5E38] text-sm text-[#2B3521] px-4 py-3.5 rounded outline-none transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-7 py-3 rounded bg-[#969845] hover:bg-[#85873C] text-[#242C1B] font-editorial font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                      >
                        SEND LINK
                      </button>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotOpen(false)
                            setErr('')
                          }}
                          className="text-xs text-[#556041] hover:text-[#2B3521] font-medium"
                        >
                          ← Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* Main Form (Exact styling from Image 1) */
                <form onSubmit={handleAuth} className="space-y-6">
                  {/* Full Name for Signup */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-black tracking-widest uppercase text-[#2B3521] mb-2 font-editorial">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-[#EFE3D3]/70 border border-[#D5C9B5] focus:bg-white focus:border-[#4B5E38] text-sm text-[#2B3521] px-4 py-3.5 rounded outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* EMAIL */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase text-[#2B3521] mb-2 font-editorial">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#EFE3D3]/70 border border-[#D5C9B5] focus:bg-white focus:border-[#4B5E38] text-sm text-[#2B3521] px-4 py-3.5 rounded outline-none transition-all"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-xs font-black tracking-widest uppercase text-[#2B3521] mb-2 font-editorial">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#EFE3D3]/70 border border-[#D5C9B5] focus:bg-white focus:border-[#4B5E38] text-sm text-[#2B3521] pl-4 pr-11 py-3.5 rounded outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8567] hover:text-[#2B3521] p-1 cursor-pointer transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password for Signup */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-black tracking-widest uppercase text-[#2B3521] mb-2 font-editorial">
                        CONFIRM PASSWORD
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-[#EFE3D3]/70 border border-[#D5C9B5] focus:bg-white focus:border-[#4B5E38] text-sm text-[#2B3521] pl-4 pr-11 py-3.5 rounded outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Options row (subtle) */}
                  <div className="flex items-center justify-between text-xs pt-0.5 text-[#556041]">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-[#969845] w-3.5 h-3.5 rounded cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotOpen(true)
                          setForgotSent(false)
                          setErr('')
                        }}
                        className="hover:text-[#2B3521] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  {/* Exact olive-khaki LOG IN Button from Image 1 */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded bg-[#969845] hover:bg-[#85873C] active:scale-[0.98] disabled:bg-[#969845]/60 text-[#212A16] font-editorial font-black text-xs uppercase tracking-widest shadow-sm hover:shadow transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-[#212A16]/40 border-t-[#212A16] rounded-full animate-spin" />
                      ) : (
                        <span>{mode === 'login' ? 'LOG IN' : 'SIGN UP'}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Section: Divider Line + DON'T HAVE AN ACCOUNT? & SIGN UP ↗ */}
            <div className="pt-8">
              <div className="border-t border-[#3B482A]/30 pt-4 flex items-center justify-between text-xs">
                {mode === 'login' ? (
                  <>
                    <span className="font-editorial font-bold text-[11px] sm:text-xs tracking-wider uppercase text-[#556041]">
                      DON'T HAVE AN ACCOUNT?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        setErr('')
                        setSuccess('')
                      }}
                      className="font-editorial font-black text-[11px] sm:text-xs tracking-wider uppercase text-[#2B3521] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>SIGN UP</span>
                      <span>↗</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-editorial font-bold text-[11px] sm:text-xs tracking-wider uppercase text-[#556041]">
                      ALREADY HAVE AN ACCOUNT?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login')
                        setErr('')
                        setSuccess('')
                      }}
                      className="font-editorial font-black text-[11px] sm:text-xs tracking-wider uppercase text-[#2B3521] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>LOG IN</span>
                      <span>↗</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM MINIMAL FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] tracking-[0.2em] uppercase text-[#A2AA8A]/60 font-sans">
        <span>VisionVerse &middot; Multimodal Vision Intelligence</span>
        <button
          type="button"
          onClick={handleQuickDemo}
          className="hover:text-[#FAF4E8] text-[#C1BD63] font-mono tracking-wider transition-colors cursor-pointer"
        >
          Instant Demo Access ↗
        </button>
      </footer>
    </div>
  )
}
