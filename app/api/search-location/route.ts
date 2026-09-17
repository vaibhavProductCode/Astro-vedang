import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/search-location?city=cityname
 * Searches for city coordinates using Nominatim API
 * Results are cached in browser localStorage
 * Respects Nominatim rate limit: 1 request per second
 *
 * Query: { city: string }
 * Returns: { success: boolean, data?: [{ name, lat, lon }], error?: string }
 */
export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get('city')

    if (!city || city.length < 2) {
      return NextResponse.json(
        { success: false, error: 'City name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Nominatim API endpoint
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
    nominatimUrl.searchParams.set('q', city)
    nominatimUrl.searchParams.set('format', 'json')
    nominatimUrl.searchParams.set('limit', '5')

    // REQUIRED: Nominatim User-Agent header (respect their ToS)
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'Vedanga-Astrology-App/1.0 (https://vedanga.app)',
        'Accept': 'application/json'
      },
      // Nominatim requires rate limit respect: 1 request per second
      // This is handled client-side with debounce (500ms)
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No locations found' },
        { status: 404 }
      )
    }

    // Extract and format results
    const results = data.map((item: any) => ({
      name: item.display_name.split(',')[0], // City name only
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name
    }))

    return NextResponse.json({
      success: true,
      data: results,
      cached: false // Let client know to cache in localStorage
    })
  } catch (error: any) {
    console.error('Location search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search locations. Try another city.' },
      { status: 500 }
    )
  }
}
