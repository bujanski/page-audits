import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { addPage, deletePage, resetDecision } from '@/app/pages/actions'
import CsvImport from './CsvImport'
import styles from './dashboard.module.css'

const DECISION_LABELS: Record<string, string> = {
  keep: 'Keep',
  update: 'Update',
  delete: 'Delete',
  archive: 'Archive',
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
          <a href="/api/export" download className={styles.exportButton}>Export CSV</a>
          <form action={logout}>
            <button type="submit" className={styles.logoutButton}>Sign Out</button>
          </form>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.tableColumn}>
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
                          <span className={styles.decisionCell}>
                            <span className={`${styles.badge} ${styles[page.decision]}`}>
                              {DECISION_LABELS[page.decision]}
                            </span>
                            <form action={resetDecision.bind(null, page.id)}>
                              <button type="submit" className={styles.resetButton} title="Reset to pending">✕</button>
                            </form>
                          </span>
                        ) : (
                          <span className={styles.pending}>Pending</span>
                        )}
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actions}>
                          <Link href={`/dashboard/review/${page.id}`} className={styles.reviewLink}>
                            Review
                          </Link>
                          <form action={deletePage.bind(null, page.id)}>
                            <button type="submit" className={styles.removeButton}>Remove</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className={styles.empty}>No pages yet. Add a URL using the form.</p>
          )}
        </div>

        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Add URLs</h2>
          <form action={addPage} className={styles.addForm}>
            <input
              name="url"
              type="url"
              required
              placeholder="https://example.com/page"
              className={styles.urlInput}
            />
            <button type="submit" className={styles.addButton}>Add</button>
          </form>
          <div className={styles.divider} />
          <p className={styles.sidebarLabel}>Import CSV</p>
          <CsvImport />
        </aside>
      </main>
    </div>
  )
}
