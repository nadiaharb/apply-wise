import AppLayout from '../layouts/AppLayout'
import TwoFactorSettings from '../components/TwoFactorSettings'

const Settings = () => (
  <AppLayout>
    <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
    <div className="mt-6 max-w-xl">
      <TwoFactorSettings />
    </div>
  </AppLayout>
)
export default Settings