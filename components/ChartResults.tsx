'use client'

import { useState } from 'react'
import ChartDataVisualization from './ChartDataVisualization'
import DashaTimeline from './DashaTimeline'
import DataDashboard from './DataDashboard'
import styles from './ChartResults.module.css'

interface PlanetPosition {
  longitude: number
  latitude: number
  isRetrograde: boolean
  sign: string
  degree: number
}

interface ChartData {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  chartData?: {
    sun: PlanetPosition
    moon: PlanetPosition
    mercury: PlanetPosition
    venus: PlanetPosition
    mars: PlanetPosition
    jupiter: PlanetPosition
    saturn: PlanetPosition
    rahu: PlanetPosition
    ketu: PlanetPosition
    lagna: PlanetPosition
    birthDetails: {
      date: string
      time: string
      latitude: number
      longitude: number
      timezone: string
    }
    houses?: any
    aspects?: any[]
  }
  dashaData?: {
    nakshatra: string
    nakshatraIndex: number
    birthDasha: {
      planet: string
      startDate: string
      endDate: string
      duration: number
    }
    dashaTimeline: Array<{
      planet: string
      startDate: string
      endDate: string
      duration: number
    }>
  }
  interpretation?: string
  location?: {
    name: string
    lat: number
    lon: number
  }
}

interface ChartResultsProps {
  data: ChartData
  onNewChart: () => void
}

const zodiacSymbols: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
}

