import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ReviewControls from './ReviewControls'
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

        <ReviewControls id={id} currentDecision={page.decision} pending={pending} />
      </div>
    </div>
  )
}
