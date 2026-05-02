import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Welcome</h1>
        <p>let's delete everything</p>
        <div className={styles.ctas}>
          <Link href="/login" className={styles.primary}>Sign In</Link>
          <Link href="/signup" className={styles.secondary}>Create Account</Link>
        </div>
      </main>
    </div>
  )
}
