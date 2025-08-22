'use client'
import { useState } from 'react'

export default function HomePage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // TODO: Add Firebase authentication
      console.log('Authentication:', { email, password, isSignUp })
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      // For demo - show success message
      alert(`${isSignUp ? 'Account created' : 'Signed in'} successfully!`)
    } catch (error: any) {
      setError(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      // TODO: Add Google authentication
      console.log('Google authentication')
      alert('Google authentication - Coming soon!')
    } catch (error: any) {
      setError(error.message || 'Google authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      backgroundColor: 'var(--im-bg)'
    }}>
      <div
        className="w-full max-w-md mx-4 p-8 rounded-xl"
        style={{
          backgroundColor: 'var(--im-card)',
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(var(--im-card), var(--im-card)) padding-box, linear-gradient(90deg, var(--im-accent-1), var(--im-accent-2), var(--im-accent-3)) border-box',
          boxShadow: 'var(--im-shadow-3d)'
        }}
      >
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-black"
            style={{ background: 'linear-gradient(90deg, var(--im-accent-1), var(--im-accent-2))' }}
          >
            IM
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(90deg, var(--im-accent-1), var(--im-accent-2), var(--im-accent-3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Interview Maniac
          </h1>
          <p style={{
            color: 'var(--im-text-secondary)'
          }}>
            AI-Powered Interview Coaching
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex mb-6 rounded-lg p-1" style={{
          backgroundColor: 'var(--im-bg-secondary)'
        }}>
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              !isSignUp ? 'text-black' : 'text-white hover:bg-white/10'
            }`}
            style={!isSignUp ? { background: 'linear-gradient(90deg, var(--im-accent-1), var(--im-accent-2))' } : {}}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              isSignUp ? 'text-black' : 'text-white hover:bg-white/10'
            }`}
            style={isSignUp ? { background: 'linear-gradient(90deg, var(--im-accent-1), var(--im-accent-2))' } : {}}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{
            backgroundColor: 'var(--im-error-bg)',
            color: 'var(--im-error-text)'
          }}>
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{
              color: 'var(--im-text)'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none"
              style={{
                backgroundColor: 'var(--im-bg)',
                borderColor: 'var(--im-accent-2)',
                color: 'var(--im-text)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{
              color: 'var(--im-text)'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none"
              style={{
                backgroundColor: 'var(--im-bg)',
                borderColor: 'var(--im-accent-2)',
                color: 'var(--im-text)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(90deg, var(--im-accent-1), var(--im-accent-2))',
              boxShadow: 'var(--im-shadow-3d)'
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px" style={{
            backgroundColor: 'var(--im-border)'
          }}></div>
          <span className="px-4 text-sm" style={{
            color: 'var(--im-text-secondary)'
          }}>
            Or continue with
          </span>
          <div className="flex-1 h-px" style={{
            backgroundColor: 'var(--im-border)'
          }}></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg border-2 font-medium transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          style={{
            borderColor: 'var(--im-accent-2)',
            color: 'var(--im-text)'
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Google
        </button>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{
            color: 'var(--im-text-secondary)'
          }}>
            Having trouble with Google sign-in? Try disabling browser extensions or use email/password instead.
          </p>
        </div>

        {/* Demo Features */}
        <div className="mt-8 text-center">
          <p className="text-sm mb-2" style={{
            color: 'var(--im-text-secondary)'
          }}>
            ✨ Coming Soon: Full AI-Powered Interview Coaching
          </p>
          <div className="text-xs space-y-1" style={{
            color: 'var(--im-text-secondary)'
          }}>
            🤖 Gemini AI Story Generation<br/>
            🎤 Voice Recording & Analysis<br/>
            📊 Real-time Feedback & Scoring<br/>
            🏆 Gamified Learning Experience
          </div>
        </div>
      </div>
    </div>
  )
}
