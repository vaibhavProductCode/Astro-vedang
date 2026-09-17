import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Discover Your Vedic Birth Chart</h1>
          <p className={styles.subtitle}>Understand your planetary influences and life path through ancient Vedic astrology</p>
          <p className={styles.subtitle}>Astrology is pure mathematics, not magic.
          </p>
          <p className={styles.subtitle}>
          "वेदा हि यज्ञार्थमभिप्रवृत्ताः कालानुपूर्व्या विहिताश्च यज्ञाः। तस्मादिदं कालविधानशास्त्रं यो ज्योतिषं वेद स वेद यज्ञम्॥"</p>
          {/* <div className={styles.ctas}>
            <button className="btn-primary btn-lg">Generate Your Chart</button>
            <button className="btn-secondary btn-lg">Learn More</button>
          </div> */}
        </div>
        <div className={styles.visual}>
          <svg className={styles.kundli} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.6"/>
            <path d="M100,15 L140,60 L140,140 L100,185 L60,140 L60,60 Z" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"/>
            <circle cx="100" cy="100" r="18" fill="var(--color-accent)" opacity="0.2"/>
            <circle cx="100" cy="100" r="18" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"/>
            <circle cx="100" cy="100" r="6" fill="var(--color-accent)"/>
            <text x="100" y="35" textAnchor="middle" fontSize="12" fill="var(--color-accent)">☉</text>
            <text x="125" y="80" textAnchor="middle" fontSize="12" fill="var(--color-accent)">☽</text>
            <text x="75" y="80" textAnchor="middle" fontSize="12" fill="var(--color-accent)">♂</text>
          </svg>
        </div>
      </div>
    </section>
  )
}
