import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layouts/AuthLayout'

const TwoFactorLogin = () => {
  const { verify2FA, twoFactorPending, logout } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // if user lands here directly without going through login, redirect
  useEffect(() => {
    if (!twoFactorPending) {
      logout()
    }
  }, []) 

  if (!twoFactorPending) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verify2FA(code)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800">Two-Factor Auth</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <button
          onClick={logout}
          className="w-full text-sm text-gray-400 hover:text-gray-600 mt-4 transition"
        >
          ← Back to login
        </button>
      </div>
    </AuthLayout>
  )
}

export default TwoFactorLogin