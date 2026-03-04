"use client"

import { useState, useCallback, useRef } from "react"

export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null)
  const resetRef = useRef<(() => void) | null>(null)

  const onVerify = useCallback((t: string) => {
    setToken(t)
  }, [])

  const onExpire = useCallback(() => {
    setToken(null)
  }, [])

  const onError = useCallback(() => {
    setToken(null)
  }, [])

  const reset = useCallback(() => {
    setToken(null)
    resetRef.current?.()
  }, [])

  return { token, onVerify, onExpire, onError, reset, resetRef }
}
