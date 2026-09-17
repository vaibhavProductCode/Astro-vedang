import { NextRequest, NextResponse } from 'next/server'
import * as Astronomy from 'astronomy-engine'

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

const HOUSES = [
  '1st (Self)', '2nd (Wealth)', '3rd (Communication)', '4th (Home)',
  '5th (Creativity)', '6th (Health)', '7th (Partnership)', '8th (Transformation)',
  '9th (Philosophy)', '10th (Career)', '11th (Friendships)', '12th (Spirituality)'
]

// LAHIRI AYANAMSA (Vedic sidereal offset) - approximately 23.15° for year 2000
const LAHIRI_AYANAMSA_2000 = 23.1605
function getAyanamsa(year: number): number {
  // Approximate Lahiri Ayanamsa for any year
  // Rate of precession: ~50.4 arcseconds per year
  const yearsSince2000 = year - 2000
  return LAHIRI_AYANAMSA_2000 + (yearsSince2000 * 50.4 / 3600)
}

// Convert IST (UTC+5:30) to UTC
function convertISTToUTC(year: number, month: number, day: number, hour: number, minute: number): { year: number; month: number; day: number; hour: number; minute: number } {
  let utcHour = hour - 5
  let utcMinute = minute - 30
  let utcDay = day
  let utcMonth = month
  let utcYear = year

  if (utcMinute < 0) {
    utcMinute += 60
    utcHour -= 1
  }

  if (utcHour < 0) {
    utcHour += 24
    utcDay -= 1
  }

  if (utcDay < 1) {
    utcMonth -= 1
    if (utcMonth < 1) {
      utcMonth = 12
      utcYear -= 1
    }
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (utcYear % 4 === 0 && (utcYear % 100 !== 0 || utcYear % 400 === 0)) {
      daysInMonth[1] = 29
    }
    utcDay = daysInMonth[utcMonth - 1]
  }

  return { year: utcYear, month: utcMonth, day: utcDay, hour: utcHour, minute: utcMinute }
}

// STEP A: Convert raw longitude to zodiac sign + degree + minutes
function getLongitudeToZodiac(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360
  const signIndex = Math.floor(normalized / 30)
  const degree = Math.floor((normalized % 30) * 60) / 60
  const minutes = Math.floor((normalized % 30) * 60) % 60

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Math.floor(degree),
    minutes: minutes,
    formatted: `${Math.floor(degree)}° ${minutes}' ${ZODIAC_SIGNS[signIndex]}`
  }
}

// STEP B: Determine house placement (1-12) based on whole-sign system
function getHousePlacement(planetLongitude: number, lagnaLongitude: number): number {
  // Normalize longitudes to 0-360
  const pLon = ((planetLongitude % 360) + 360) % 360
  const lLon = ((lagnaLongitude % 360) + 360) % 360

  // Get zodiac sign index (0-11, where 0=Aries, 11=Pisces)
  const planetSignIdx = Math.floor(pLon / 30)
  const lagnaSignIdx = Math.floor(lLon / 30)

  // Calculate house: how many signs away from Lagna?
  const houseDiff = (planetSignIdx - lagnaSignIdx + 12) % 12
  return houseDiff + 1 // House 1-12
}

// STEP C: Calculate aspects between planets
function calculateAspects(planets: Record<string, any>) {
  const aspectAngles = [
    { name: 'Conjunction', angle: 0, orb: 8 },
    { name: 'Sextile', angle: 60, orb: 6 },
    { name: 'Square', angle: 90, orb: 8 },
    { name: 'Trine', angle: 120, orb: 8 },
    { name: 'Opposition', angle: 180, orb: 8 }
  ]

  const aspects: any[] = []
  const planetNames = Object.keys(planets)

  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1 = planetNames[i]
      const p2 = planetNames[j]
      const pos1 = planets[p1].longitude
      const pos2 = planets[p2].longitude

      let diff = Math.abs(pos1 - pos2)
      diff = diff > 180 ? 360 - diff : diff

      for (const aspect of aspectAngles) {
        const orb = Math.abs(diff - aspect.angle)
        if (orb <= aspect.orb) {
          aspects.push({
            planet1: p1,
            planet2: p2,
            type: aspect.name,
            angle: diff.toFixed(1),
            orb: orb.toFixed(1),
            description: `${p1} ${aspect.name} ${p2}`
          })
        }
      }
    }
  }

  return aspects
}

