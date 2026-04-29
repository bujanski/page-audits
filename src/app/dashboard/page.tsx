import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { addPage, deletePage } from '@/app/pages/actions'
import styles from './dashboard.module.css'

const DECISION_LABELS: Record<string, string> = {
  keep: 'Keep',
  update: 'Update',
  delete: 'Delete',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: true })

  const undecided = pages?.filter(p => !p.decision) ?? []
  const firstPending = undecided[0] ?? null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Page Audits</h1>
        <div className={styles.headerActions}>
          {firstPending && (
            <Link href={`/dashboard/review/${firstPending.id}`} className={styles.resumeButton}>
              Resume Review ({undecided.length} left)
            </Link>
          )}
          <form action={logout}>
            <button type="submit" className={styles.logoutButton}>Sign Out</button>
          </form>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.addSection}>
          <form action={addPage} className={styles.addForm}>
            <input
              name="url"
              type="url"
              required
              placeholder="https://example.com/page"
              className={styles.urlInput}
            />
            <button type="submit" className={styles.addButton}>Add URL</button>
          </form>
        </section>

        {pages && pages.length > 0 ? (
          <>
            <p className={styles.summary}>
              {pages.length} page{pages.length !== 1 ? 's' : ''} &mdash; {undecided.length} awaiting review
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Decision</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page.id}>
                    <td className={styles.urlCell}>
                      <a href={page.url} target="_blank" rel="noopener noreferrer">
                        {page.url}
                      </a>
                    </td>
                    <td>
                      {page.decision ? (
                        <span className={`${styles.badge} ${styles[page.decision]}`}>
                          {DECISION_LABELS[page.decision]}
                        </span>
                      ) : (
                        <span className={styles.pending}>Pending</span>
                      )}
                    </td>
                    <td className={styles.actions}>
                      <Link href={`/dashboard/review/${page.id}`} className={styles.reviewLink}>
                        Review
                      </Link>
                      <form action={deletePage.bind(null, page.id)}>
                        <button type="submit" className={styles.removeButton}>Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className={styles.empty}>No pages yet. Add a URL above to get started.</p>
        )}
      </main>
    </div>
  )
}
