// app/dashboard/page.tsx
'use client'

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

export default function DashboardPage() {
  // Stats data
  const statsCards = [
    {
      title: 'Registrations',
      value: '1',
      subtitle: 'Current Registrations',
      icon: <ClipboardList className="h-8 w-8 text-purple-600" />,
      color: 'purple'
    },
    {
      title: 'Active Trainers', 
      value: '2',
      subtitle: 'Current Trainers',
      icon: <GraduationCap className="h-8 w-8 text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Customers',
      value: '1',
      subtitle: 'Total Customers',
      icon: <Users className="h-8 w-8 text-green-600" />,
      color: 'green'
    },
    {
      title: 'Trainees',
      value: '2',
      subtitle: 'Active Trainees',
      icon: <Users className="h-8 w-8 text-orange-600" />,
      color: 'orange'
    },
    {
      title: 'Revenue',
      value: '8 KD',
      subtitle: 'Total Revenue',
      icon: <DollarSign className="h-8 w-8 text-emerald-600" />,
      color: 'emerald'
    }
  ]
  
  // Recent registrations data
  const recentRegistrations = [
    {
      id: 'TR-2025-00001',
      company: 'FISS',
      course: 'Dozer Driver',
      type: 'Alay',
      trainees: 2,
      amount: '8 KD',
      date: 'May 11, 2025',
      status: 'Completed'
    }
  ]
  
  // Registration status data
  const registrationStatus = [
    { status: 'Pending', count: 25, percentage: 25, color: 'bg-yellow-400' },
    { status: 'Confirmed', count: 45, percentage: 45, color: 'bg-blue-400' },
    { status: 'Completed', count: 80, percentage: 80, color: 'bg-green-400' },
    { status: 'Cancelled', count: 10, percentage: 10, color: 'bg-red-400' }
  ]
  
  // Upcoming events
  const upcomingEvents = [
    {
      date: '15',
      month: 'May',
      title: 'Safety Training Workshop',
      company: 'ABC Corporation',
      trainees: 12
    }
  ]
  
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
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your training management system</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  {stat.icon}
                </div>
                <span className="text-sm text-gray-500">{stat.title}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Registrations */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Registrations</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Registration #</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Trainees</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((registration) => (
                  <tr key={registration.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{registration.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{registration.company}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{registration.course}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{registration.type}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{registration.trainees}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{registration.amount}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{registration.date}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {registration.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4 text-gray-600" />
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
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Registration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registrationStatus.map((status, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600">{status.status}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">{status.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Events */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{event.date}</div>
                    <div className="text-xs text-blue-600">{event.month}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.company}</p>
                    <p className="text-xs text-gray-400 mt-1">{event.trainees} trainees</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
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