// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/auth-context'

export const metadata: Metadata = {
  title: 'CertiTrack',
  description: 'Intrex - Certificate Tracking System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="ubuntu-font antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}