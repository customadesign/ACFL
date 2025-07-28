'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star, Calendar, Video, MapPin, MessageCircle, Trash2 } from "lucide-react"

interface SavedCoach {
  id: string
  name: string
  specialties: string[]
  modalities: string[]
  location: string[]
  matchScore: number
  languages: string[]
  bio: string
  sessionRate: string
  virtualAvailable: boolean
  inPersonAvailable: boolean
  savedDate: string
  experience: string
  rating: number
}

// Mock saved coaches data
const mockSavedCoaches: SavedCoach[] = [
  {
    id: '1',
    name: "Richard Peng",
    specialties: ["Anxiety", "Depression"],
    modalities: ["ACT", "Mindfulness-Based Coaching"],
    location: ["CA", "NY"],
    matchScore: 95,
    languages: ["English", "Mandarin"],
    bio: "I'm a compassionate ACT coach specializing in anxiety and depression management. I help clients develop psychological flexibility through mindfulness, acceptance, and values-based action.",
    sessionRate: "$150-200/session",
    virtualAvailable: true,
    inPersonAvailable: true,
    savedDate: "2024-01-10",
    experience: "8 years",
    rating: 4.9
  },
  {
    id: '2',
    name: "Alice Zhang",
    specialties: ["Depression", "Mindfulness"],
    modalities: ["ACT", "Mindfulness-Based Stress Reduction"],
    location: ["CA"],
    matchScore: 87,
    languages: ["English", "Mandarin"],
    bio: "I believe in empowering clients through mindfulness and acceptance practices. My approach combines traditional ACT principles with MBSR techniques to help clients find peace and purpose.",
    sessionRate: "$175-225/session",
    virtualAvailable: true,
    inPersonAvailable: false,
    savedDate: "2024-01-08",
    experience: "6 years",
    rating: 4.8
  },
  {
    id: '3',
    name: "Maria Rodriguez",
    specialties: ["Trauma Recovery", "Life Transitions"],
    modalities: ["ACT", "Trauma-Informed ACT"],
    location: ["NY", "FL"],
    matchScore: 82,
    languages: ["English", "Spanish"],
    bio: "I'm a trauma-informed ACT coach specializing in helping clients heal from past experiences and navigate major life transitions with confidence and purpose.",
    sessionRate: "$160-210/session",
    virtualAvailable: true,
    inPersonAvailable: true,
    savedDate: "2024-01-05",
    experience: "12 years",
    rating: 4.9
  }
]

export default function SavedCoachesPage() {
  const [savedCoaches, setSavedCoaches] = useState<SavedCoach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading saved coaches from localStorage or API
    const loadSavedCoaches = () => {
      try {
        const saved = localStorage.getItem('savedCoaches')
        if (saved) {
          setSavedCoaches(JSON.parse(saved))
        } else {
          // Use mock data for demonstration
          setSavedCoaches(mockSavedCoaches)
          localStorage.setItem('savedCoaches', JSON.stringify(mockSavedCoaches))
        }
      } catch (error) {
        console.error('Error loading saved coaches:', error)
        setSavedCoaches(mockSavedCoaches)
      } finally {
        setLoading(false)
      }
    }

    loadSavedCoaches()
  }, [])

  const handleRemoveCoach = (coachId: string) => {
    const updatedCoaches = savedCoaches.filter(coach => coach.id !== coachId)
    setSavedCoaches(updatedCoaches)
    localStorage.setItem('savedCoaches', JSON.stringify(updatedCoaches))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading saved coaches...</div>
      </div>
    )
  }

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
            <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm whitespace-nowrap">
              Saved Coaches
            </button>
            <Link href="/appointments">
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap">
                Appointments
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Saved Coaches</h2>
          <p className="text-lg text-gray-600">
            Coaches you've saved for easy access and comparison
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Total Saved</p>
                <p className="text-2xl font-bold text-blue-900">{savedCoaches.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Avg Match Score</p>
                <p className="text-2xl font-bold text-green-900">
                  {savedCoaches.length > 0 
                    ? Math.round(savedCoaches.reduce((sum, coach) => sum + coach.matchScore, 0) / savedCoaches.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-800">Virtual Available</p>
                <p className="text-2xl font-bold text-purple-900">
                  {savedCoaches.filter(coach => coach.virtualAvailable).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Saved Coaches List */}
        {savedCoaches.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Coaches Yet</h3>
            <p className="text-gray-600 mb-6">
              Start saving coaches you're interested in to easily compare and contact them later.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Find Coaches
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {savedCoaches.map((coach) => (
              <Card key={coach.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link href={`/coach/${coach.id}`}>
                        <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                          {coach.name}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{coach.rating}</span>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {coach.matchScore}% Match
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      Saved on {formatDate(coach.savedDate)} • {coach.experience} experience
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                        <p className="text-sm text-gray-600">{coach.specialties.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Modalities:</p>
                        <p className="text-sm text-gray-600">{coach.modalities.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Location:</p>
                        <p className="text-sm text-gray-600">{coach.location.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Languages:</p>
                        <p className="text-sm text-gray-600">{coach.languages.join(', ')}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{coach.bio}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="font-medium">{coach.sessionRate}</span>
                      </div>
                      {coach.virtualAvailable && (
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          <span>Virtual</span>
                        </div>
                      )}
                      {coach.inPersonAvailable && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>In-Person</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/coach/${coach.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          View Full Profile
                        </Button>
                      </Link>
                      <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Session
                      </Button>
                      <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveCoach(coach.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {savedCoaches.length > 0 && (
          <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                <Calendar className="w-4 h-4 mr-2" />
                Compare Coaches
              </Button>
              <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Multiple
              </Button>
              <Link href="/">
                <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50 w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Find More Coaches
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 