import styles from './InfoSection.module.css'

export default function InfoSection() {
  return (
    <section className={styles.section} id="kundli">
      <div className={styles.container}>
        <h2>What is a Kundli?</h2>
        <p className={styles.subtitle}>Understanding Vedic Astrology</p>
        <div className={styles.grid}>
          <div className="card"><h3>Birth Chart Basics</h3><p>A Kundli, or birth chart, is a snapshot of the planetary positions at your exact moment of birth. It reveals your unique astrological signature and life path according to Vedic principles.</p></div>
          <div className="card"><h3>The Twelve Houses</h3><p>Each house in your chart represents different life areas: self, wealth, siblings, family, creativity, health, marriage, transformation, spirituality, career, friendships, and liberation.</p></div>
          <div className="card"><h3>Planetary Influence</h3><p>The nine planets (Navagrahas) in Vedic astrology each govern specific aspects of life. Their positions and relationships create the unique pattern of your destiny.</p></div>
          <div className="card"><h3>Nakshatras</h3><p>The 27 lunar mansions (Nakshatras) define subtle personality traits. Your birth Nakshatra reveals your deepest nature and spiritual inclinations.</p></div>
          <div className="card"><h3>Chart Formats</h3><p>North Indian (diamond) and South Indian (square) charts present the same information in different visual formats. Both are equally valid and provide complete astrological insights.</p></div>
          <div className="card"><h3>Accuracy Matters</h3><p>Accurate birth time is crucial for precise chart calculations. Even a few minutes difference can significantly affect your Lagna (Ascendant) and house positions.</p></div>
        </div>
      </div>
    </section>
  )
}