export default function ChartResults({ data, onNewChart }: ChartResultsProps) {
  const [chartFormat, setChartFormat] = useState('north')

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getSymbol = (sign: string): string => zodiacSymbols[sign] || '♈'

  const chartData = data.chartData
  const hasFullData = !!(chartData?.lagna?.sign)

  if (!hasFullData) {
    return (
      <section className={styles.section} id="results">
        <div className={styles.container}>
          <div className="card">
            <h2>Birth Chart Result</h2>
            <div className={styles.infoItem}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{data.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Birth Date:</span>
              <span className={styles.value}>{formatDate(data.birthDate)}</span>
            </div>
          </div>

          {chartData && <ChartDataVisualization chartData={{ planets: chartData, houses: chartData.houses, aspects: chartData.aspects }} />}

          {data.dashaData && (
            <DashaTimeline
              birthDasha={data.dashaData.birthDasha}
              timeline={data.dashaData.dashaTimeline}
              nakshatraIndex={data.dashaData.nakshatraIndex}
              nakshatra={data.dashaData.nakshatra}
            />
          )}

          {data.interpretation && (
            <div className="card">
              <h3>AI Astrological Interpretation</h3>
              <div className={styles.interpretation}>
                {data.interpretation.split('\n').map((line, idx) => line.trim() && <p key={idx}>{line}</p>)}
              </div>
            </div>
          )}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button onClick={() => {
              onNewChart()
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200)
            }} style={{ textDecoration: 'none', padding: '0.75rem 1.5rem', display: 'inline-block', background: '#2d5016', color: 'white', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>↑ Generate New Chart</button>
          </div>

          <div className="card" style={{ background: 'rgba(45, 80, 22, 0.05)', borderLeft: '4px solid #c17a1a', padding: '1.5rem' }}>
            <p style={{ margin: 0, color: '#2d5016', fontSize: '1rem', lineHeight: '1.6' }}>
              ✨ <strong>Vedic Astrology</strong> reveals your cosmic blueprint. Your birth chart is a sacred map of planetary influences at the moment you entered this world. Understanding these energies helps you navigate life's journey with wisdom and clarity.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section} id="results">
      <div className={styles.container}>
        <div className="card">
          <h2>Your Vedic Birth Chart</h2>
          <div className={styles.summaryInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{data.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Birth Date:</span>
              <span className={styles.value}>{formatDate(data.birthDate)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Birth Time:</span>
              <span className={styles.value}>{data.birthTime}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Birth Place:</span>
              <span className={styles.value}>{data.birthPlace}</span>
            </div>
            {data.location && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Coordinates:</span>
                <span className={styles.value}>{data.location.lat.toFixed(4)}°N, {data.location.lon.toFixed(4)}°E</span>
              </div>
            )}
          </div>
          <p className={styles.summaryText}>Based on your birth details, your chart reveals unique planetary influences that shape your personality, destiny, and life path. The following analysis provides insights into your Vedic astrology profile.</p>
        </div>

        {hasFullData && chartData && (
          <>
            <DataDashboard
              chartData={chartData}
              dashaData={data.dashaData}
              birthDetails={{
                date: data.birthDate,
                time: data.birthTime,
                latitude: data.location?.lat || 0,
                longitude: data.location?.lon || 0
              }}
            />

            <div className={styles.astrologySection}>
              <h3>Key Astrological Details</h3>
              <div className={styles.summaryGrid}>
                <div className="card">
                  <div className={styles.cardLabel}>Lagna (Ascendant)</div>
                  <div className={styles.cardValue}>{getSymbol(chartData?.lagna?.sign || 'Aries')} {chartData?.lagna?.sign || 'Aries'}</div>
                  <p>Your self-presentation and core identity</p>
                </div>
                <div className="card">
                  <div className={styles.cardLabel}>Moon Sign (Rashi)</div>
                  <div className={styles.cardValue}>{getSymbol(chartData?.moon?.sign || 'Leo')} {chartData?.moon?.sign || 'Leo'}</div>
                  <p>Your emotional nature and inner self</p>
                </div>
                <div className="card">
                  <div className={styles.cardLabel}>Sun Sign</div>
                  <div className={styles.cardValue}>{getSymbol(chartData?.sun?.sign || 'Taurus')} {chartData?.sun?.sign || 'Taurus'}</div>
                  <p>Your core essence and life purpose</p>
                </div>
                <div className="card">
                  <div className={styles.cardLabel}>Planetary Positions</div>
                  <div className={styles.cardValue}>{Object.keys(chartData).length - 1}</div>
                  <p>Major planets & nodes calculated</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Planetary Positions</h3>
              <div className={styles.planetaryGrid}>
                {chartData && Object.entries(chartData || {}).filter(([key]) => key !== 'birthDetails').map(([planet, pos]: [string, any]) => (
                  pos && pos.sign ? (
                    <div key={planet} className={styles.planetCard}>
                      <div className={styles.planetName}>{planet.charAt(0).toUpperCase() + planet.slice(1)}</div>
                      <div className={styles.planetSign}>{getSymbol(pos.sign)} {pos.sign}</div>
                      <div className={styles.planetDegree}>{pos.degree || 0}° {pos.minutes || 0}'</div>
                      {pos.house && <div className={styles.planetHouse}>House {pos.house}</div>}
                      {pos.isRetrograde && <div className={styles.retrograde}>♌ Retrograde</div>}
                    </div>
                  ) : null
                ))}
              </div>
            </div>

            {chartData?.houses && (
              <div className="card">
                <h3>Houses & Ascendant</h3>
                <div className={styles.housesSection}>
                  <div className={styles.ascendantCard}>
                    <div className={styles.ascendantLabel}>Ascendant (1st House)</div>
                    <div className={styles.ascendantValue}>{chartData.houses.ascendant || 'N/A'}</div>
                    <p>Your rising sign and self-presentation</p>
                  </div>
                  <div className={styles.housesGrid}>
                    {chartData.houses.allHouses?.map((house: any) => (
                      <div key={house.number} className={styles.houseCard}>
                        <div className={styles.houseNumber}>{house.number}</div>
                        <div className={styles.houseName}>{house.name}</div>
                        <div className={styles.houseSign}>{getSymbol(house.sign || 'Aries')} {house.sign || 'Aries'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chartData?.aspects && chartData.aspects.length > 0 && (
              <div className="card">
                <h3>Planetary Aspects</h3>
                <p className={styles.aspectsInfo}>Major angular relationships between planets</p>
                <div className={styles.aspectsList}>
                  {chartData.aspects.map((aspect: any, idx: number) => (
                    aspect && aspect.type ? (
                      <div key={idx} className={`${styles.aspectItem} ${styles[`aspect-${aspect.type.toLowerCase()}`]}`}>
                        <div className={styles.aspectPlanets}>
                          <span>{aspect.planet1?.charAt(0).toUpperCase() + aspect.planet1?.slice(1)}</span>
                          <span className={styles.aspectType}>{aspect.type}</span>
                          <span>{aspect.planet2?.charAt(0).toUpperCase() + aspect.planet2?.slice(1)}</span>
                        </div>
                        <div className={styles.aspectAngle}>{aspect.angle}° (orb: {aspect.orb}°)</div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3>Kundli Chart</h3>
              <div className={styles.chartControls}>
                <button className={`${chartFormat === 'north' ? styles.active : ''}`} onClick={() => setChartFormat('north')}>North Indian</button>
                <button className={`${chartFormat === 'south' ? styles.active : ''}`} onClick={() => setChartFormat('south')}>South Indian</button>
              </div>

              {chartFormat === 'north' ? (
                <svg className={styles.chart} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                  <path d="M150,30 L220,90 L220,210 L150,270 L80,210 L80,90 Z" fill="none" stroke="var(--color-accent)" strokeWidth="2.5"/>
                  <line x1="80" y1="90" x2="220" y2="90" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="80" y1="90" x2="150" y2="270" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="220" y1="90" x2="150" y2="270" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7"/>
                  <text x="150" y="55" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--color-primary)">{getSymbol(chartData.lagna.sign)}</text>
                  <text x="180" y="110" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--color-primary)">{getSymbol(chartData.moon.sign)}</text>
                  <circle cx="150" cy="150" r="18" fill="var(--color-accent)" opacity="0.2"/>
                  <circle cx="150" cy="150" r="18" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"/>
                  <circle cx="150" cy="150" r="6" fill="var(--color-accent)"/>
                </svg>
              ) : (
                <svg className={styles.chart} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                  <rect x="50" y="50" width="200" height="200" fill="none" stroke="var(--color-accent)" strokeWidth="2.5"/>
                  <line x1="50" y1="150" x2="250" y2="150" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="150" y1="50" x2="150" y2="250" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7"/>
                  <text x="95" y="95" textAnchor="middle" fontSize="12" fill="var(--color-primary)">{getSymbol(chartData.lagna.sign)} 1</text>
                  <circle cx="150" cy="150" r="18" fill="var(--color-accent)" opacity="0.2"/>
                  <circle cx="150" cy="150" r="18" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"/>
                  <circle cx="150" cy="150" r="6" fill="var(--color-accent)"/>
                </svg>
              )}
            </div>

            {chartData && <ChartDataVisualization chartData={{ planets: chartData, houses: chartData.houses, aspects: chartData.aspects }} />}

            {!data.dashaData && (
              <div className="card" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', borderLeft: '4px solid #ffc107', padding: '1rem' }}>
                <p style={{ color: '#ff6f00', fontWeight: 600, margin: 0 }}>⏳ Dasha Timeline Unavailable</p>
                <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                  The Vimshottari Dasha calculation had an issue. This feature is ready but may require a retry.
                </p>
              </div>
            )}

            {data.dashaData && (
              <DashaTimeline
                birthDasha={data.dashaData.birthDasha}
                timeline={data.dashaData.dashaTimeline}
                nakshatraIndex={data.dashaData.nakshatraIndex}
                nakshatra={data.dashaData.nakshatra}
              />
            )}

            {data.interpretation && (
              <>
                <div>
                  <h3>Your Astrological Profile</h3>
                  <div className={styles.insightCards}>
                    <div className={styles.insightCard}>
                      <h4>🌟 Personality Portrait</h4>
                      <p>Your core identity shaped by your Lagna and planetary placements. Discover your natural strengths and character traits.</p>
                    </div>
                    <div className={styles.insightCard}>
                      <h4>💼 Career & Wealth</h4>
                      <p>Professional inclinations and financial prospects revealed through your 2nd and 10th house placements.</p>
                    </div>
                    <div className={styles.insightCard}>
                      <h4>💕 Relationships & Love</h4>
                      <p>Your romantic nature and partnership dynamics, influenced by Venus and Mars placements.</p>
                    </div>
                    <div className={styles.insightCard}>
                      <h4>🧘 Spirituality & Growth</h4>
                      <p>Your spiritual path and life lessons, guided by Jupiter and Saturn's wisdom.</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3>Detailed Astrological Reading</h3>
                  <div className={styles.interpretation}>
                    {data.interpretation.split('\n').map((paragraph, idx) =>
                      paragraph.trim() && <p key={idx}>{paragraph}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={() => {
            onNewChart()
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200)
          }} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', background: '#2d5016', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', marginRight: '1rem' }}>↑ Generate New Chart</button>
          <button onClick={() => window.print()} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', background: '#c17a1a', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>🖨️ Print Chart</button>
        </div>

        <div className="card" style={{ background: 'rgba(193, 122, 26, 0.05)', borderLeft: '4px solid #c17a1a', padding: '1.5rem', marginTop: '2rem' }}>
          <p style={{ margin: 0, color: '#2d5016', fontSize: '1rem', lineHeight: '1.6' }}>
            🌟 <strong>The Twelve Houses</strong> in your chart represent different life areas. Your Lagna (1st house) is your identity, the 7th house governs relationships, the 10th house rules career and public image. Each house interacts with planetary positions to create your unique life story.
          </p>
        </div>
      </div>
    </section>
  )
}
