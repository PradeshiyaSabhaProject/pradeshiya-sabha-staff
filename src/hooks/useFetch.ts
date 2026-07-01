import { useState, useEffect } from 'react'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (isMounted) {
          setData(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'An error occurred')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [url])

  return { data, loading, error }
}
