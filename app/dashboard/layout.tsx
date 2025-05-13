// app/dashboard/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Sidebar } from '@/components/ui/sidebar'
import { 
  Search, 
  Settings, 
  User,
  Menu,
  Calendar,
  BarChart3,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getRegistrations } from '@/lib/api-client'

// Define types
interface Registration {
  id: number
  registration_number: string
  customer: {
    name: string
  }
  training_course: {
    title: string
  }
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  num_trainees: number
  total_amount_kd: number
  training_date: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  
  useEffect(() => {
    // Only redirect if we're definitely not authenticated and not loading
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [user, isLoading, router])
  
  // Load theme and registrations
  useEffect(() => {
    const initializeData = async () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
      if (savedTheme) {
        setTheme(savedTheme)
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      }
      setMounted(true)
      
      // Fetch registrations for upcoming events and reports
      try {
        setIsLoadingRegistrations(true)
        const response = await getRegistrations()
        setRegistrations(response)
      } catch (error) {
        console.error('Error fetching registrations:', error)
      } finally {
        setIsLoadingRegistrations(false)
      }
    }
    
    initializeData()
  }, [])
  
  // Toggle theme function
  const toggleTheme = () => {
    if (!mounted) return
    
    const newTheme = theme === 'light' ? 'dark' : 'light'
    
    // Update state
    setTheme(newTheme)
    
    // Update DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme)
  }
  
  // Get user initials for avatar - same logic as sidebar
  const getUserInitials = () => {
    if (!user) return '?'
    
    if (user.full_name) {
      const nameParts = user.full_name.split(' ')
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      }
      return user.full_name[0].toUpperCase()
    }
    
    return user.username[0].toUpperCase()
  }
  
  // Get upcoming events from registrations
  const getUpcomingEvents = () => {
    if (!registrations.length) return []
    
    return registrations
      .filter(reg => new Date(reg.training_date) > new Date() && reg.status !== 'Cancelled')
      .sort((a, b) => new Date(a.training_date).getTime() - new Date(b.training_date).getTime())
      .slice(0, 5)
  }
  
  // Get registration status for reports
  const getRegistrationStatus = () => {
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0
    }
    
    registrations.forEach(reg => {
      statusCounts[reg.status]++
    })
    
    return [
      { status: 'Pending', count: statusCounts.Pending, color: 'text-yellow-600' },
      { status: 'Confirmed', count: statusCounts.Confirmed, color: 'text-blue-600' },
      { status: 'Completed', count: statusCounts.Completed, color: 'text-green-600' },
      { status: 'Cancelled', count: statusCounts.Cancelled, color: 'text-red-600' }
    ]
  }
  
  const upcomingEvents = getUpcomingEvents()
  const registrationStatus = getRegistrationStatus()
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  // Don't render dashboard if not authenticated
  if (!user) {
    return null
  }
  
  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900 font-['Ubuntu'] transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 transition-colors">
          {/* Left Side - Menu & Search */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search Bar */}
            <div className="relative w-80 hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input 
                type="text" 
                placeholder="Type search..."
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#ffe000] focus:border-[#ffe000] text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {/* Right Side - Navigation & User */}
          <div className="flex items-center gap-2">
            {/* Reports Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <BarChart3 className="h-4 w-4" />
                  Reports
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Registration Status
                </div>
                <div className="px-4 py-2 space-y-1">
                  {registrationStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{status.status}</span>
                      <span className={`text-sm font-medium ${status.color}`}>{status.count}</span>
                    </div>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Full Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            {/* Calendar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Calendar className="h-5 w-5" />
                  {upcomingEvents.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-[#ffe000] rounded-full"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Upcoming Events
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, index) => {
                      const date = new Date(event.training_date)
                      const day = date.getDate()
                      const month = date.toLocaleDateString('en', { month: 'short' })
                      
                      return (
                        <DropdownMenuItem key={event.id} className="p-4">
                          <div className="flex items-start gap-3 w-full">
                            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 text-center min-w-[40px]">
                              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{day}</div>
                              <div className="text-xs text-blue-600 dark:text-blue-400">{month}</div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {event.training_course.title}
                              </h3>
                              {/* <p className="text-xs text-gray-500 dark:text-gray-400">{event.customer.name}</p> */}
                              <p className="text-xs text-gray-400 dark:text-gray-500">{event.num_trainees} trainees</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      )
                    })
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No upcoming events
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Full Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.is_admin ? 'Admin' : 'User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.full_name || user.username}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800">
                <div className="px-2 py-1.5 text-sm text-gray-900 dark:text-white">
                  <div className="font-medium">{user.full_name || user.username}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 focus:bg-gray-100 dark:focus:bg-gray-700">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Settings Button */}
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}