/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

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

  const toggleMobileSidebar = useCallback(() => setIsMobileOpen((prev) => !prev), [])
  const toggleDesktopSidebar = useCallback(() => setIsDesktopCollapsed((prev) => !prev), [])
  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev)
    } else {
      setIsDesktopCollapsed((prev) => !prev)
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      isMobileOpen,
      setIsMobileOpen,
      toggleMobileSidebar,
      isDesktopCollapsed,
      setIsDesktopCollapsed,
      toggleDesktopSidebar,
      toggleSidebar,
    }),
    [isMobileOpen, isDesktopCollapsed, toggleMobileSidebar, toggleDesktopSidebar, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
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
