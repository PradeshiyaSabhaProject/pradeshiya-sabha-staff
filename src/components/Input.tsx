import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736] transition-colors ${
          error ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-semibold">{error}</span>}
    </div>
  )
}
export default Input
