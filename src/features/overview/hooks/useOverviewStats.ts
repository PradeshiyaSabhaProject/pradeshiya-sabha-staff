import { useState, useEffect } from 'react'
import { fetchOverviewStats, type OverviewStatItem } from '../services/overviewApi'

export function useOverviewStats() {
  const [stats, setStats] = useState<OverviewStatItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    fetchOverviewStats()
      .then((data) => {
        if (isMounted) {
          setStats(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load stats')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { stats, loading, error }
}
