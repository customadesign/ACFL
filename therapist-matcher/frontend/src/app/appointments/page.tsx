'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, MapPin, Phone, MessageCircle } from "lucide-react"

interface Appointment {
  id: string
  coachName: string
  coachId: string
  date: string
  time: string
  type: 'virtual' | 'in-person'
  location?: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  sessionType: string
  notes?: string
  meetingLink?: string
  videoSDKMeetingId?: string
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    coachName: "Richard Peng",
    coachId: "1",
    date: "2024-01-15",
    time: "10:00 AM",
    type: "virtual",
    status: "confirmed",
    sessionType: "Initial Consultation",
    notes: "Anxiety management and stress reduction focus",
    meetingLink: "https://app.videosdk.live/meeting/abc-defg-hij",
    videoSDKMeetingId: "abc-defg-hij"
  },
  {
    id: "2",
    coachName: "Alice Zhang",
    coachId: "2",
    date: "2024-01-18",
    time: "2:00 PM",
    type: "virtual",
    status: "confirmed",
    sessionType: "Follow-up Session",
    notes: "Mindfulness practices and values clarification",
    meetingLink: "https://app.videosdk.live/meeting/xyz-uvw-rst",
    videoSDKMeetingId: "xyz-uvw-rst"
  },
  {
    id: "3",
    coachName: "Maria Rodriguez",
    coachId: "3",
    date: "2024-01-22",
    time: "11:30 AM",
    type: "in-person",
    location: "123 Wellness Center, Austin, TX",
    status: "confirmed",
    sessionType: "Trauma Recovery Session",
    notes: "EMDR therapy and coping strategies"
  },
  {
    id: "4",
    coachName: "David Thompson",
    coachId: "4",
    date: "2024-01-25",
    time: "4:00 PM",
    type: "virtual",
    status: "pending",
    sessionType: "Executive Coaching",
    notes: "Work-life balance and leadership skills",
    meetingLink: "https://app.videosdk.live/meeting/def-ghi-jkl",
    videoSDKMeetingId: "def-ghi-jkl"
  },
  {
    id: "5",
    coachName: "Dr. Sarah Kim",
    coachId: "6",
    date: "2024-01-29",
    time: "9:00 AM",
    type: "virtual",
    status: "confirmed",
    sessionType: "Perfectionism Workshop",
    notes: "Self-compassion techniques and mindfulness",
    meetingLink: "https://app.videosdk.live/meeting/mno-pqr-stu",
    videoSDKMeetingId: "mno-pqr-stu"
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const upcomingAppointments = mockAppointments.filter(apt => apt.status !== 'completed')
  const pastAppointments = mockAppointments.filter(apt => apt.status === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="https://storage.googleapis.com/msgsndr/12p9V9PdtvnTPGSU0BBw/media/672420528abc730356eeaad5.png" 
                alt="ACT Coaching For Life Logo" 
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">ACT Coaching For Life</h1>
            </div>
            <Link href="/">
              <button className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                ← New Search
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/">
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">
                Search Coaches
              </button>
            </Link>
            <Link href="/saved-coaches">
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">
                Saved Coaches
              </button>
            </Link>
            <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm whitespace-nowrap">
              Appointments
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Appointments</h2>
          <p className="text-lg text-gray-600">
            Manage your coaching sessions and upcoming appointments
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg max-w-md">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'past'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past ({pastAppointments.length})
          </button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {activeTab === 'upcoming' && upcomingAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {appointment.sessionType}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        {appointment.type === 'virtual' ? (
                          <Video className="w-4 h-4 mr-2" />
                        ) : (
                          <MapPin className="w-4 h-4 mr-2" />
                        )}
                        <span>
                          {appointment.type === 'virtual' 
                            ? 'Virtual Session' 
                            : appointment.location
                          }
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Coach:</span>
                        <Link href={`/coach/${appointment.coachId}`}>
                          <span className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                            {appointment.coachName}
                          </span>
                        </Link>
                      </div>
                      {appointment.notes && (
                        <div className="text-gray-600">
                          <span className="font-medium">Focus:</span>
                          <span className="ml-2">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {appointment.type === 'virtual' && appointment.meetingLink && (
                      <>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => window.open(appointment.meetingLink, '_blank')}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join VideoSDK Session
                        </Button>
                        {appointment.videoSDKMeetingId && (
                          <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            <span>ID: {appointment.videoSDKMeetingId}</span>
                          </div>
                        )}
                      </>
                    )}
                    <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Coach
                    </Button>
                    <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                      <Calendar className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                    {appointment.status === 'pending' && (
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {activeTab === 'past' && pastAppointments.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Appointments</h3>
                <p>Your completed appointments will appear here.</p>
              </div>
            </Card>
          )}

          {((activeTab === 'upcoming' && upcomingAppointments.length === 0) || 
            (activeTab === 'past' && pastAppointments.length === 0)) && 
           activeTab === 'upcoming' && (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                <p className="mb-4">You don't have any scheduled appointments yet.</p>
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Find a Coach
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* VideoSDK Features */}
        {upcomingAppointments.length > 0 && (
          <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Video className="w-5 h-5 inline mr-2" />
              Powered by VideoSDK
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Session Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ultra-low latency (150ms worldwide)</li>
                  <li>• HD video & crystal clear audio</li>
                  <li>• Screen sharing for worksheets</li>
                  <li>• Session recording available</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Privacy & Security:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• End-to-end encryption</li>
                  <li>• HIPAA compliant infrastructure</li>
                  <li>• No downloads required</li>
                  <li>• 99.99% uptime guarantee</li>
                </ul>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Secure, professional video coaching sessions with enterprise-grade reliability
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        {upcomingAppointments.length > 0 && (
          <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Session
              </Button>
              <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                <Phone className="w-4 h-4 mr-2" />
                Emergency Contact
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 