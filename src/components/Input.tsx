import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}
export default Input
