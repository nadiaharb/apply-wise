import api from './api'

export const getJobs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString()
  const res = await api.get(`/jobs?${params}`)
  return res.data
}

export const getJob = async (id) => {
  const res = await api.get(`/jobs/${id}`)
  return res.data
}

export const createJob = async (data) => {
  const res = await api.post('/jobs', data)
  return res.data
}

export const updateJob = async (id, data) => {
  const res = await api.patch(`/jobs/${id}`, data)
  return res.data
}

export const deleteJob = async (id) => {
  const res = await api.delete(`/jobs/${id}`)
  return res.data
}

export const getStats = async () => {
  const res = await api.get('/jobs/stats')
  return res.data
}