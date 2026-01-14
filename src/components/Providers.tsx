'use client'

import { AuthProvider } from '@/features/auth'
import { ThemeProvider, NotificationProvider } from '@/features/common'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

