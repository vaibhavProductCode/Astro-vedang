'use client'

import styles from './ChartDataVisualization.module.css'

interface Props {
  chartData: any
}

const zodiacSymbols: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
}

const planetEmojis: Record<string, string> = {
  'sun': '☀️', 'moon': '🌙', 'mercury': '☿️', 'venus': '♀️',
  'mars': '♂️', 'jupiter': '♃', 'saturn': '♄', 'rahu': '⚕️', 'ketu': '☠️', 'lagna': '↗️'
}

export default function ChartDataVisualization({ chartData }: Props) {
  // Handle both old format (direct planets) and new format (nested in chartData)
  const planets = chartData.planets
  const houses = chartData.houses
  const aspects = chartData.aspects

  if (!planets || Object.keys(planets).length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <h3>Your Birth Chart at a Glance</h3>

      {/* Planets Overview */}
      <div className={styles.section}>
        <h4>Planetary Placements</h4>
        <div className={styles.planetGrid}>
          {Object.entries(planets).map(([name, data]: [string, any]) => (
            data.sign && (
              <div key={name} className={styles.planetCard}>
                <div className={styles.planetIcon}>{planetEmojis[name] || '⭐'}</div>
                <div className={styles.planetInfo}>
                  <div className={styles.planetName}>{name.charAt(0).toUpperCase() + name.slice(1)}</div>
                  <div className={styles.planetPosition}>
                    {zodiacSymbols[data.sign]} {data.sign} {data.degree}°
                  </div>
                  <div className={styles.planetHouse}>House {data.house}</div>
                  {data.isRetrograde && <div className={styles.retrograde}>↻ Retrograde</div>}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Ascendant */}
      {houses?.ascendant && (
        <div className={styles.section}>
          <h4>Your Rising Sign (Ascendant)</h4>
          <div className={styles.ascendantCard}>
            <div className={styles.ascendantSymbol}>{zodiacSymbols[houses.ascendant.split(' ')[1]] || '♈'}</div>
            <div>
              <p className={styles.ascendantText}>{houses.ascendant}</p>
              <p className={styles.ascendantDescription}>This is how others perceive you and your natural personality</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Aspects */}
      {aspects && aspects.length > 0 && (
        <div className={styles.section}>
          <h4>Major Planetary Interactions</h4>
          <div className={styles.aspectsList}>
            {aspects.slice(0, 5).map((aspect: any, idx: number) => (
              <div key={idx} className={styles.aspectItem}>
                <span className={styles.aspectPlanet}>{aspect.planet1}</span>
                <span className={styles.aspectType}>{aspect.type}</span>
                <span className={styles.aspectPlanet}>{aspect.planet2}</span>
                <span className={styles.aspectDegree}>{aspect.angle}°</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={styles.note}>
        ✨ Your unique cosmic blueprint is ready to be interpreted. Scroll down to read your personalized astrological insights.
      </p>
    </div>
  )
}
