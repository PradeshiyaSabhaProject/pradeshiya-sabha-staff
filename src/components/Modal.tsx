import React from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-gray-300 rounded shadow-lg p-6 text-gray-900">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-base font-bold uppercase tracking-wide text-gray-800">{title || 'Modal'}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100 font-bold"
          >
            ✕
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  )
}
export default Modal
