import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)

    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, or sign in if confirmation is disabled.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Spend<span>ly</span></div>
        <div className="auth-subtitle">// budget tracker, simplified</div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); setError(''); setSuccess('') }}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); setSuccess('') }}>
            Sign Up
          </button>
        </div>

        {error && <div className="msg msg-error">{error}</div>}
        {success && <div className="msg msg-success">{success}</div>}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In →' : 'Create Account →'}
        </button>
      </div>
    </div>
  )
}
