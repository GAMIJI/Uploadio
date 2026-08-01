import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = memo(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  disabled,
  loading,
  className = '',
  fullWidth = false,
  'aria-label': ariaLabel
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[52px]',
    xl: 'px-8 py-4 text-lg min-h-[60px]'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {Icon && !loading && <Icon className="w-4 h-4" aria-hidden="true" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';