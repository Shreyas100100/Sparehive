import { forwardRef } from 'react';

// Base Card component with accessibility and design consistency
const Card = forwardRef(({ 
  children, 
  className = '', 
  variant = 'default',
  interactive = false,
  padding = 'default',
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-white border border-gray-100 shadow-sm',
    elevated: 'bg-white border border-gray-100 shadow-md',
    outlined: 'bg-white border-2 border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = `
    rounded-xl
    transition-all duration-200
    ${variants[variant]}
    ${paddings[padding]}
    ${interactive ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
    ${className}
  `;

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      ref={ref}
      className={baseClasses}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

// Stat Card component with improved accessibility
export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  color = 'blue', 
  trend,
  alert = false,
  icon,
  ...props 
}) => {
  const colorClasses = {
    blue: alert ? 'text-blue-700' : 'text-blue-600',
    green: alert ? 'text-green-700' : 'text-green-600',
    red: alert ? 'text-red-700' : 'text-red-600',
    yellow: alert ? 'text-yellow-700' : 'text-yellow-600',
    purple: alert ? 'text-purple-700' : 'text-purple-600'
  };

  const backgroundClasses = {
    blue: alert ? 'bg-blue-50 border-blue-200' : '',
    green: alert ? 'bg-green-50 border-green-200' : '',
    red: alert ? 'bg-red-50 border-red-200' : '',
    yellow: alert ? 'bg-yellow-50 border-yellow-200' : '',
    purple: alert ? 'bg-purple-50 border-purple-200' : ''
  };

  return (
    <Card 
      variant={alert ? 'outlined' : 'default'}
      className={alert ? backgroundClasses[color] : ''}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium mb-1 ${alert ? colorClasses[color].replace('600', '600') : 'text-gray-600'}`}>
            {title}
          </p>
          <p 
            className={`text-3xl font-bold ${alert ? colorClasses[color] : colorClasses[color]}`}
            aria-label={`${title}: ${value}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${alert ? colorClasses[color].replace('600', '600') : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {(trend || alert || icon) && (
          <div className={`p-3 rounded-full flex-shrink-0 ${
            alert ? backgroundClasses[color].replace('50', '100') : `bg-${color}-50`
          }`}>
            {icon || (
              <svg 
                className={`w-6 h-6 ${colorClasses[color]}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {alert ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                )}
              </svg>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// Action Card component with improved accessibility
export const ActionCard = ({ 
  title, 
  description, 
  action, 
  color = 'gray', 
  urgent = false, 
  icon,
  disabled = false,
  ...props 
}) => {
  const colorClasses = {
    blue: urgent ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500' : '',
    green: urgent ? 'border-green-200 bg-green-50 hover:bg-green-100 focus:ring-green-500' : '',
    red: urgent ? 'border-red-200 bg-red-50 hover:bg-red-100 focus:ring-red-500' : '',
    yellow: urgent ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500' : '',
    purple: urgent ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 focus:ring-purple-500' : '',
    gray: 'border-gray-200 bg-white hover:bg-gray-50 focus:ring-blue-500'
  };

  const textColors = {
    blue: urgent ? 'text-blue-900' : 'text-gray-900',
    green: urgent ? 'text-green-900' : 'text-gray-900',
    red: urgent ? 'text-red-900' : 'text-gray-900',
    yellow: urgent ? 'text-yellow-900' : 'text-gray-900',
    purple: urgent ? 'text-purple-900' : 'text-gray-900',
    gray: 'text-gray-900'
  };

  const iconColors = {
    blue: urgent ? 'text-blue-600' : 'text-gray-600',
    green: urgent ? 'text-green-600' : 'text-gray-600',
    red: urgent ? 'text-red-600' : 'text-gray-600',
    yellow: urgent ? 'text-yellow-600' : 'text-gray-600',
    purple: urgent ? 'text-purple-600' : 'text-gray-600',
    gray: 'text-gray-600'
  };

  return (
    <Card
      interactive
      variant="outlined"
      className={`
        w-full text-left border-2 
        ${colorClasses[color] || colorClasses.gray}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        focus:ring-2 focus:ring-offset-2
      `}
      onClick={disabled ? undefined : action}
      disabled={disabled}
      aria-describedby={urgent ? `${title.replace(/\s+/g, '-').toLowerCase()}-urgent` : undefined}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 min-w-0 flex-1">
          {icon && (
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              urgent ? `bg-${color}-100` : 'bg-gray-100'
            }`}>
              <span className={iconColors[color] || iconColors.gray}>
                {icon}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold mb-1 ${textColors[color] || textColors.gray}`}>
              {title}
            </h3>
            <p className={`text-sm ${
              urgent ? iconColors[color]?.replace('600', '700') : 'text-gray-600'
            }`}>
              {description}
            </p>
            {urgent && (
              <span 
                id={`${title.replace(/\s+/g, '-').toLowerCase()}-urgent`}
                className="sr-only"
              >
                This action requires urgent attention.
              </span>
            )}
          </div>
        </div>
        <svg 
          className={`w-5 h-5 mt-2 flex-shrink-0 ${
            urgent ? iconColors[color] : 'text-gray-400'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );
};

export default Card;