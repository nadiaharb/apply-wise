import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome back, {user?.name || 'there'} 👋
      </h1>
      <p className="text-gray-500 mt-1">Dashboard coming soon...</p>
    </AppLayout>
  )
}

export default Dashboard