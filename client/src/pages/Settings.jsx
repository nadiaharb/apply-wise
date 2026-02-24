import { useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import TwoFactorSettings from '../components/TwoFactorSettings'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const handleSaveName = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile', { name })
      setUser(prev => ({ ...prev, name: res.data.user.name }))
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Profile</h2>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Plan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Current Plan</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {user?.plan === 'pro'
                  ? 'You have full access to all features'
                  : 'Limited to 10 jobs and 3 AI analyses'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${user?.plan === 'pro'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'}`}>
              {user?.plan === 'pro' ? '⭐ Pro' : 'Free'}
            </span>
          </div>
          {user?.plan === 'free' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700 font-medium">Upgrade to Pro — coming soon</p>
              <p className="text-xs text-blue-500 mt-0.5">
                Unlimited jobs, AI analyses, cover letters and more
              </p>
            </div>
          )}
        </div>

        {/* 2FA */}
        <TwoFactorSettings />
      </div>
    </AppLayout>
  )
}

export default Settings