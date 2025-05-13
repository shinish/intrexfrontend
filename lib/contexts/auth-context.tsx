// lib/contexts/auth-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  is_active: boolean
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  checkAuth: () => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Only run on client side
      if (typeof window === 'undefined') {
        return false
      }
      
      const token = localStorage.getItem('token')
      
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return false
      }

      // Create axios instance with base config
      const instance = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Validate token with the server by fetching user data
      const response = await instance.get('/users/me/')

      if (response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        return true
      } else {
        // Invalid response, clear auth
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        return false
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Token is invalid or expired, clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      setUser(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('remember_user')
    }
    setUser(null)
    window.location.href = '/auth/login'
  }

  // Check auth status on mount
  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      checkAuth()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}