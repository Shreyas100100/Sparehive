import { useState } from 'react';

// SelectField component for clean, custom dropdown (not native HTML select)
const SelectField = ({ register, name, options, error, touched, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  
  const hasError = error;
  const isValid = touched && !error && selectedValue;
  
  const borderClass = hasError 
    ? 'border-red-300 focus:border-red-500' 
    : isValid
    ? 'border-green-300 focus:border-green-500'
    : 'border-gray-200 focus:border-green-500';

  const handleSelect = (value, label) => {
    setSelectedValue(value);
    setSelectedLabel(label);
    setIsOpen(false);
    // Trigger form validation
    const event = { target: { name, value } };
    register(name).onChange(event);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Hidden input for form registration */}
        <input
          {...register(name)}
          type="hidden"
          value={selectedValue}
        />
        
        {/* Custom dropdown trigger */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 pr-8 text-gray-700 placeholder-gray-400 focus:outline-none cursor-pointer transition-colors duration-200 ${borderClass} ${className}`}
        >
          <span className={selectedValue ? 'text-gray-700' : 'text-gray-400'}>
            {selectedLabel || placeholder || 'Select an option'}
          </span>
        </div>
        
        {/* Custom dropdown arrow */}
        <div className={`absolute top-3 pointer-events-none transition-all duration-200 ${
          isValid ? 'right-8' : 'right-2'
        }`}>
          <svg 
            className={`w-4 h-4 transition-all duration-200 ${
              hasError ? 'text-red-400' : isValid ? 'text-green-400' : 'text-gray-400'
            } ${isOpen ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Success checkmark */}
        {isValid && (
          <div className="absolute right-0 top-3 text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Custom dropdown menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value, option.label)}
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {hasError && (
        <p className="text-red-500 text-xs font-medium">{error}</p>
      )}
    </div>
  );
};

export default SelectField;