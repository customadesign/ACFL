"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "../components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useRouter } from "next/navigation"
import { ProviderCard } from "@/components/ProviderCard"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "../components/ui/checkbox"
import { findMatches } from "@/lib/api"
import { LANGUAGES } from "@/constants/languages"
import { STATE_NAMES } from "@/constants/states"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  concernOptions,
  modalityOptions,
  paymentOptions,
  availabilityOptions,
  genderIdentityOptions,
  ethnicIdentityOptions,
  religiousBackgroundOptions
} from "@/constants/formOptions"

const formSchema = z.object({
  areaOfConcern: z.array(z.string()).min(1, {
    message: "Please select at least one area of concern.",
  }),
  treatmentModality: z.array(z.string()).optional(),
  location: z.string({
    required_error: "Please select your location.",
  }).nonempty("Please select your location."),
  genderIdentity: z.string({
    required_error: "Please select your gender identity.",
  }).nonempty("Please select your gender identity.").min(1, {
    message: "Please select your gender identity.",
  }),
  genderIdentityOther: z.string().optional(),
  ethnicIdentity: z.string({
    required_error: "Please select your ethnic identity.",
  }).min(1, {
    message: "Please select your ethnic identity.",
  }),
  ethnicIdentityOther: z.string().optional(),
  religiousBackground: z.string({
    required_error: "Please select your religious background.",
  }).min(1, {
    message: "Please select your religious background.",
  }),
  religiousBackgroundOther: z.string().optional(),
  therapistGender: z.string({
    required_error: "Please select preferred coach gender.",
  }).min(1, {
    message: "Please select preferred coach gender.",
  }),
  therapistGenderOther: z.string().optional(),
  therapistEthnicity: z.string({
    required_error: "Please select preferred coach ethnicity.",
  }).min(1, {
    message: "Please select preferred coach ethnicity.",
  }),
  therapistEthnicityOther: z.string().optional(),
  therapistReligion: z.string({
    required_error: "Please select preferred coach religious background.",
  }).min(1, {
    message: "Please select preferred coach religious background.",
  }),
  therapistReligionOther: z.string().optional(),
  paymentMethod: z.string({
    required_error: "Please select a payment method.",
  }).min(1, {
    message: "Please select a payment method.",
  }),
  availability: z.array(z.string()).min(1, {
    message: "Please select at least one availability preference.",
  }),
  language: z.string({
    required_error: "Please select your preferred language.",
  }).min(1, {
    message: "Please select your preferred language.",
  }),
  languageOther: z.string().optional(),
})

interface FormValues extends z.infer<typeof formSchema> {}

