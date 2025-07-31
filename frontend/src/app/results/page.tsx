"use client"

import { useEffect, useState } from "react"
import { ProviderCard } from "@/components/ProviderCard"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { STATE_NAMES } from "@/constants/states"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { findMatches } from "@/lib/api"
import ProtectedRoute from '@/components/ProtectedRoute'

function ResultsContent() {
  const [formData, setFormData] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [updatedFormData, setUpdatedFormData] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedData = localStorage.getItem('formData')
    const savedMatches = localStorage.getItem('matches')
    
    if (!savedData || !savedMatches) {
      setError('No form data or matches found')
      router.push('/')
      return
    }
    
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setFormData(parsedData)
      setUpdatedFormData(parsedData)
    }
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches))
    }
    setIsLoading(false)
  }, [router])

  const handleUpdateSearch = async () => {
    setIsUpdating(true)
    setError(null)
    
    try {
      const result = await findMatches(updatedFormData)
      const newMatches = result.matches || []
      setMatches(newMatches)
      setFormData(updatedFormData)
      localStorage.setItem('formData', JSON.stringify(updatedFormData))
      localStorage.setItem('matches', JSON.stringify(newMatches))
      setShowFilters(false)
    } catch (err) {
      setError('Failed to update search results')
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to categorize matches into quality ranges
  const getMatchRanges = (matches: any[]) => {
    if (matches.length === 0) return null
    
    const excellent = matches.filter(m => m.matchScore >= 90)
    const good = matches.filter(m => m.matchScore >= 75 && m.matchScore < 90)
    const fair = matches.filter(m => m.matchScore < 75)
    
    const ranges = []
    if (excellent.length > 0) ranges.push({ label: 'Excellent Match', count: excellent.length, color: 'bg-green-100 text-green-800', range: '90%+' })
    if (good.length > 0) ranges.push({ label: 'Good Match', count: good.length, color: 'bg-blue-100 text-blue-800', range: '75-89%' })
    if (fair.length > 0) ranges.push({ label: 'Fair Match', count: fair.length, color: 'bg-orange-100 text-orange-800', range: '<75%' })
    
    return ranges
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding Your Perfect Coach Matches</h2>
          <p className="text-gray-600">We're analyzing thousands of coaches to find the best matches for you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try New Search
          </button>
        </div>
      </div>
    )
  }

  if (!matches.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No coaches found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any coaches matching your current preferences. Try adjusting your search criteria for better results.</p>
          <div className="space-y-3">
            <button
              onClick={() => setShowFilters(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Modify Search Criteria
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg transition-colors"
            >
              Start New Search
            </button>
          </div>
        </div>
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
            <button
              onClick={() => router.push('/')}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              ← New Search
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm whitespace-nowrap"
            >
              Search Coaches
            </button>
            <Link href="/saved-coaches">
              <button
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap"
              >
                Saved Coaches
              </button>
            </Link>
            <Link href="/appointments">
              <button
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap"
              >
                Appointments
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header with Filter Toggle */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Coach Matches</h2>
              <p className="text-lg text-gray-600 mb-2">
                We found {matches.length} coach{matches.length !== 1 ? 'es' : ''} who match your preferences
              </p>
              {matches.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Match Quality:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getMatchRanges(matches)?.map((range, index) => (
                      <div key={index} className={`${range.color} px-3 py-1 rounded-full text-sm font-medium`}>
                        {range.count} {range.label}{range.count > 1 ? 'es' : ''} ({range.range})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Modify Search
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-4">Modify All Search Criteria</h3>
            
            {/* Core Search Options */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Select
                  value={updatedFormData?.location || ""}
                  onValueChange={(value) => setUpdatedFormData({...updatedFormData, location: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATE_NAMES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <Select
                  value={updatedFormData?.language || ""}
                  onValueChange={(value) => setUpdatedFormData({...updatedFormData, language: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Mandarin">Mandarin</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <Select
                  value={updatedFormData?.paymentMethod || ""}
                  onValueChange={(value) => setUpdatedFormData({...updatedFormData, paymentMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self-pay">Self-Pay</SelectItem>
                    <SelectItem value="aetna">Aetna</SelectItem>
                    <SelectItem value="anthem">Anthem Blue Cross Blue Shield</SelectItem>
                    <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                    <SelectItem value="cigna">Cigna</SelectItem>
                    <SelectItem value="humana">Humana</SelectItem>
                    <SelectItem value="united-healthcare">United Healthcare</SelectItem>
                    <SelectItem value="kaiser">Kaiser Permanente</SelectItem>
                    <SelectItem value="medicare">Medicare</SelectItem>
                    <SelectItem value="medicaid">Medicaid</SelectItem>
                    <SelectItem value="tricare">Tricare</SelectItem>
                    <SelectItem value="hsa-fsa">HSA/FSA</SelectItem>
                    <SelectItem value="employee-assistance">Employee Assistance Program (EAP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Your Demographics */}
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3">Your Demographics</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gender Identity</label>
                  <Select
                    value={updatedFormData?.genderIdentity || ""}
                    onValueChange={(value) => setUpdatedFormData({...updatedFormData, genderIdentity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="transgender">Transgender</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ethnic Identity</label>
                  <Select
                    value={updatedFormData?.ethnicIdentity || ""}
                    onValueChange={(value) => setUpdatedFormData({...updatedFormData, ethnicIdentity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="hispanic">Hispanic</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="native-american">Native American</SelectItem>
                      <SelectItem value="pacific-islander">Pacific Islander</SelectItem>
                      <SelectItem value="multiracial">Multiracial</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Religious Background</label>
                  <Select
                    value={updatedFormData?.religiousBackground || ""}
                    onValueChange={(value) => setUpdatedFormData({...updatedFormData, religiousBackground: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="christianity">Christianity</SelectItem>
                      <SelectItem value="judaism">Judaism</SelectItem>
                      <SelectItem value="islam">Islam</SelectItem>
                      <SelectItem value="hinduism">Hinduism</SelectItem>
                      <SelectItem value="buddhism">Buddhism</SelectItem>
                      <SelectItem value="agnosticism">Agnosticism</SelectItem>
                      <SelectItem value="atheism">Atheism</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Coach Preferences */}
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3">Coach Preferences</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Coach Gender</label>
                  <Select
                    value={updatedFormData?.therapistGender || ""}
                    onValueChange={(value) => setUpdatedFormData({...updatedFormData, therapistGender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Coach Ethnicity</label>
                  <Select
                    value={updatedFormData?.therapistEthnicity || ""}
                    onValueChange={(value) => setUpdatedFormData({...updatedFormData, therapistEthnicity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="hispanic">Hispanic</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Coach Religion</label>
                  <Select
                    value={updatedFormData?.therapistReligion || ""}
                    onValueChange={(value) => setUpdatedFormData({...updatedFormData, therapistReligion: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="christianity">Christianity</SelectItem>
                      <SelectItem value="judaism">Judaism</SelectItem>
                      <SelectItem value="islam">Islam</SelectItem>
                      <SelectItem value="hinduism">Hinduism</SelectItem>
                      <SelectItem value="buddhism">Buddhism</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Areas of Concern */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Areas of Concern</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['anxiety', 'depression', 'trauma', 'trauma-stress', 'academic-stress', 'relationships', 'racial-identity', 'work-stress', 'grief', 'addiction', 'eating-disorders', 'physical-health', 'lgbtq'].map((concern) => (
                  <div key={concern} className="flex items-center space-x-2">
                    <Checkbox
                      id={concern}
                      checked={updatedFormData?.areaOfConcern?.includes(concern) || false}
                      onCheckedChange={(checked) => {
                        const currentAreas = updatedFormData?.areaOfConcern || []
                        if (checked) {
                          setUpdatedFormData({
                            ...updatedFormData,
                            areaOfConcern: [...currentAreas, concern]
                          })
                        } else {
                          setUpdatedFormData({
                            ...updatedFormData,
                            areaOfConcern: currentAreas.filter((a: string) => a !== concern)
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor={concern}
                      className="text-sm capitalize cursor-pointer"
                    >
                      {concern.replace(/-/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Modalities */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Treatment Modalities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['cbt', 'dbt', 'emdr', 'mindfulness', 'psychodynamic', 'ift', 'act', 'art-therapy'].map((modality) => (
                  <div key={modality} className="flex items-center space-x-2">
                    <Checkbox
                      id={modality}
                      checked={updatedFormData?.treatmentModality?.includes(modality) || false}
                      onCheckedChange={(checked) => {
                        const currentModalities = updatedFormData?.treatmentModality || []
                        if (checked) {
                          setUpdatedFormData({
                            ...updatedFormData,
                            treatmentModality: [...currentModalities, modality]
                          })
                        } else {
                          setUpdatedFormData({
                            ...updatedFormData,
                            treatmentModality: currentModalities.filter((m: string) => m !== modality)
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor={modality}
                      className="text-sm uppercase cursor-pointer"
                    >
                      {modality.replace(/-/g, ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Availability Preferences</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['weekday-mornings', 'weekday-afternoons', 'weekday-evenings', 'weekends'].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={updatedFormData?.availability?.includes(time) || false}
                      onCheckedChange={(checked) => {
                        const currentTimes = updatedFormData?.availability || []
                        if (checked) {
                          setUpdatedFormData({
                            ...updatedFormData,
                            availability: [...currentTimes, time]
                          })
                        } else {
                          setUpdatedFormData({
                            ...updatedFormData,
                            availability: currentTimes.filter((t: string) => t !== time)
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor={time}
                      className="text-sm capitalize cursor-pointer"
                    >
                      {time.replace('-', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setUpdatedFormData(formData)
                  setShowFilters(false)
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSearch}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? 'Updating...' : 'Update Search'}
              </Button>
            </div>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Your Search Preferences</h2>
              
              {/* Match Summary */}
              <div className="mb-6 p-5 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-100">
                <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  Top Matches
                </h3>
                <div className="space-y-3">
                  {matches.slice(0, 3).map((match, index) => (
                    <div key={match.id || index} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate">{match.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        match.matchScore >= 90 ? 'bg-green-100 text-green-700' : 
                        match.matchScore >= 80 ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {match.matchScore}%
                      </span>
                    </div>
                  ))}
                  {matches.length > 3 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      and {matches.length - 3} more great matches below
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-5">
                {formData?.areaOfConcern && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Areas of Concern
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.areaOfConcern.map((concern: string) => (
                        <span 
                          key={concern} 
                          className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium capitalize"
                        >
                          {concern.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData?.treatmentModality && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Treatment Preferences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.treatmentModality.map((modality: string) => (
                        <span key={modality} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium uppercase">
                          {modality.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData?.availability && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Availability
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.availability.map((time: string) => (
                        <span 
                          key={time} 
                          className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium capitalize"
                        >
                          {time.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(formData?.location || formData?.paymentMethod) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      Logistics
                    </h3>
                    <div className="space-y-2">
                      {formData?.location && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-20">Location:</span>
                          <span className="text-sm text-gray-800">{STATE_NAMES[formData.location] || formData.location}</span>
                        </div>
                      )}
                      {formData?.paymentMethod && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-20">Payment:</span>
                          <span className="text-sm text-gray-800 capitalize">{formData.paymentMethod.replace(/-/g, ' ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(formData?.genderIdentity || formData?.language || formData?.ethnicIdentity || formData?.religiousBackground) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                      Your Demographics
                    </h3>
                    <div className="space-y-2">
                      {formData?.genderIdentity && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-24">Gender:</span>
                          <span className="text-sm text-gray-800 capitalize">
                            {formData.genderIdentity}
                            {formData.genderIdentityOther && ` - ${formData.genderIdentityOther}`}
                          </span>
                        </div>
                      )}
                      {formData?.language && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-24">Language:</span>
                          <span className="text-sm text-gray-800">
                            {formData.language}
                            {formData.languageOther && ` - ${formData.languageOther}`}
                          </span>
                        </div>
                      )}
                      {formData?.ethnicIdentity && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-24">Ethnicity:</span>
                          <span className="text-sm text-gray-800 capitalize">
                            {formData.ethnicIdentity}
                            {formData.ethnicIdentityOther && ` - ${formData.ethnicIdentityOther}`}
                          </span>
                        </div>
                      )}
                      {formData?.religiousBackground && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-24">Religion:</span>
                          <span className="text-sm text-gray-800 capitalize">
                            {formData.religiousBackground}
                            {formData.religiousBackgroundOther && ` - ${formData.religiousBackgroundOther}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(formData?.therapistGender || formData?.therapistEthnicity || formData?.therapistReligion) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                      Coach Preferences
                    </h3>
                    <div className="space-y-2">
                      {formData?.therapistGender && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-24">Gender:</span>
                          <span className="text-sm text-gray-800 capitalize">
                            {formData.therapistGender}
                            {formData.therapistGenderOther && ` - ${formData.therapistGenderOther}`}
                          </span>
                        </div>
                      )}
                      {formData?.therapistEthnicity && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-24">Ethnicity:</span>
                          <span className="text-sm text-gray-800 capitalize">
                            {formData.therapistEthnicity}
                            {formData.therapistEthnicityOther && ` - ${formData.therapistEthnicityOther}`}
                          </span>
                        </div>
                      )}
                      {formData?.therapistReligion && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 w-24">Religion:</span>
                          <span className="text-sm text-gray-800 capitalize">
                            {formData.therapistReligion}
                            {formData.therapistReligionOther && ` - ${formData.therapistReligionOther}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {matches.map((provider, index) => (
                <div key={provider.id || provider.name} className="transform transition-all duration-300 hover:scale-[1.01]">
                  <ProviderCard {...provider} isBestMatch={index === 0} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Results() {
  return (
    <ProtectedRoute allowedRoles={['client']}>
      <ResultsContent />
    </ProtectedRoute>
  )
} 