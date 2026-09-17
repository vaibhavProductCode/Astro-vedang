'use client'

import styles from './DataDashboard.module.css'

interface DataDashboardProps {
  chartData?: any
  dashaData?: any
  birthDetails?: {
    date: string
    time: string
    latitude: number
    longitude: number
  }
}

export default function DataDashboard({ chartData, dashaData, birthDetails }: DataDashboardProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📊 Astrological Data Dashboard</h2>
        <p className={styles.subtitle}>Raw API Data • Transparent Calculations • Complete Information</p>
      </div>

      {/* Birth Details Card */}
      {birthDetails && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🕐 Birth Details</h3>
          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <span className={styles.label}>Date:</span>
              <span className={styles.value}>{birthDetails.date}</span>
            </div>
            <div className={styles.dataItem}>
              <span className={styles.label}>Time:</span>
              <span className={styles.value}>{birthDetails.time} IST</span>
            </div>
            <div className={styles.dataItem}>
              <span className={styles.label}>Latitude:</span>
              <span className={styles.value}>{birthDetails.latitude.toFixed(6)}°N</span>
            </div>
            <div className={styles.dataItem}>
              <span className={styles.label}>Longitude:</span>
              <span className={styles.value}>{birthDetails.longitude.toFixed(6)}°E</span>
            </div>
          </div>
        </div>
      )}

      {/* Planets Raw Data Card */}
      {chartData?.planets && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🪐 Planetary Positions (Raw Data)</h3>
          <div className={styles.dataTable}>
            <div className={styles.tableHeader}>
              <div className={styles.col1}>Planet</div>
              <div className={styles.col2}>Tropical °</div>
              <div className={styles.col3}>Sidereal °</div>
              <div className={styles.col4}>Sign</div>
              <div className={styles.col5}>House</div>
              <div className={styles.col6}>Status</div>
            </div>
            {Object.entries(chartData.planets).map(([planet, data]: [string, any]) => (
              <div key={planet} className={styles.tableRow}>
                <div className={styles.col1}><strong>{planet.toUpperCase()}</strong></div>
                <div className={styles.col2}>{(data.longitude + 23.16).toFixed(2)}°</div>
                <div className={styles.col3}>{data.longitude.toFixed(2)}°</div>
                <div className={styles.col4}>{data.sign}</div>
                <div className={styles.col5}>{data.house}</div>
                <div className={styles.col6}>{data.isRetrograde ? '♌ R' : 'Direct'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Houses Raw Data Card */}
      {chartData?.houses && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🏠 Houses (Raw Data)</h3>
          <div className={styles.dataTable}>
            <div className={styles.tableHeader}>
              <div className={styles.col1}>House</div>
              <div className={styles.col2}>Sign</div>
              <div className={styles.col3}>Longitude</div>
            </div>
            {chartData.houses.allHouses?.map((house: any) => (
              <div key={house.number} className={styles.tableRow}>
                <div className={styles.col1}><strong>House {house.number}</strong></div>
                <div className={styles.col2}>{house.sign}</div>
                <div className={styles.col3}>{house.longitude.toFixed(2)}°</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aspects Raw Data Card */}
      {chartData?.aspects && chartData.aspects.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⚡ Aspects (Raw Data)</h3>
          <div className={styles.dataTable}>
            <div className={styles.tableHeader}>
              <div className={styles.col1}>Planet 1</div>
              <div className={styles.col2}>Type</div>
              <div className={styles.col3}>Planet 2</div>
              <div className={styles.col4}>Angle</div>
              <div className={styles.col5}>Orb</div>
            </div>
            {chartData.aspects.slice(0, 15).map((aspect: any, idx: number) => (
              <div key={idx} className={styles.tableRow}>
                <div className={styles.col1}>{aspect.planet1}</div>
                <div className={styles.col2}><strong>{aspect.type}</strong></div>
                <div className={styles.col3}>{aspect.planet2}</div>
                <div className={styles.col4}>{aspect.angle}°</div>
                <div className={styles.col5}>{aspect.orb}°</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dasha Raw Data Card */}
      {dashaData && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⏳ Vimshottari Dasha (Raw Data)</h3>

          <div className={styles.dashaInfo}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Nakshatra:</span>
                <span className={styles.value}>{dashaData.nakshatra} #{dashaData.nakshatraIndex + 1}/27</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Ruling Planet:</span>
                <span className={styles.value}>{dashaData.nakshatraRuler}</span>
              </div>
            </div>

            <h4 className={styles.subTitle}>Current Dasha Period</h4>
            <div className={styles.dataGrid}>
              <div className={styles.dataItem}>
                <span className={styles.label}>Planet:</span>
                <span className={styles.value}>{dashaData.birthDasha.planet}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>Start Date:</span>
                <span className={styles.value}>{dashaData.birthDasha.startDate}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>End Date:</span>
                <span className={styles.value}>{dashaData.birthDasha.endDate}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>Duration:</span>
                <span className={styles.value}>{dashaData.birthDasha.duration} years</span>
              </div>
            </div>

            <h4 className={styles.subTitle}>Next 20 Dasha Periods (120-Year Cycle)</h4>
            <div className={styles.dataTable}>
              <div className={styles.tableHeader}>
                <div className={styles.col1}>Planet</div>
                <div className={styles.col2}>Start Date</div>
                <div className={styles.col3}>End Date</div>
                <div className={styles.col4}>Duration</div>
              </div>
              {dashaData.dashaTimeline?.slice(0, 20).map((dasha: any, idx: number) => (
                <div key={idx} className={styles.tableRow}>
                  <div className={styles.col1}><strong>{dasha.planet}</strong></div>
                  <div className={styles.col2}>{dasha.startDate}</div>
                  <div className={styles.col3}>{dasha.endDate}</div>
                  <div className={styles.col4}>{dasha.duration} yrs</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.note}>
        <p>✨ Above shows ALL raw data from our astronomical calculations. Below comes the AI interpretation based on this data.</p>
      </div>
    </div>
  )
}
