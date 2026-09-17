'use client'

import { FormEvent, useState, useRef, useEffect } from 'react'
import styles from './BirthChartForm.module.css'

interface LocationResult {
  name: string
  lat: number
  lon: number
  displayName: string
}

interface BirthChartFormProps {
  onSubmit: (data: any) => void
}

export default function BirthChartForm({ onSubmit }: BirthChartFormProps) {
  const [formData, setFormData] = useState({ name: '', gender: '', birthDate: '', birthTime: '', birthPlace: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))

    // Handle location search with debounce
    if (name === 'birthPlace') {
      clearTimeout(debounceTimer.current)
      if (value.length < 2) {
        setLocationSuggestions([])
        setShowSuggestions(false)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      debounceTimer.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search-location?city=${encodeURIComponent(value)}`)
          const result = await response.json()
          if (result.success) {
            setLocationSuggestions(result.data)
            setShowSuggestions(true)
          } else {
            setLocationSuggestions([])
          }
        } catch (err) {
          console.error('Location search error:', err)
          setLocationSuggestions([])
        } finally {
          setIsSearching(false)
        }
      }, 500) // Respect Nominatim rate limit (1 RPS)
    }
  }

  const selectLocation = (location: LocationResult) => {
    setFormData(prev => ({ ...prev, birthPlace: location.name }))
    setSelectedLocation(location)
    setShowSuggestions(false)
    setLocationSuggestions([])
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required'
    if (!formData.birthTime) newErrors.birthTime = 'Birth time is required'
    if (!formData.birthPlace.trim()) newErrors.birthPlace = 'Birth place is required'
    if (!selectedLocation) newErrors.birthPlace = 'Please select a location from suggestions'
    const selectedDate = new Date(formData.birthDate)
    if (selectedDate > new Date()) newErrors.birthDate = 'Birth date cannot be in the future'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !selectedLocation) return

    setIsLoading(true)
    try {
      // Parse birth date and time
      const [year, month, day] = formData.birthDate.split('-').map(Number)
      const [hour, minute] = formData.birthTime.split(':').map(Number)

      // Step 1: Calculate birth chart using Swiss Ephemeris API
      const chartResponse = await fetch('/api/calculate-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month,
          day,
          hour,
          minute,
          lat: selectedLocation.lat,
          lng: selectedLocation.lon
        })
      })

      if (!chartResponse.ok) throw new Error('Failed to calculate chart')

      const chartResult = await chartResponse.json()
      if (!chartResult.success) throw new Error(chartResult.error || 'Chart calculation failed')

      const chartData = chartResult.data

      // Step 2: Calculate Dasha (predictive timeline)
      let dashaData = null
      try {
        const dashaResponse = await fetch('/api/calculate-dasha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moonLongitude: chartData.planets.moon.longitude,
            birthDate: formData.birthDate,
            birthTime: formData.birthTime
          })
        })

        if (dashaResponse.ok) {
          const dashaResult = await dashaResponse.json()
          if (dashaResult.success) {
            dashaData = dashaResult.data
            console.log('✓ Dasha calculated successfully:', dashaData)
          } else {
            console.warn('⚠️ Dasha API error:', dashaResult.error)
          }
        } else {
          console.warn('⚠️ Dasha API failed with status:', dashaResponse.status)
        }
      } catch (dashaError) {
        console.error('⚠️ Dasha calculation failed:', dashaError)
      }

      // Step 3: Stream AI interpretation using Groq API
      const interpretResponse = await fetch('/api/interpret-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartData,
          name: formData.name
        })
      })

      if (!interpretResponse.ok) throw new Error('Failed to get interpretation')

      // Step 4: Stream the response text
      let interpretation = ''
      if (interpretResponse.body) {
        const reader = interpretResponse.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          interpretation += decoder.decode(value, { stream: true })
        }
      }

      // Step 5: Pass complete data to parent component
      onSubmit({
        ...formData,
        chartData,
        dashaData,
        interpretation,
        location: selectedLocation,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'An error occurred' }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className={styles.section} id="chart-form">
      <div className={styles.container}>
        <h2>Enter Your Birth Details</h2>
        <p className={styles.subtitle}>Accurate birth information creates a precise chart</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          {errors.submit && <div className={styles.error}>{errors.submit}</div>}
          <fieldset className={styles.fieldset}>
            <legend>Your Details</legend>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name *</label>
                <input type="text" id="name" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend>Birth Details</legend>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="birthDate">Birth Date *</label>
                <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                {errors.birthDate && <span className={styles.error}>{errors.birthDate}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="birthTime">Birth Time *</label>
                <input type="time" id="birthTime" name="birthTime" value={formData.birthTime} onChange={handleChange} required />
                <small>24-hour format. Accurate time improves chart accuracy.</small>
                {errors.birthTime && <span className={styles.error}>{errors.birthTime}</span>}
              </div>
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="birthPlace">Birth Place (City) *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    id="birthPlace"
                    name="birthPlace"
                    placeholder="e.g., New Delhi, India"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className={styles.suggestions}>
                      {locationSuggestions.map((loc, idx) => (
                        <div
                          key={idx}
                          className={styles.suggestion}
                          onClick={() => selectLocation(loc)}
                        >
                          <div className={styles.suggestionName}>{loc.name}</div>
                          <div className={styles.suggestionDetail}>{loc.displayName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {isSearching && <div className={styles.spinner}></div>}
              </div>
              {errors.birthPlace && <span className={styles.error}>{errors.birthPlace}</span>}
            </div>
          </fieldset>
          <button type="submit" className={`btn-primary btn-lg ${styles.submit}`} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {isLoading && <div className={styles.buttonSpinner}></div>}
            {isLoading ? 'Generating Chart & Interpretation...' : 'Generate My Birth Chart'}
          </button>
          <p className={styles.note}>Your data is processed securely via our API and not permanently stored.</p>
        </form>
      </div>
    </section>
  )
}
