/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { designationsForRole } from '../config/defaultConfig'
import { tradeLicenseService, type TradeLicenseService } from '../services/tradeLicenseService'
import type { Actor, Designation, TradeLicenseDb } from '../types/tradeLicense'

export type RunResult<T> = { ok: true; value: T } | { ok: false; error: string }

interface Toast {
  id: number
  kind: 'success' | 'error'
  message: string
}

interface TradeLicenseContextType {
  db: TradeLicenseDb | null
  isLoading: boolean
  loadError: string | null
  actor: Actor
  designations: Designation[]
  setDesignation: (d: Designation) => void
  refresh: () => Promise<void>
  /** Runs a service call as the acting officer, refreshes data and shows a toast. */
  run: <T>(fn: (svc: TradeLicenseService, actor: Actor) => Promise<T>, successMessage?: string) => Promise<RunResult<T>>
  toasts: Toast[]
  dismissToast: (id: number) => void
}

const TradeLicenseContext = createContext<TradeLicenseContextType | undefined>(undefined)
const DESIGNATION_KEY = 'trade_license_acting_designation'

function saveDesignation(userId: string | undefined, d: Designation) {
  try {
    localStorage.setItem(`${DESIGNATION_KEY}_${userId ?? 'anon'}`, d)
  } catch {
    // storage unavailable – the choice simply isn't remembered
  }
}

export const TradeLicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const designations = useMemo(() => designationsForRole(user?.role), [user?.role])
  const [db, setDb] = useState<TradeLicenseDb | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [designation, setDesignationState] = useState<Designation>(() => {
    try {
      const saved = localStorage.getItem(`${DESIGNATION_KEY}_${user?.id ?? 'anon'}`) as Designation | null
      if (saved && designationsForRole(user?.role).includes(saved)) return saved
    } catch {
      // ignore
    }
    return designationsForRole(user?.role)[0] ?? 'Counter Officer'
  })

  const effectiveDesignation = designations.includes(designation) ? designation : designations[0] ?? designation

  const setDesignation = useCallback(
    (d: Designation) => {
      if (!designations.includes(d)) return
      setDesignationState(d)
      saveDesignation(user?.id, d)
    },
    [designations, user?.id]
  )

  const actor: Actor = useMemo(
    () => ({ name: user?.name ?? 'Unknown officer', designation: effectiveDesignation }),
    [user?.name, effectiveDesignation]
  )

  const refresh = useCallback(async () => {
    try {
      const snap = await tradeLicenseService.getSnapshot()
      setDb(snap)
      setLoadError(null)
    } catch (e) {
      setLoadError((e as Error).message || 'Unable to load trade licence records.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load – state is only set from the async callback.
  useEffect(() => {
    let cancelled = false
    tradeLicenseService
      .getSnapshot()
      .then((snap) => {
        if (!cancelled) setDb(snap)
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message || 'Unable to load trade licence records.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pushToast = useCallback((kind: Toast['kind'], message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 7000 : 3500)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const run = useCallback(
    async <T,>(fn: (svc: TradeLicenseService, actor: Actor) => Promise<T>, successMessage?: string): Promise<RunResult<T>> => {
      try {
        const value = await fn(tradeLicenseService, actor)
        await refresh()
        if (successMessage) pushToast('success', successMessage)
        return { ok: true, value }
      } catch (e) {
        const message = (e as Error).message || 'Something went wrong.'
        pushToast('error', message)
        return { ok: false, error: message }
      }
    },
    [actor, refresh, pushToast]
  )

  const value = useMemo(
    () => ({ db, isLoading, loadError, actor, designations, setDesignation, refresh, run, toasts, dismissToast }),
    [db, isLoading, loadError, actor, designations, setDesignation, refresh, run, toasts, dismissToast]
  )

  return <TradeLicenseContext.Provider value={value}>{children}</TradeLicenseContext.Provider>
}

export const useTradeLicense = () => {
  const ctx = useContext(TradeLicenseContext)
  if (!ctx) throw new Error('useTradeLicense must be used within a TradeLicenseProvider')
  return ctx
}
