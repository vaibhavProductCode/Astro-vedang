import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { groq } from '@ai-sdk/groq'

/**
 * POST /api/interpret-chart
 * Streams AI interpretations of the birth chart
 * Uses Groq for free, fast inference
 * API key is NEVER exposed to frontend (server-side only)
 *
 * Body: {
 *   chartData: {...planetary positions...},
 *   name: string
 * }
 *
 * Returns: Server-Sent Events stream with AI interpretation
 */
export async function POST(req: NextRequest) {
  try {
    const { chartData, name } = await req.json()

    // Verify API key exists (server-side only - never exposed to client)
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Format chart data into readable format for AI
    const formattedChart = `
Birth Chart for ${name}:

PLANETS:
${Object.entries(chartData.planets || {})
  .map(([planet, data]: [string, any]) =>
    `- ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.formatted} (House ${data.house})${data.isRetrograde ? ' [RETROGRADE]' : ''}`
  )
  .join('\n')}

HOUSES:
- Ascendant: ${chartData.houses?.ascendant}
${chartData.houses?.allHouses?.map((h: any) => `- ${h.name}: ${h.sign}`).join('\n')}

MAJOR ASPECTS:
${(chartData.aspects || []).slice(0, 10).map((a: any) => `- ${a.planet1} ${a.type} ${a.planet2} (${a.angle}°)`).join('\n')}
`

    // Construct rigorous Vedic astrology system prompt
    const systemPrompt = `You are an expert in Vedic (Sidereal) Astrology using the Parāśara system. Provide interpretations based ONLY on the provided chart data. Follow these rules strictly:

## CHART SYSTEM USED
- **Sidereal Zodiac** (Vedic): All planetary positions use Lahiri Ayanamsa
- **House System**: Whole-sign (Bhava) system - each sign = 1 house, starting from Lagna
- The Lagna (Ascendant) is ALWAYS the 1st house cusp

## CORE VEDIC ASTROLOGY FACTS (DO NOT CONTRADICT)
**Own Signs (Sva-Rashi):**
- Sun: Leo | Moon: Cancer | Mercury: Gemini, Virgo | Venus: Libra, Taurus
- Mars: Aries, Scorpio | Jupiter: Sagittarius, Pisces | Saturn: Capricorn, Aquarius

**Exaltation Signs (Uchcha-Sthana):**
- Sun: Aries | Moon: Taurus | Mercury: Virgo | Venus: Pisces | Mars: Capricorn
- Jupiter: Cancer | Saturn: Libra

**Rulerships (Karaka-Rashi):**
- 1st house = Self, Body, Personality (governed by Lagna sign)
- 2nd house = Wealth, Family, Speech
- 3rd house = Communication, Siblings, Short travel
- 7th house = Marriage, Partnerships, Spouse
- 10th house = Career, Public image, Authority
- 11th house = Gains, Friends, Aspirations

## WHAT NOT TO DO
❌ Do NOT call a planet in its own sign "in its own house" unless it's the 1st house
❌ Do NOT call Sun-Moon opposition a "Yogakaraka" (this is Western terminology)
❌ Do NOT use Western aspect orbs or conjunctions as "Vedic Drishti"
❌ Do NOT predict Dasha timings without showing Dasha calculations
❌ Do NOT confuse tropical vs. sidereal coordinates
❌ Do NOT make health predictions not supported by planetary afflictions (Mars-Saturn, Saturn-Moon)
❌ Do NOT use generic horoscope language; be specific to THIS chart

## WHAT TO DO
✅ Analyze Lagna (sign + lord's placement) for personality
✅ Analyze Moon (sign + house) for emotional nature
✅ Analyze 7th house & its lord for relationships
✅ Analyze 10th house & 10th lord for career
✅ Consider planetary dignity (own sign, exaltation, debilitation)
✅ Explain Rahu-Ketu axis as karmic lessons (not Western "nodes")
✅ Mention retrograde planets' internalized energy
✅ Reference specific houses when describing life areas

## INTERPRETATION STRUCTURE
1. **Personality & Temperament**: Lagna sign + Moon sign analysis, considering house placements
2. **Career & Wealth**: 10th house & lord, 2nd house wealth indicators, 11th house gains
3. **Relationships**: 7th house & lord, Venus placement, relationship karaka analysis
4. **Spirituality & Life Lessons**: Rahu-Ketu axis, retrograde planets, 8th & 12th house insights
5. **Key Planetary Transits**: Mention which transits will be significant (major planets crossing angles)

## OUTPUT FORMAT
- Use Vedic terminology (Lagna, Rashi, Bhava, Karaka, Yogakaraka when appropriate, Drishti)
- Cite specific house placements and sign rulerships
- Be concise but comprehensive
- Avoid contradictions
- End with 2-3 actionable spiritual practices aligned to the chart

Remember: You are interpreting a SIDEREAL Vedic chart with WHOLE-SIGN houses. Every interpretation must be internally consistent with these principles.`

    // Use streaming text with Groq
    const result = await streamText({
      model: groq('openai/gpt-oss-120b'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Provide a comprehensive Vedic astrology interpretation for this birth chart:\n\n${formattedChart}`
        }
      ],
      temperature: 0.7,
      maxTokens: 4096
    })

    // Return streaming response
    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('Chart interpretation error:', error)

    // Don't expose API key in error messages
    const errorMessage = error.message.includes('API')
      ? 'AI service error occurred'
      : error.message || 'Failed to generate interpretation'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
