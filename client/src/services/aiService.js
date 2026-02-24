import api from './api'

export const matchResume = async (jobId, resumeText) => {
  const res = await api.post('/ai/match', { jobId, resumeText })
  return res.data
}

export const generateCoverLetter = async (jobId, resumeText, tone) => {
  const res = await api.post('/ai/cover-letter', { jobId, resumeText, tone })
  return res.data
}

export const analyzeSkillGaps = async (jobId, resumeText) => {
  const res = await api.post('/ai/skill-gaps', { jobId, resumeText })
  return res.data
}

export const getCoverLetters = async () => {
  const res = await api.get('/cover-letters')
  return res.data
}

export const deleteCoverLetter = async (id) => {
  const res = await api.delete(`/cover-letters/${id}`)
  return res.data
}