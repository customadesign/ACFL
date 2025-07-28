'use client';

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';

function getMatchStyles(matchScore: number, isBestMatch?: boolean) {
  return isBestMatch 
    ? "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200"
    : "hidden";
}

export interface ProviderCardProps {
  id?: string;
  name: string;
  matchScore: number;
  specialties: string[];
  modalities: string[];
  location: string[];
  demographics: {
    gender: string;
    ethnicity: string;
    religion: string;
  };
  languages: string[];
  bio: string;
  sexualOrientation: string;
  isBestMatch?: boolean;
  availableTimes: string[];
}

export const ProviderCard = ({
  id,
  name,
  matchScore,
  specialties,
  modalities,
  location,
  demographics,
  languages,
  bio,
  sexualOrientation,
  isBestMatch,
  availableTimes
}: ProviderCardProps) => {
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const safeSpecialties = specialties || [];
  const initialSpecialties = safeSpecialties.slice(0, 4);
  const remainingSpecialties = safeSpecialties.slice(4);

  // Check if coach is saved on component mount
  useEffect(() => {
    const checkIfSaved = () => {
      try {
        const savedCoaches = localStorage.getItem('savedCoaches')
        if (savedCoaches) {
          const coaches = JSON.parse(savedCoaches)
          const coachId = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          setIsSaved(coaches.some((coach: any) => coach.id === coachId))
        }
      } catch (error) {
        console.error('Error checking saved coaches:', error)
      }
    }
    
    checkIfSaved()
  }, [id, name])

  const handleSaveToggle = () => {
    try {
      const coachId = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const savedCoaches = localStorage.getItem('savedCoaches')
      let coaches = savedCoaches ? JSON.parse(savedCoaches) : []
      
      if (isSaved) {
        // Remove from saved
        coaches = coaches.filter((coach: any) => coach.id !== coachId)
        setIsSaved(false)
      } else {
        // Add to saved
        const coachData = {
          id: coachId,
          name,
          specialties,
          modalities,
          location,
          matchScore,
          languages,
          bio,
          sessionRate: "$150-200/session", // Default rate
          virtualAvailable: true,
          inPersonAvailable: true,
          savedDate: new Date().toISOString().split('T')[0],
          experience: "5+ years", // Default experience
          rating: 4.8
        }
        coaches.push(coachData)
        setIsSaved(true)
      }
      
      localStorage.setItem('savedCoaches', JSON.stringify(coaches))
    } catch (error) {
      console.error('Error saving coach:', error)
    }
  }
  const hasMoreSpecialties = safeSpecialties.length > 4;

  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 transition-all duration-300 hover:transform hover:scale-[1.02] border-0",
      isBestMatch && "ring-2 ring-blue-500 ring-opacity-50 bg-gradient-to-br from-blue-50 to-white"
    )}>
      {isBestMatch && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold inline-block mb-4">
          🏆 Best Match
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link href={`/coach/${id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors">{name}</h3>
            </Link>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-xl inline-block">
              <span className="text-sm font-semibold">{matchScore}% Match</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
        </div>
        
        <div className="mt-4 space-y-2">
          <div>
            <p className="text-sm font-medium">Specialties</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(initialSpecialties || []).map((specialty) => (
                <span
                  key={specialty}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md"
                >
                  {specialty}
                </span>
              ))}
              {showAllSpecialties && (remainingSpecialties || []).map((specialty) => (
                <span
                  key={specialty}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md"
                >
                  {specialty}
                </span>
              ))}
            </div>
            {hasMoreSpecialties && (
              <button
                onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                className="flex items-center gap-1 text-sm text-blue-600 mt-1 hover:text-blue-800"
              >
                {showAllSpecialties ? (
                  <>Show less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>See {remainingSpecialties.length} more <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium">Treatment Approaches</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(modalities || []).map((modality) => (
                <span
                  key={modality}
                  className="bg-[#F4B183]/20 text-[#96551C] text-xs px-2 py-1 rounded-md border border-[#F4B183]/30"
                >
                  {modality}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Provider Background</p>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm">{demographics.gender}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ethnicity</p>
                <p className="text-sm">{demographics.ethnicity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Religion</p>
                <p className="text-sm">{demographics.religion}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Languages</p>
              <p className="text-sm">{languages.join(', ')}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Available Times</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(availableTimes || []).map((time) => (
                  <span
                    key={time}
                    className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            📍 {Array.isArray(location) ? location.join(', ') : location}
          </p>
          
          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <Link href={`/coach/${id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`} className="flex-1">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                View Full Profile
              </button>
            </Link>
            <button
              onClick={handleSaveToggle}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save coach'}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 