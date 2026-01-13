'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseAutoSaveOptions {
  key: string
  data: unknown
  delay?: number
  enabled?: boolean
}

/**
 * Hook for auto-saving form data to localStorage
 */
export function useAutoSave({ key, data, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>('')

  // Save to localStorage
  const save = useCallback(() => {
    if (!enabled) return
    
    const serialized = JSON.stringify(data)
    if (serialized !== lastSavedRef.current) {
      localStorage.setItem(`draft_${key}`, serialized)
      localStorage.setItem(`draft_${key}_timestamp`, Date.now().toString())
      lastSavedRef.current = serialized
    }
  }, [key, data, enabled])

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(save, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, save, enabled])

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(`draft_${key}`)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
    return null
  }, [key])

  // Get draft timestamp
  const getDraftTimestamp = useCallback(() => {
    const timestamp = localStorage.getItem(`draft_${key}_timestamp`)
    return timestamp ? new Date(parseInt(timestamp)) : null
  }, [key])

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft_${key}`)
    localStorage.removeItem(`draft_${key}_timestamp`)
    lastSavedRef.current = ''
  }, [key])

  // Check if draft exists
  const hasDraft = useCallback(() => {
    return localStorage.getItem(`draft_${key}`) !== null
  }, [key])

  return {
    save,
    loadDraft,
    clearDraft,
    hasDraft,
    getDraftTimestamp,
  }
}
