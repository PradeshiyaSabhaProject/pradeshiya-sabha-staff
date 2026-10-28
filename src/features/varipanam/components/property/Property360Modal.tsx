import React, { useEffect, useRef } from 'react'
import Property360Page from '../../pages/Property360Page'

interface Property360ModalProps {
  propertyId: string | null
  isOpen: boolean
  onClose: () => void
}

export const Property360Modal: React.FC<Property360ModalProps> = ({
  propertyId,
  isOpen,
  onClose,
}) => {
  const backdropRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !propertyId) return null

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) {
          onClose()
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-gray-50 rounded border border-gray-300 shadow-xl overflow-y-auto flex flex-col p-4 sm:p-6 my-auto">
        <Property360Page propertyId={propertyId} isModal onClose={onClose} />
      </div>
    </div>
  )
}

export default Property360Modal
