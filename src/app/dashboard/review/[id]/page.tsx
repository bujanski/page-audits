import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { setDecisionAndAdvance, clearDecision } from './actions'
import styles from './review.module.css'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: page } = await supabase.from('pages').select('*').eq('id', id).single()
  if (!page) notFound()

  const { count } = await supabase
    .from('pages')
    .select('id', { count: 'exact', head: true })
    .is('decision', null)

  const pending = count ?? 0

  return (
    <div className={styles.container}>
      <div className={styles.screenshot}>
        {page.screenshot_url ? (
          <img src={page.screenshot_url} alt={page.url} className={styles.image} />
        ) : (
          <div className={styles.noScreenshot}>
            <p>No screenshot yet.</p>
            <p>Run the capture tool locally to generate one.</p>
          </div>
        )}
      </div>

      <div className={styles.overlay}>
        <div className={styles.urlBar}>
          <Link href="/dashboard" className={styles.back}>← Back</Link>
          <a href={page.url} target="_blank" rel="noopener noreferrer" className={styles.url}>
            {page.url}
          </a>
          {pending > 0 && (
            <span className={styles.pendingCount}>{pending} pending</span>
          )}
        </div>

        <div className={styles.controls}>
          {page.decision && (
            <form action={clearDecision.bind(null, id)}>
              <button type="submit" className={styles.undoBtn}>Undo</button>
            </form>
          )}

          <form action={setDecisionAndAdvance.bind(null, id, 'keep')}>
            <button
              type="submit"
              className={`${styles.btn} ${styles.keep} ${page.decision === 'keep' ? styles.active : ''}`}
            >
              Keep
            </button>
          </form>
          <form action={setDecisionAndAdvance.bind(null, id, 'update')}>
            <button
              type="submit"
              className={`${styles.btn} ${styles.update} ${page.decision === 'update' ? styles.active : ''}`}
            >
              Update
            </button>
          </form>
          <form action={setDecisionAndAdvance.bind(null, id, 'delete')}>
            <button
              type="submit"
              className={`${styles.btn} ${styles.delete} ${page.decision === 'delete' ? styles.active : ''}`}
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
