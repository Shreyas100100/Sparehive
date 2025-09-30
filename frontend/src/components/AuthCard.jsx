import Logo from "./Logo";


export default function AuthCard({ title, children, showLogo = true }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          {showLogo && (
            <div className="mb-6">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <Logo size="lg" variant="icon" />
              </div>
              {/* Company Name */}
              <h1 className="text-xl font-medium text-gray-700 mb-1">Sparehive</h1>
            </div>
          )}
          <h2 className="text-3xl font-light tracking-wide text-gray-800 mb-2">{title}</h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto"></div>
        </div>
        {children}
      </div>
    </div>
  );
}
