import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Vedanga</h3>
            <p>Premium Vedic Astrology Platform</p>
          </div>
          <div className={styles.section}>
            <h4>Navigation</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#chart">Birth Chart</a></li>
              <li><a href="#kundli">Kundli</a></li>
              <li><a href="#readings">Readings</a></li>
            </ul>
          </div>
          <div className={styles.section}>
            <h4>Learn</h4>
            <ul>
              <li><a href="#">Vedic Astrology Basics</a></li>
              <li><a href="#">Planetary Meanings</a></li>
              <li><a href="#">Nakshatras Guide</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; 2026 Vedanga. All rights reserved.</p>
          <p>Premium Vedic Astrology • Heritage & Modern Design</p>
        </div>
      </div>
    </footer>
  )
}
