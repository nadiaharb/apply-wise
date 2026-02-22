import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, getMe, verify2FACode } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [twoFactorPending, setTwoFactorPending] = useState(false)
  const [tempToken, setTempToken] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (data) => {
    const result = await loginUser(data)

    // 2FA required
    if (result.requires2FA) {
      setTempToken(result.tempToken)
      setTwoFactorPending(true)
      navigate('/2fa')
      return
    }

    // normal login
    localStorage.setItem('token', result.token)
    setUser(result.user)
    navigate('/dashboard')
  }

  const verify2FA = async (code) => {
    const { token, user } = await verify2FACode({ tempToken, code })
    localStorage.setItem('token', token)
    setUser(user)
    setTwoFactorPending(false)
    setTempToken(null)
    navigate('/dashboard')
  }

  const register = async (data) => {
    const { token, user } = await registerUser(data)
    localStorage.setItem('token', token)
    setUser(user)
    navigate('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setTwoFactorPending(false)
    setTempToken(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, login, register, logout,
      loading, verify2FA, twoFactorPending
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}