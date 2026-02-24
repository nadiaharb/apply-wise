import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { getStats } from '../services/analyticsService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import api from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats
  })

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly'],
    queryFn: () => api.get('/analytics/monthly').then(r => r.data)
  })

  const stats = statsData || {}
  const monthly = monthlyData?.data || []
  const statusCounts = stats.statusCounts || {}
  const recent = stats.recent || []

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (statsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's your job search overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Applications"
          value={stats.total || 0}
          icon="💼"
          color="blue"
        />
        <StatCard
          label="Interviews"
          value={statusCounts.interview || 0}
          sub={`${stats.responseRate || 0}% response rate`}
          icon="📅"
          color="yellow"
        />
        <StatCard
          label="Offers"
          value={statusCounts.offer || 0}
          sub="Keep going!"
          icon="🎉"
          color="green"
        />
        <StatCard
          label="Wishlist"
          value={statusCounts.wishlist || 0}
          sub="Jobs to apply to"
          icon="⭐"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Applications Over Time</h2>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Bar dataKey="applied"    name="Applied"    fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="interviews" name="Interviews" fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="offers"     name="Offers"     fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
              Add jobs to see your activity chart
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Pipeline Breakdown</h2>
          <div className="space-y-3">
            {[
              { key: 'wishlist',  label: 'Wishlist',  color: 'bg-gray-300' },
              { key: 'applied',   label: 'Applied',   color: 'bg-blue-400' },
              { key: 'interview', label: 'Interview', color: 'bg-yellow-400' },
              { key: 'offer',     label: 'Offer',     color: 'bg-green-400' },
              { key: 'rejected',  label: 'Rejected',  color: 'bg-red-400' },
            ].map(({ key, label, color }) => {
              const count = statusCounts[key] || 0
              const pct = stats.total > 0
                ? Math.round((count / stats.total) * 100)
                : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-400 font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {stats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Response rate</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">
                {stats.responseRate}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Recent Applications</h2>
          <Link
            to="/jobs"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map(job => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                    {job.company[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">
                      {job.company}
                    </p>
                    <p className="text-xs text-gray-400">{job.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-gray-300">
                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-300 text-sm mb-3">No applications yet</p>
            <Link
              to="/jobs"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add your first job
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default Dashboard