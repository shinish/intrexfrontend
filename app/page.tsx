// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ClipboardList, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Award,
  Plus,
  Eye,
  ChevronRight,
  DollarSign,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
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

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch registrations data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await getRegistrations()
        setRegistrations(response)
      } catch (err) {
        console.error('Error fetching registrations:', err)
        setError('Failed to load registration data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Calculate stats from actual data
  const getStats = () => {
    const totalRegistrations = registrations.length
    const activeTrainers = 2 // This would come from a trainers API
    const totalCustomers = new Set(registrations.map(r => r.customer.name)).size
    const totalTrainees = registrations.reduce((sum, r) => sum + r.num_trainees, 0)
    const totalRevenue = registrations.reduce((sum, r) => sum + r.total_amount_kd, 0)
    
    return {
      totalRegistrations,
      activeTrainers,
      totalCustomers,
      totalTrainees,
      totalRevenue
    }
  }
  
  const stats = getStats()
  
  // Stats cards data
  const statsCards = [
    {
      title: 'Registrations',
      value: stats.totalRegistrations.toString(),
      subtitle: 'Current Registrations',
      icon: <ClipboardList className="h-8 w-8 text-purple-600" />,
      color: 'purple'
    },
    {
      title: 'Active Trainers', 
      value: stats.activeTrainers.toString(),
      subtitle: 'Current Trainers',
      icon: <GraduationCap className="h-8 w-8 text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      subtitle: 'Total Customers',
      icon: <Users className="h-8 w-8 text-green-600" />,
      color: 'green'
    },
    {
      title: 'Trainees',
      value: stats.totalTrainees.toString(),
      subtitle: 'Active Trainees',
      icon: <Users className="h-8 w-8 text-orange-600" />,
      color: 'orange'
    },
    {
      title: 'Revenue',
      value: `${stats.totalRevenue.toFixed(2)} KD`,
      subtitle: 'Total Revenue',
      icon: <DollarSign className="h-8 w-8 text-emerald-600" />,
      color: 'emerald'
    }
  ]
  
  // Calculate registration status from API data
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
    
    const total = registrations.length || 1 // Avoid division by zero
    
    return [
      { 
        status: 'Pending', 
        count: statusCounts.Pending, 
        percentage: (statusCounts.Pending / total) * 100, 
        color: 'bg-yellow-400' 
      },
      { 
        status: 'Confirmed', 
        count: statusCounts.Confirmed, 
        percentage: (statusCounts.Confirmed / total) * 100, 
        color: 'bg-blue-400' 
      },
      { 
        status: 'Completed', 
        count: statusCounts.Completed, 
        percentage: (statusCounts.Completed / total) * 100, 
        color: 'bg-green-400' 
      },
      { 
        status: 'Cancelled', 
        count: statusCounts.Cancelled, 
        percentage: (statusCounts.Cancelled / total) * 100, 
        color: 'bg-red-400' 
      }
    ]
  }
  
  const registrationStatus = getRegistrationStatus()
  
  // Get recent registrations
  const recentRegistrations = registrations
    .slice()
    .sort((a, b) => new Date(b.training_date).getTime() - new Date(a.training_date).getTime())
    .slice(0, 5)
  
  // Upcoming events from registrations
  const upcomingEvents = registrations
    .filter(reg => new Date(reg.training_date) > new Date() && reg.status !== 'Cancelled')
    .sort((a, b) => new Date(a.training_date).getTime() - new Date(b.training_date).getTime())
    .slice(0, 5)
  
  // Quick actions
  const quickActions = [
    {
      icon: <Plus className="h-5 w-5" />,
      label: 'New Registration',
      href: '/dashboard/registrations/add',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Add Customer',
      href: '/dashboard/customers/add',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: 'Add Trainer',
      href: '/dashboard/trainers/add',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Add Course',
      href: '/dashboard/courses/add',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ]
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your training management system</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  {stat.icon}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Registrations */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Registrations</CardTitle>
          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Registration #</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Trainees</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((registration) => (
                  <tr key={registration.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{registration.registration_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{registration.customer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{registration.training_course.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{registration.num_trainees}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{registration.total_amount_kd.toFixed(2)} KD</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(registration.training_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        registration.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        registration.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        registration.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {registration.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Registration Status and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Status */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Registration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registrationStatus.map((status, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-300">{status.status}</div>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 dark:text-gray-100 text-right">{status.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Events */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => {
                  const date = new Date(event.training_date)
                  const day = date.getDate()
                  const month = date.toLocaleDateString('en', { month: 'short' })
                  
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{day}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">{month}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{event.training_course.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.customer.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{event.num_trainees} trainees</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button className={`w-full ${action.color} text-white`}>
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}