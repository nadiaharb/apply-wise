import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { setup2FA, enable2FA, disable2FA } from '../services/authService'

const TwoFactorSettings = () => {
  const { user, setUser } = useAuth()
  const [step, setStep] = useState('idle') // idle | setup | confirm | disable
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await setup2FA()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setStep('confirm')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await enable2FA(code)
      setUser((prev) => ({ ...prev, twoFactorEnabled: true }))
      setStep('idle')
      setCode('')
      setSuccess('2FA enabled successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await disable2FA(code)
      setUser((prev) => ({ ...prev, twoFactorEnabled: false }))
      setStep('idle')
      setCode('')
      setSuccess('2FA disabled.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Add an extra layer of security to your account
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          user?.twoFactorEnabled
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {user?.twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
        </span>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* idle state */}
      {step === 'idle' && (
        <>
          {!user?.twoFactorEnabled ? (
            <button
              onClick={handleSetup}
              disabled={loading}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          ) : (
            <button
              onClick={() => setStep('disable')}
              className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg hover:bg-red-100 transition"
            >
              Disable 2FA
            </button>
          )}
        </>
      )}

      {/* QR code setup step */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>:
          </p>
          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Or enter this code manually:</p>
            <code className="text-sm font-mono text-gray-800 break-all">{secret}</code>
          </div>
          <form onSubmit={handleEnable} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </form>
          <button
            onClick={() => { setStep('idle'); setCode('') }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* disable step */}
      {step === 'disable' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Enter your current authenticator code to disable 2FA:
          </p>
          <form onSubmit={handleDisable} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Disabling...' : 'Disable'}
            </button>
          </form>
          <button
            onClick={() => { setStep('idle'); setCode('') }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default TwoFactorSettings