// InputField component for clean, reusable form inputs
const InputField = ({ register, name, type = "text", placeholder, error, touched, className = "" }) => {
  const hasError = error;
  const isValid = touched && !error;
  
  const borderClass = hasError 
    ? 'border-red-300 focus:border-red-500' 
    : isValid
    ? 'border-green-300 focus:border-green-500'
    : 'border-gray-200 focus:border-green-500';

  return (
    <div className="space-y-2">
      <div className="relative">
        <input 
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 transition-colors duration-200 ${borderClass} ${className}`}
        />
        {isValid && (
          <div className="absolute right-0 top-3 text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-red-500 text-xs font-medium">{error}</p>
      )}
    </div>
  );
};

export default InputField;