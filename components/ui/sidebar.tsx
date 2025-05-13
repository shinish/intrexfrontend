'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  Award,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  GraduationCap,
  Plus,
  HelpCircle,
  Home,
  UserCheck,
  UserPlus,
  FileText,
  FileSignature
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
  subItems?: Array<{
    icon?: React.ReactNode;
    href: string;
    label: string;
  }>;
}

const NavItem = ({ icon, href, label, active, subItems }: NavItemProps) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  // Check if any subitems are active
  const isSubItemActive = subItems?.some(item => pathname === item.href || pathname.startsWith(item.href))
  const isActiveWithSubs = active || isSubItemActive
  
  // Auto-expand if a subitem is active
  useEffect(() => {
    if (isSubItemActive) {
      setIsOpen(true)
    }
  }, [isSubItemActive])
  
  // When sidebar item has subitems
  if (subItems) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
              isActiveWithSubs 
                ? "bg-[#131313] text-[#ffe000]" 
                : "text-[#c8dced] hover:bg-[#131313] hover:text-[#f1e493]"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 h-5">{icon}</span>
              <span>{label}</span>
            </div>
            {isOpen ? 
              <ChevronDown className="h-4 w-4" /> :
              <ChevronRight className="h-4 w-4" />
            }
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-8 pt-1 space-y-1">
          {subItems.map((item, idx) => (
            <Link 
              key={idx}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                pathname === item.href 
                  ? "bg-[#131313] text-[#ffe000]" 
                  : "text-[#c8dced] hover:bg-[#131313] hover:text-[#f1e493]"
              )}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }
  
  // Regular sidebar item
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        active 
          ? "bg-[#131313] text-[#ffe000]" 
          : "text-[#c8dced] hover:bg-[#131313] hover:text-[#f1e493]"
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
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
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('remember_user')
    router.push('/auth/login')
  }
  
  // Navigation items with updated structure for "View All" links
  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard',
      label: 'Dashboard',
      match: /^\/dashboard$/,
    },
    {
      icon: <Users className="h-5 w-5" />,
      href: '/dashboard/customers',
      label: 'Customers',
      match: /^\/dashboard\/customers/,
      subItems: [
        {
          icon: <Users className="h-4 w-4" />,
          href: '/dashboard/customers',
          label: 'View All'
        },
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/customers/add',
          label: 'Add Customer'
        }
      ]
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      href: '/dashboard/registrations',
      label: 'Registrations',
      match: /^\/dashboard\/registrations/,
      subItems: [
        {
          icon: <FileText className="h-4 w-4" />,
          href: '/dashboard/registrations',
          label: 'View All'
        },
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/registrations/add',
          label: 'New Registration'
        }
      ]
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      href: '/dashboard/courses',
      label: 'Courses',
      match: /^\/dashboard\/courses/,
      subItems: [
        {
          icon: <BookOpen className="h-4 w-4" />,
          href: '/dashboard/courses',
          label: 'View All'
        },
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/courses/add',
          label: 'Add Course'
        }
      ]
    },
    {
      icon: <UserCheck className="h-5 w-5" />,
      href: '/dashboard/trainers',
      label: 'Trainers',
      match: /^\/dashboard\/trainers/,
      subItems: [
        {
          icon: <UserCheck className="h-4 w-4" />,
          href: '/dashboard/trainers',
          label: 'View All'
        },
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/trainers/add',
          label: 'Add Trainer'
        },
        {
          icon: <FileSignature className="h-4 w-4" />,
          href: '/dashboard/trainers/signatures',
          label: 'Manage Signatures'
        }
      ]
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      href: '/dashboard/trainees',
      label: 'Trainees',
      match: /^\/dashboard\/trainees/,
      subItems: [
        {
          icon: <UserPlus className="h-4 w-4" />,
          href: '/dashboard/trainees',
          label: 'View All'
        },
        {
          icon: <Plus className="h-4 w-4" />,
          href: '/dashboard/trainees/add',
          label: 'Add Trainee'
        },
        {
          icon: <FileText className="h-4 w-4" />,
          href: '/dashboard/trainees/bulk-upload',
          label: 'Bulk Upload'
        }
      ]
    },
    {
      icon: <Award className="h-5 w-5" />,
      href: '/dashboard/certificates',
      label: 'Certificates',
      match: /^\/dashboard\/certificates/,
      subItems: [
        {
          icon: <Award className="h-4 w-4" />,
          href: '/dashboard/certificates',
          label: 'View All'
        },
        {
          icon: <Settings className="h-4 w-4" />,
          href: '/dashboard/certificates/verify',
          label: 'Verify Certificate'
        }
      ]
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
    <div className="w-64 h-screen bg-[#101828] border-r border-[#131313] flex flex-col font-['Ubuntu']">
      {/* Logo Section with Help Icon */}
      <div className="flex items-center justify-between p-4 border-b border-[#131313]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ffe000] rounded-md flex items-center justify-center">
            <Home className="h-5 w-5 text-[#101828]" />
          </div>
          <span className="text-lg font-semibold text-[#f1e493]">CertiTrack</span>
        </div>
        <Button variant="ghost" size="icon" className="text-[#c8dced] hover:text-[#ffe000] hover:bg-[#131313]">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
      </div>
      
      {/* User Section */}
      <div className="border-t border-[#131313] p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2 py-2 hover:bg-[#131313]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#363638] rounded-full flex items-center justify-center">
                  {userData ? (
                    <span className="text-sm font-semibold text-[#f1e493]">
                      {getUserInitials()}
                    </span>
                  ) : (
                    <User className="h-4 w-4 text-[#c8dced]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#f1e493] truncate">
                    {isLoading ? 'Loading...' : userData?.full_name || userData?.username || 'User'}
                  </div>
                  <div className="text-xs text-[#c8dced] truncate">
                    {userData?.email}
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#131313] border-[#363638]">
            <DropdownMenuItem className="text-[#c8dced] focus:bg-[#363638] focus:text-[#f1e493]">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#c8dced] focus:bg-[#363638] focus:text-[#f1e493]">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#363638]" />
            <DropdownMenuItem onClick={logout} className="text-red-400 focus:bg-[#363638] focus:text-red-300">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}