function HomeContent() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(true)
  const [formData, setFormData] = useState<FormValues | null>(null)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      areaOfConcern: [],
      treatmentModality: [],
      location: "",
      genderIdentity: "",
      genderIdentityOther: "",
      ethnicIdentity: "",
      ethnicIdentityOther: "",
      religiousBackground: "",
      religiousBackgroundOther: "",
      therapistGender: "",
      therapistGenderOther: "",
      therapistEthnicity: "",
      therapistEthnicityOther: "",
      therapistReligion: "",
      therapistReligionOther: "",
      paymentMethod: "",
      availability: [],
      language: "",
      languageOther: "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      setSearchError(null)
      console.log('Form submitted with data:', data);
      
      const result = await findMatches(data);
      
      console.log('Got matches:', result);
      
      setMatches(result.matches || [])
      setFormData(data)
      setHasSearched(true)
      setShowForm(false)
      
      // Store for other pages
      localStorage.setItem('formData', JSON.stringify(data));
      localStorage.setItem('matches', JSON.stringify(result.matches || []));
      
    } catch (error) {
      console.error('Error fetching matches:', error);
      setSearchError('Failed to find matches. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('handleSubmit called');
    form.handleSubmit(onSubmit)(e);
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
            <div className="hidden sm:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-500">
                    Welcome, {user?.firstName || user?.email}!
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register/client"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
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
            <Link href="/messages">
              <button
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm whitespace-nowrap"
              >
                Messages
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form Header */}
        {showForm && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Find Your Ideal ACT Coach</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Complete our comprehensive assessment to connect with ACT (Acceptance and Commitment Therapy) certified coaches who match your unique needs and preferences for your personal growth journey.
              </p>
            </div>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding Your Perfect Coach Matches</h2>
              <p className="text-gray-600">We're analyzing thousands of coaches to find the best matches for you...</p>
            </div>
          </div>
        )}

        {/* Search Error */}
        {searchError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {searchError}
            <button 
              onClick={() => {setSearchError(null); setShowForm(true)}} 
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search Form */}
        {showForm && !isLoading && (
          <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-white text-lg font-semibold">Personal Assessment</h3>
            <p className="text-blue-100 text-sm">Help us understand your coaching goals and preferences</p>
          </div>
          <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Coaching Goals</h3>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="areaOfConcern"
                    render={() => (
                      <FormItem>
                        <FormLabel>Areas of Concern *</FormLabel>
                        <FormDescription>Select all that apply</FormDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {concernOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="areaOfConcern"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.id])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== option.id)
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="treatmentModality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Modalities</FormLabel>
                        <FormDescription>Select all that apply (optional)</FormDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {modalityOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="treatmentModality"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), option.id])
                                            : field.onChange(
                                                (field.value || []).filter((value) => value !== option.id)
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Background</h3>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {Object.entries(STATE_NAMES).map(([code, name]) => (
                              <SelectItem key={code} value={code}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genderIdentity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender Identity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender identity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderIdentityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.value === "other" && (
                          <FormField
                            control={form.control}
                            name="genderIdentityOther"
                            render={({ field: otherField }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <input
                                    {...otherField}
                                    placeholder="Please specify"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ethnicIdentity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethnic Identity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your ethnic identity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ethnicIdentityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {(field.value === "other" || field.value === "multiracial") && (
                          <FormField
                            control={form.control}
                            name="ethnicIdentityOther"
                            render={({ field: otherField }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <input
                                    {...otherField}
                                    placeholder={field.value === "other" ? "Please specify" : "Please list ethnicities"}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="religiousBackground"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religious Background</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your religious background" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {religiousBackgroundOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.value === "other" && (
                          <FormField
                            control={form.control}
                            name="religiousBackgroundOther"
                            render={({ field: otherField }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <input
                                    {...otherField}
                                    placeholder="Please specify"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LANGUAGES.map((language) => (
                                <SelectItem key={language} value={language}>
                                  {language}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.value === "Other" && (
                            <FormField
                              control={form.control}
                              name="languageOther"
                              render={({ field: otherField }) => (
                                <FormItem className="mt-2">
                                  <FormControl>
                                    <input
                                      {...otherField}
                                      placeholder="Please specify language"
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Coach Preferences</h3>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="therapistGender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach's Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred coach gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderIdentityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.value === "other" && (
                          <FormField
                            control={form.control}
                            name="therapistGenderOther"
                            render={({ field: otherField }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <input
                                    {...otherField}
                                    placeholder="Please specify"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="therapistEthnicity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach's Ethnicity Background</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred coach ethnicity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ethnicIdentityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {(field.value === "other" || field.value === "multiracial") && (
                          <FormField
                            control={form.control}
                            name="therapistEthnicityOther"
                            render={({ field: otherField }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <input
                                    {...otherField}
                                    placeholder={field.value === "other" ? "Please specify" : "Please list ethnicities"}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="therapistReligion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach's Religious Background</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred coach religious background" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {religiousBackgroundOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.value === "other" && (
                          <FormField
                            control={form.control}
                            name="therapistReligionOther"
                            render={({ field: otherField }) => (
                              <FormItem className="mt-2">
                                <FormControl>
                                  <input
                                    {...otherField}
                                    placeholder="Please specify"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={() => (
                      <FormItem>
                        <FormLabel>Preferred Availability *</FormLabel>
                        <FormDescription>Select all that apply</FormDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {/* First Column - Weekday options */}
                          <div className="space-y-3">
                            {availabilityOptions
                              .filter(option => !option.id.includes('weekend') && option.id !== 'flexible')
                              .map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="availability"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option.id])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== option.id)
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          {/* Second Column - Weekend and Flexible options */}
                          <div className="space-y-3">
                            {availabilityOptions
                              .filter(option => option.id.includes('weekend') || option.id === 'flexible')
                              .map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="availability"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option.id])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== option.id)
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">4</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Logistics & Payment</h3>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto px-12 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  🔍 Find My Coach Match
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
        )}

        {/* Results Section */}
        {hasSearched && !isLoading && !showForm && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Coach Matches</h2>
                <p className="text-lg text-gray-600 mb-2">
                  We found {matches.length} coach{matches.length !== 1 ? 'es' : ''} who match your preferences
                </p>
                {matches.length > 0 && (
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-gray-500">Match Quality:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const excellent = matches.filter(m => m.matchScore >= 90)
                        const good = matches.filter(m => m.matchScore >= 75 && m.matchScore < 90)
                        const fair = matches.filter(m => m.matchScore < 75)
                        const ranges = []
                        if (excellent.length > 0) ranges.push({ label: 'Excellent Match', count: excellent.length, color: 'bg-green-100 text-green-800', range: '90%+' })
                        if (good.length > 0) ranges.push({ label: 'Good Match', count: good.length, color: 'bg-blue-100 text-blue-800', range: '75-89%' })
                        if (fair.length > 0) ranges.push({ label: 'Fair Match', count: fair.length, color: 'bg-orange-100 text-orange-800', range: '<75%' })
                        return ranges.map((range, index) => (
                          <div key={index} className={`${range.color} px-3 py-1 rounded-full text-sm font-medium`}>
                            {range.count} {range.label}{range.count > 1 ? 'es' : ''} ({range.range})
                          </div>
                        ))
                      })()}
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                New Search
              </Button>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No coaches found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any coaches matching your current preferences. Try adjusting your search criteria for better results.</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Modify Search Criteria
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((provider, index) => (
                  <div key={provider.id || provider.name} className="transform transition-all duration-300 hover:scale-[1.01]">
                    <ProviderCard {...provider} isBestMatch={index === 0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ProtectedRoute allowedRoles={['client']}>
      <HomeContent />
    </ProtectedRoute>
  )
}

