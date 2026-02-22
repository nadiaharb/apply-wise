import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import TwoFactorLogin from './pages/TwoFactorLogin'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import CoverLetters from './pages/CoverLetters'
import Skills from './pages/Skills'
import Settings from './pages/Settings'
import Upgrade from './pages/Upgrade'


const queryClient = new QueryClient()

function App(){
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
           {/* public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
             <Route path="/2fa" element={<TwoFactorLogin />} />
            {/* protected routes */}
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/cover-letters" element={<ProtectedRoute><CoverLetters /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
            
             {/* default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
      </BrowserRouter>

    </QueryClientProvider>
  )
}

export default App