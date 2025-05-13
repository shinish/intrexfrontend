// components/ui/sidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Palette,
  Target,
  Wallet,
  Layers,
  ChevronRight,
  User,
  FolderOpen
} from 'lucide-react'

interface UserData {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
}

interface NavItemProps {
  icon: React.ReactNode;
  href: string;
  label: string;
  active: boolean;
  count?: number;
  subItems?: Array<{
    href: string;
    label: string;
  }>;
}

const NavItem = ({ icon, href, label, active, count, subItems }: NavItemProps) => {
  const pathname = usePathname()
  
  if (subItems) {
    return (
      <div className="space-y-1">
        <button
          className={cn(
            "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
            active 
              ? "bg-blue-50 text-blue-700" 
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <div className="flex items-center gap-3">
            <span className={cn("w-5 h-5", active ? "text-blue-600" : "text-gray-400")}>{icon}</span>
            <span className="font-medium">{label}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
        <div className="ml-8 space-y-1">
          {subItems.map((item, idx) => (
            <Link 
              key={idx}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-all",
                pathname === item.href 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        active 
          ? "bg-blue-50 text-blue-700" 
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <span className={cn("w-5 h-5", active ? "text-blue-600" : "text-gray-400")}>{icon}</span>
      <span className="font-medium">{label}</span>
      {count && (
        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        // Get cached user data first
        const cachedUserData = localStorage.getItem('user')
        if (cachedUserData) {
          try {
            const parsedData = JSON.parse(cachedUserData)
            setUserData(parsedData)
            setIsLoading(false)
            return
          } catch (parseError) {
            console.error('Error parsing cached user data:', parseError)
            localStorage.removeItem('user')
          }
        }
        
        // Get token from localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/auth/login')
          return
        }
        
        // Fetch user data from API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        const response = await fetch(`${apiUrl}/users/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/auth/login')
            return
          }
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        localStorage.setItem('user', JSON.stringify(data))
        setUserData(data)
      } catch (error) {
        console.error('Error fetching user data:', error)
        
        // Try to use fallback from localStorage
        const fallbackUser = localStorage.getItem('user')
        if (fallbackUser) {
          try {
            setUserData(JSON.parse(fallbackUser))
          } catch (e) {
            console.error('Error parsing fallback user data:', e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])
  
  // Navigation items
  const navItems = [
    {
      icon: <Layers className="h-5 w-5" />,
      href: '/dashboard',
      label: 'Main',
      match: /^\/dashboard$/,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      href: '/dashboard/analytics',
      label: 'Analytics',
      match: /^\/dashboard\/analytics/,
      subItems: [
        { href: '/dashboard/analytics/dashboard', label: 'Dashboard' },
        { href: '/dashboard/customers', label: 'Customers' },
        { href: '/dashboard/analytics/reports', label: 'Reports' },
      ]
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      href: '/dashboard/crypto',
      label: 'Crypto',
      match: /^\/dashboard\/crypto/,
    },
    {
      icon: <Target className="h-5 w-5" />,
      href: '/dashboard/projects',
      label: 'Projects',
      match: /^\/dashboard\/projects/,
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      href: '/dashboard/ecommerce',
      label: 'Ecommerce',
      match: /^\/dashboard\/ecommerce/,
    },
  ]
  
  // Section for APPS
  const appItems = [
    {
      icon: <Layers className="h-5 w-5" />,
      href: '/dashboard/email',
      label: 'Email',
      match: /^\/dashboard\/email/,
    },
  ]
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData) return '?'
    
    if (userData.full_name) {
      const nameParts = userData.full_name.split(' ')
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      }
      return userData.full_name[0].toUpperCase()
    }
    
    return userData.username[0].toUpperCase()
  }
  
  return (
    <div className="w-64 h-screen bg-[#182135] flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center gap-2 p-4">
        <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">U</span>
        </div>
        <span className="text-white text-lg font-semibold">Unikit</span>
      </div>
      
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
            {userData ? (
              <span className="text-sm font-semibold text-white">
                {getUserInitials()}
              </span>
            ) : (
              <User className="h-5 w-5 text-gray-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {isLoading ? 'Loading...' : userData?.full_name || userData?.username || 'User'}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {userData?.email || 'user@example.com'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700">
        <button className="flex-1 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
          Main
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-white bg-gray-700 border-b-2 border-blue-500">
          Extra
        </button>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          MAIN
        </div>
        <div className="text-xs text-gray-500 mb-4">UNIQUE DASHBOARD</div>
        
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <NavItem 
              key={index}
              icon={item.icon}
              href={item.href}
              label={item.label}
              active={item.match.test(pathname)}
              subItems={item.subItems}
            />
          ))}
        </nav>
        
        <div className="pt-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            APPS
          </div>
          <div className="text-xs text-gray-500 mb-4">MORDER APPLICATIONS</div>
          
          <nav className="space-y-1">
            {appItems.map((item, index) => (
              <NavItem 
                key={index}
                icon={item.icon}
                href={item.href}
                label={item.label}
                active={item.match.test(pathname)}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}