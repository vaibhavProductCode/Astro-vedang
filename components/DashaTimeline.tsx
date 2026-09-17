'use client'

import styles from './DashaTimeline.module.css'

interface DashaInfo {
  planet: string
  startDate: string
  endDate: string
  duration: number
}

interface DashaTimelineProps {
  birthDasha: DashaInfo
  timeline: DashaInfo[]
  nakshatraIndex: number
  nakshatra: string
}

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
]

const DASHA_COLORS: Record<string, string> = {
  'Ketu': '#8B0000',
  'Venus': '#FFB6C1',
  'Sun': '#FFA500',
  'Moon': '#C0C0C0',
  'Mars': '#DC143C',
  'Rahu': '#4B0082',
  'Jupiter': '#FFD700',
  'Saturn': '#696969',
  'Mercury': '#32CD32'
}

export default function DashaTimeline({
  birthDasha,
  timeline,
  nakshatraIndex,
  nakshatra
}: DashaTimelineProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const calculateProgress = (startDate: string, endDate: string, currentDate: Date = new Date()) => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = currentDate.getTime()

    if (now < start) return 0
    if (now > end) return 100
    return Math.round(((now - start) / (end - start)) * 100)
  }

  return (
    <div className={styles.container}>
      <div className="card">
        <h3>Vimshottari Dasha (120-Year Cycle)</h3>

        <div className={styles.nakshatraInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Birth Nakshatra:</span>
            <span className={styles.value}>{nakshatra} ({nakshatraIndex + 1}/27)</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Ruling Planet:</span>
            <span className={styles.value} style={{ color: DASHA_COLORS[birthDasha.planet] }}>
              {birthDasha.planet}
            </span>
          </div>
        </div>

        <div className={styles.currentDashaSection}>
          <h4>Current Dasha Period</h4>
          <div className={styles.dashaCard} style={{ borderLeftColor: DASHA_COLORS[birthDasha.planet] }}>
            <div className={styles.dashaHeader}>
              <span className={styles.dashaName}>{birthDasha.planet} Mahadasha</span>
              <span className={styles.duration}>{birthDasha.duration} years</span>
            </div>

            <div className={styles.dateRange}>
              <span>{formatDate(birthDasha.startDate)}</span>
              <span>→</span>
              <span>{formatDate(birthDasha.endDate)}</span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${calculateProgress(birthDasha.startDate, birthDasha.endDate)}%`,
                  backgroundColor: DASHA_COLORS[birthDasha.planet]
                }}
              />
            </div>
            <p className={styles.progressText}>
              {calculateProgress(birthDasha.startDate, birthDasha.endDate)}% complete
            </p>
          </div>
        </div>

        <div className={styles.timelineSection}>
          <h4>Next Dashas (Next 120 Years)</h4>
          <div className={styles.timelineList}>
            {timeline.map((dasha, idx) => (
              <div
                key={idx}
                className={styles.timelineItem}
                style={{ borderLeftColor: DASHA_COLORS[dasha.planet] }}
              >
                <div className={styles.timelineHeader}>
                  <span className={styles.planetName}>{dasha.planet}</span>
                  <span className={styles.yearsInfo}>{dasha.duration} years</span>
                </div>
                <div className={styles.timelineDate}>
                  {formatDate(dasha.startDate)} → {formatDate(dasha.endDate)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dashaInfo}>
          <p className={styles.infoText}>
            ✨ <strong>Vimshottari Dasha</strong> is a 120-year predictive cycle based on your birth Moon's Nakshatra.
            Each planet rules a specific period, influencing major life events and opportunities.
          </p>
        </div>
      </div>
    </div>
  )
}
