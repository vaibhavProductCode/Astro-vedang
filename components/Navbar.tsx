'use client'

import { useState } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <svg className={styles.logo} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
            <path d="M50,20 L70,35 L70,65 L50,80 L30,65 L30,35 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <circle cx="50" cy="50" r="6" fill="currentColor"/>
          </svg>
          <span className={styles.brandName}>Vedanga</span>
        </div>

        <div className={`${styles.menu} ${isMenuOpen ? styles.active : ''}`}>
          <a href="#home" className={styles.link}>Home</a>
          <a href="#chart-form" className={styles.link}>Birth Chart</a>
          <a href="#kundli" className={styles.link}>Kundli</a>
          <a href="#contact" className={styles.link}>Contact</a>
        </div>


        <button
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
