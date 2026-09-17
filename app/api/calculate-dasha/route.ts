import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/calculate-dasha
 * Calculates Vimshottari Dasha (120-year predictive cycle) based on Moon's Nakshatra
 *
 * Body: {
 *   moonLongitude: number (0-360 in sidereal coordinates),
 *   birthDate: string (YYYY-MM-DD),
 *   birthTime: string (HH:MM in 24-hour format)
 * }
 *
 * Returns: {
 *   nakshatra: string,
 *   nakshatraIndex: number (0-26),
 *   birthDasha: { planet, startDate, endDate, duration },
 *   dashaTimeline: [ { planet, startDate, endDate, duration } ]
 * }
 */

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
]

// Dasha sequence: [planet name, duration in years]
const DASHA_SEQUENCE = [
  ['Ketu', 7],
  ['Venus', 20],
  ['Sun', 6],
  ['Moon', 10],
  ['Mars', 7],
  ['Rahu', 18],
  ['Jupiter', 16],
  ['Saturn', 19],
  ['Mercury', 17]
] as const

// Nakshatra ruler (each nakshatra is ruled by one of 9 planets in sequence)
const NAKSHATRA_RULERS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
]

interface DashaInfo {
  planet: string
  startDate: string
  endDate: string
  duration: number // years
}

interface DashaResponse {
  success: boolean
  data?: {
    moonLongitude: number
    nakshatra: string
    nakshatraIndex: number
    nakshatraRuler: string
    birthDasha: DashaInfo
    dashaTimeline: DashaInfo[]
    totalCycleDays: number
  }
  error?: string
}

/**
 * Calculate which Nakshatra the Moon is in (0-26)
 * Each nakshatra spans 13° 20' (13.333...)
 */
function calculateNakshatra(moonLongitude: number): number {
  const normalized = ((moonLongitude % 360) + 360) % 360
  const nakshatraIndex = Math.floor(normalized / 13.333333)
  return Math.min(nakshatraIndex, 26)
}

/**
 * Calculate remaining balance in current Dasha at birth
 * Nakshatra spans 13°20' (13.333°). Calculate Moon's position within nakshatra
 * and determine how much of the ruler's dasha period remains
 */
function calculateBirthDashaAndTimeline(
  nakshatraIndex: number,
  moonLongitude: number,
  birthDate: Date
): { birthDasha: DashaInfo; timeline: DashaInfo[] } {
  const nakshatraRuler = NAKSHATRA_RULERS[nakshatraIndex]

  // Find the dasha ruler in the sequence
  let dashaStartIndex = 0
  for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
    if (DASHA_SEQUENCE[i][0] === nakshatraRuler) {
      dashaStartIndex = i
      break
    }
  }

  // Calculate position within nakshatra (0-360 degrees)
  const normalized = ((moonLongitude % 360) + 360) % 360
  const nakshatraStart = nakshatraIndex * 13.333333
  const positionInNakshatra = normalized - nakshatraStart
  const portionCompleted = positionInNakshatra / 13.333333 // 0 to 1

  // Get the full duration of current dasha period
  const [currentDashaPlanet, fullDashaDurationYears] = DASHA_SEQUENCE[dashaStartIndex]
  const remainingDashaDurationYears = fullDashaDurationYears * (1 - portionCompleted)

  // Calculate dasha end date based on remaining balance
  const dashEndDate = new Date(birthDate)
  dashEndDate.setFullYear(dashEndDate.getFullYear() + Math.floor(remainingDashaDurationYears))
  dashEndDate.setMonth(dashEndDate.getMonth() + Math.round((remainingDashaDurationYears % 1) * 12))

  // Build 120-year dasha timeline starting from current dasha end
  const timeline: DashaInfo[] = []
  let currentDate = new Date(dashEndDate)

  // First entry: current dasha with remaining balance
  timeline.push({
    planet: currentDashaPlanet,
    startDate: birthDate.toISOString().split('T')[0],
    endDate: dashEndDate.toISOString().split('T')[0],
    duration: Math.round(remainingDashaDurationYears * 10) / 10
  })

  // Build rest of 120-year cycle
  for (let cycle = 0; cycle < 120; cycle++) {
    for (let i = 1; i < DASHA_SEQUENCE.length; i++) {
      const dashaIndex = (dashaStartIndex + i) % DASHA_SEQUENCE.length
      const [planet, durationYears] = DASHA_SEQUENCE[dashaIndex]

      const startDate = new Date(currentDate)
      const endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() + durationYears)

      timeline.push({
        planet,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: durationYears
      })

      currentDate = new Date(endDate)

      // Stop after 120 years
      if (currentDate.getTime() - birthDate.getTime() > 120 * 365.25 * 24 * 60 * 60 * 1000) {
        break
      }
    }
    if (currentDate.getTime() - birthDate.getTime() > 120 * 365.25 * 24 * 60 * 60 * 1000) {
      break
    }
  }

  const birthDasha = timeline[0]
  return { birthDasha, timeline }
}

export async function POST(req: NextRequest): Promise<NextResponse<DashaResponse>> {
  try {
    const { moonLongitude, birthDate, birthTime } = await req.json()

    if (moonLongitude === undefined || !birthDate || !birthTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: moonLongitude, birthDate, birthTime' },
        { status: 400 }
      )
    }

    // Calculate Nakshatra from Moon's longitude
    const nakshatraIndex = calculateNakshatra(moonLongitude)
    const nakshatra = NAKSHATRAS[nakshatraIndex]
    const nakshatraRuler = NAKSHATRA_RULERS[nakshatraIndex]

    // Create birth date-time
    const [year, month, day] = birthDate.split('-').map(Number)
    const [hour, minute] = birthTime.split(':').map(Number)
    const birthDateTime = new Date(year, month - 1, day, hour, minute, 0)

    // Calculate Dasha timeline with remaining balance
    const { birthDasha, timeline } = calculateBirthDashaAndTimeline(nakshatraIndex, moonLongitude, birthDateTime)

    // Calculate remaining days in current dasha
    const dashaEndDate = new Date(birthDasha.endDate)
    const daysRemaining = Math.ceil((dashaEndDate.getTime() - birthDateTime.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      data: {
        moonLongitude,
        nakshatra,
        nakshatraIndex,
        nakshatraRuler,
        birthDasha: {
          ...birthDasha,
          duration: Math.ceil(daysRemaining / 365.25) // Remaining years in current dasha
        },
        dashaTimeline: timeline.slice(0, 20), // Return next 20 dashas for display
        totalCycleDays: 120 * 365.25
      }
    })
  } catch (error: any) {
    console.error('Dasha calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate Dasha' },
      { status: 500 }
    )
  }
}
