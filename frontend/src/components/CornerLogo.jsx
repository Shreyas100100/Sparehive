// Corner Logo component for subtle branding
const CornerLogo = () => {
  return (
    <div className="fixed top-6 left-6 z-10">
      <div className="flex items-center space-x-2">
        {/* Logo */}
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">SH</span>
          {/* Or use: <img src="/logo.svg" alt="Logo" className="w-6 h-6" /> */}
        </div>
        {/* Company Name */}
        <span className="text-gray-700 font-medium text-lg">Sparehive</span>
      </div>
    </div>
  );
};

export default CornerLogo;