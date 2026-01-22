'use client'

import { AuthProvider } from '@/features/auth'
import { ThemeProvider, NotificationProvider } from '@/features/common'
import { ToastProvider } from '@/components/ui/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

