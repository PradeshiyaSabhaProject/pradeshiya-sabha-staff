/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  toggleMobileSidebar: () => void
  isDesktopCollapsed: boolean
  setIsDesktopCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void
  toggleDesktopSidebar: () => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebar_desktop_collapsed')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_desktop_collapsed', JSON.stringify(isDesktopCollapsed))
    } catch {
      // ignore localStorage errors
    }
  }, [isDesktopCollapsed])

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev)
  const toggleDesktopSidebar = () => setIsDesktopCollapsed((prev) => !prev)
  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      toggleMobileSidebar()
    } else {
      toggleDesktopSidebar()
    }
  }

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileSidebar,
        isDesktopCollapsed,
        setIsDesktopCollapsed,
        toggleDesktopSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    return {
      isMobileOpen: false,
      setIsMobileOpen: () => {},
      toggleMobileSidebar: () => {},
      isDesktopCollapsed: false,
      setIsDesktopCollapsed: () => {},
      toggleDesktopSidebar: () => {},
      toggleSidebar: () => {},
    }
  }
  return context
}
