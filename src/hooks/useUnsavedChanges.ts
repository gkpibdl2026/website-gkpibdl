'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  hasChanges: boolean
  message?: string
}

/**
 * Hook for warning users about unsaved changes before leaving the page
 */
export function useUnsavedChanges({ 
  hasChanges, 
  message = 'Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?' 
}: UseUnsavedChangesOptions) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges, message])

  // Confirm navigation
  const confirmNavigation = useCallback(() => {
    setShowConfirmDialog(false)
    if (pendingUrl) {
      setIsNavigating(true)
      router.push(pendingUrl)
    }
  }, [pendingUrl, router])

  // Cancel navigation
  const cancelNavigation = useCallback(() => {
    setShowConfirmDialog(false)
    setPendingUrl(null)
  }, [])

  // Safe navigate function
  const safeNavigate = useCallback((url: string) => {
    if (hasChanges && !isNavigating) {
      setPendingUrl(url)
      setShowConfirmDialog(true)
    } else {
      router.push(url)
    }
  }, [hasChanges, isNavigating, router])

  return {
    showConfirmDialog,
    confirmNavigation,
    cancelNavigation,
    safeNavigate,
    message,
  }
}