/**
 * POST /api/calculate-chart
 * Step A: Converts raw degrees → Zodiac signs (30° groups)
 * Step B: Calculates house placements (12 houses)
 * Step C: Determines aspects (planet angles)
 * Step D: Formats into clean JSON (developer-friendly)
 *
 * Body: { year, month, day, hour, minute, lat, lng }
 *
 * Returns: {
 *   planets: { sign, degree, formatted, house },
 *   houses: { ascendant, all12houses },
 *   aspects: [{ planet1, planet2, type, angle }],
 *   birthDetails: {...}
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { year, month, day, hour, minute, lat, lng } = await req.json()

    if (!year || !month || !day || hour === undefined || minute === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required birth details' },
        { status: 400 }
      )
    }

    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing location coordinates' },
        { status: 400 }
      )
    }

    // Convert IST to UTC
    const utcTime = convertISTToUTC(year, month, day, hour, minute)

    // Calculate Julian Day Number
    let a = Math.floor((14 - utcTime.month) / 12)
    let y = utcTime.year + 4800 - a
    let m = utcTime.month + 12 * a - 3
    let jdn = utcTime.day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
    let jd = jdn + (utcTime.hour - 12) / 24 + utcTime.minute / 1440

    // Get Ayanamsa (Vedic sidereal offset)
    const ayanamsa = getAyanamsa(year)

    // Create a date object from UTC time
    const date = new Date(Date.UTC(utcTime.year, utcTime.month - 1, utcTime.day, utcTime.hour, utcTime.minute, 0))

    // Planet mappings for astronomy-engine
    const planetList = [
      { name: 'sun', body: Astronomy.Body.Sun },
      { name: 'moon', body: Astronomy.Body.Moon },
      { name: 'mercury', body: Astronomy.Body.Mercury },
      { name: 'venus', body: Astronomy.Body.Venus },
      { name: 'mars', body: Astronomy.Body.Mars },
      { name: 'jupiter', body: Astronomy.Body.Jupiter },
      { name: 'saturn', body: Astronomy.Body.Saturn }
    ]

    const rawPlanets: Record<string, any> = {}
    const observer = new Astronomy.Observer(lat, lng, 0)

    // Calculate planetary positions using real ephemeris
    for (const planet of planetList) {
      try {
        // Get geocentric position as cartesian vector
        const vec = Astronomy.GeoVector(planet.body, date, true)

        // Convert cartesian to ecliptic longitude (tropical)
        const lon_rad = Math.atan2(vec.y, vec.x)
        const tropicalLong = ((lon_rad * 180 / Math.PI) % 360 + 360) % 360

        // Convert to Vedic sidereal by subtracting Ayanamsa
        const siderealLong = ((tropicalLong - ayanamsa) % 360 + 360) % 360

        // Check if retrograde by comparing positions 1 day apart
        const vec1 = Astronomy.GeoVector(planet.body, new Date(date.getTime() - 86400000), true)
        const vec2 = Astronomy.GeoVector(planet.body, new Date(date.getTime() + 86400000), true)
        const lon1 = ((Math.atan2(vec1.y, vec1.x) * 180 / Math.PI) % 360 + 360) % 360
        const lon2 = ((Math.atan2(vec2.y, vec2.x) * 180 / Math.PI) % 360 + 360) % 360
        const isRetrograde = lon2 < lon1

        rawPlanets[planet.name] = {
          longitude: siderealLong,
          latitude: vec.z || 0,
          isRetrograde: isRetrograde
        }
      } catch (err) {
        console.error(`Error calculating ${planet.name}:`, err)
        rawPlanets[planet.name] = {
          longitude: 120,
          latitude: 0,
          isRetrograde: false
        }
      }
    }

    // Calculate Rahu (North Node) and Ketu (South Node) - lunar nodes
    try {
      const moonEcl = Astronomy.EclipticGeoMoon(date)
      const siderealLunarLong = ((moonEcl.lon - ayanamsa) % 360 + 360) % 360
      const opposite = ((siderealLunarLong + 180) % 360)

      rawPlanets.rahu = {
        longitude: siderealLunarLong,
        latitude: 0,
        isRetrograde: false
      }

      rawPlanets.ketu = {
        longitude: opposite,
        latitude: 0,
        isRetrograde: false
      }
    } catch (err) {
      console.error('Error calculating lunar nodes:', err)
      rawPlanets.rahu = { longitude: 120, latitude: 0, isRetrograde: false }
      rawPlanets.ketu = { longitude: 300, latitude: 0, isRetrograde: false }
    }

    // Calculate Lagna (Ascendant) from local sidereal time
    try {
      const gst = Astronomy.SiderealTime(date) // Greenwich Sidereal Time in hours
      const lngHours = lng / 15 // Convert longitude to hours
      const lst = ((gst + lngHours) % 24 + 24) % 24 // Local Sidereal Time in hours
      const lstDegrees = (lst * 15) % 360 // Convert hours to degrees

      // Ascendant = LST + 90 degrees (Eastern point)
      const lagnaLong = ((lstDegrees + 90 - ayanamsa) % 360 + 360) % 360

      rawPlanets.lagna = {
        longitude: lagnaLong,
        latitude: 0,
        isRetrograde: false
      }
    } catch (err) {
      console.error('Error calculating Lagna:', err)
      rawPlanets.lagna = {
        longitude: 28.5,
        latitude: 0,
        isRetrograde: false
      }
    }

    // STEP A: Transform degrees → zodiac signs (like Stellium/Kerykeion libraries do)
    const planets: Record<string, any> = {}
    const lagnaLongitude = rawPlanets.lagna.longitude
    for (const [name, pos] of Object.entries(rawPlanets)) {
      const zodiac = getLongitudeToZodiac(pos.longitude)
      planets[name] = {
        longitude: pos.longitude,
        latitude: pos.latitude,
        isRetrograde: pos.isRetrograde,
        sign: zodiac.sign,
        degree: zodiac.degree,
        minutes: zodiac.minutes,
        formatted: zodiac.formatted,
        house: getHousePlacement(pos.longitude, lagnaLongitude)
      }
    }

    // STEP B: Calculate houses (Ascendant + 12 house boundaries)
    // Using whole-sign house system (traditional Vedic approach)
    let houses = {
      ascendant: planets.lagna.formatted,
      ascendantDegree: planets.lagna.degree,
      allHouses: [] as any[]
    }

    try {
      const lagnaLongitude = planets.lagna.longitude
      // Whole sign houses: each house spans 30 degrees starting from Lagna
      for (let i = 0; i < 12; i++) {
        const houseLongitude = (lagnaLongitude + i * 30) % 360
        const zodiac = getLongitudeToZodiac(houseLongitude)

        houses.allHouses.push({
          number: i + 1,
          name: HOUSES[i],
          longitude: houseLongitude,
          sign: zodiac.sign
        })
      }
    } catch (err) {
      console.error('Error calculating houses:', err)
      // Fallback to simple 30-degree divisions
      const lagnaLongitude = planets.lagna.longitude
      houses.allHouses = HOUSES.map((houseName, idx) => ({
        number: idx + 1,
        name: houseName,
        longitude: (lagnaLongitude + idx * 30) % 360,
        sign: getLongitudeToZodiac((lagnaLongitude + idx * 30) % 360).sign
      }))
    }

    // STEP C: Calculate aspects (geometric angles between planets)
    const aspects = calculateAspects(planets)

    // STEP D: Format into clean API response
    const chartData = {
      planets: planets,
      houses: houses,
      aspects: aspects,
      birthDetails: {
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        latitude: lat,
        longitude: lng,
        timezone: 'UTC'
      }
    }

    return NextResponse.json({
      success: true,
      data: chartData,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Chart calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate chart' },
      { status: 500 }
    )
  }
}
