import {useAuth} from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'


const navItems =[
    {label: 'Dashboard', path: '/dashboard', icon:'📊'},
    { label: 'Jobs', path: '/jobs', icon: '💼' },
  { label: 'Cover Letters', path: '/cover-letters', icon: '✉️' },
  { label: 'Skills', path: '/skills', icon: '🧠' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
]


const AppLayout =({children}) =>{
    const {user,logout} = useAuth()
    const location = useLocation()



    return (
         <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Apply Wise</h1>
          <p className="text-sm text-gray-500 mt-1 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium
              ${user?.plan === 'pro'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
              {user?.plan === 'pro' ? '⭐ Pro' : 'Free Plan'}
            </span>
          </div>
          {user?.plan === 'free' && (
            <Link
              to="/upgrade"
              className="block w-full text-center text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-2"
            >
              Upgrade to Pro
            </Link>
          )}
          <button
            onClick={logout}
            className="w-full text-sm text-gray-500 hover:text-red-500 transition text-left px-1"
          >
            → Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
    )
}


export default AppLayout