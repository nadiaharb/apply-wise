const AuthLayout = ({children}) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Apply Wise</h1>
          <p className="text-gray-500 mt-1">Your AI-powered career platform</p>
        </div>
        {children}
      </div>
    </div>
    )
}


export default AuthLayout