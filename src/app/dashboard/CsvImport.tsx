'use client'

import { useRef, useState } from 'react'
import { importCSV } from '@/app/pages/actions'
import styles from './dashboard.module.css'

export default function CsvImport() {
  const [status, setStatus] = useState<{ count: number; error: string | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setStatus(null)
    const result = await importCSV(formData)
    setStatus(result ?? { count: 0, error: 'Unknown error' })
    setLoading(false)
    if (!result?.error && inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <form action={handleSubmit} className={styles.csvForm}>
      <input
        ref={inputRef}
        name="csv"
        type="file"
        accept=".csv,text/csv"
        required
        className={styles.csvInput}
      />
      <button type="submit" disabled={loading} className={styles.addButton}>
        {loading ? 'Importing…' : 'Import CSV'}
      </button>
      {status && (
        <span className={status.error ? styles.csvError : styles.csvSuccess}>
          {status.error ?? `${status.count} URL${status.count !== 1 ? 's' : ''} added`}
        </span>
      )}
    </form>
  )
}
