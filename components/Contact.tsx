'use client'

import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section className={styles.section} id="contact">
      <div className={styles.container}>
        <div className={styles.content}>
          <h2>Let's Connect</h2>
          <p className={styles.subtitle}>Open to collaborations and opportunities</p>

          <div className={styles.contactLinks}>
            <a href="mailto:vaibhavshukla6300@gmail.com" className={styles.contactLink}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>vaibhavshukla6300@gmail.com</span>
            </a>

            <a href="https://www.linkedin.com/in/vaibhav-shukla-product" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              <span className={styles.label}>LinkedIn</span>
              <span className={styles.value}>linkedin.com/in/vaibhav-shukla-product</span>
            </a>

            <a href="https://vaibhav-ai-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
              <span className={styles.label}>Portfolio</span>
              <span className={styles.value}>vaibhav-ai-portfolio.vercel.app</span>
            </a>
          </div>
        </div>

        <div className={styles.footer}>
          <p>Built with Next.js • Powered by Groq AI</p>
          <p className={styles.copyright}>© 2026 Vedanga. All rights reserved.</p>
        </div>
      </div>
    </section>
  )
}
