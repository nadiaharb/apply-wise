import api from './api'

export const getStats = async () => {
  const res = await api.get('/jobs/stats')
  return res.data
}

export const getMonthlyData = async () => {
  const res = await api.get('/analytics/monthly')
  return res.data
}