import api from './api'

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data)
  return res.data
}

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data)
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/auth/me')
  return res.data
}

export const verify2FACode = async (data) => {
  const res = await api.post('/auth/2fa/verify', data)
  return res.data
}

export const setup2FA = async () => {
  const res = await api.post('/auth/2fa/setup')
  return res.data
}

export const enable2FA = async (code) => {
  const res = await api.post('/auth/2fa/enable', { code })
  return res.data
}

export const disable2FA = async (code) => {
  const res = await api.post('/auth/2fa/disable', { code })
  return res.data
}