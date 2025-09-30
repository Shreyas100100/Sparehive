// Reusable Logo component
const Logo = ({ size = "lg", variant = "full", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl", 
    xl: "text-2xl"
  };

  const logoBox = (
    <div className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg ${sizeClasses[size]} ${className}`}>
      {/* Replace with your actual logo */}
      <span className={`text-white font-bold ${textSizeClasses[size]}`}>SH</span>
      {/* Or use: <img src="/logo.svg" alt="Sparehive Logo" className="w-3/4 h-3/4" /> */}
    </div>
  );

  if (variant === "icon") {
    return logoBox;
  }

  return (
    <div className="flex items-center space-x-3">
      {logoBox}
      {variant === "full" && (
        <span className="text-gray-700 font-medium text-xl">Sparehive</span>
      )}
    </div>
  );
};

export default Logo;