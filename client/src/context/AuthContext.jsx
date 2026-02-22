import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, getMe } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // on app load, check if token exists and fetch user
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
    const { token, user } = await loginUser(data)
    localStorage.setItem('token', token)
    setUser(user)
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
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}