import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export default function Input({ label, error, helperText, leftIcon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-400 text-sm mb-2 font-medium">{label}</label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {leftIcon}
          </span>
        )}
        <input
          className={`w-full bg-[#1a1a1a] border ${error ? 'border-red-500/50' : 'border-white/10'} text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${leftIcon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {helperText && !error && (
        <p className="text-gray-600 text-xs mt-1.5">{helperText}</p>
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}
