'use client'

import { useState } from 'react'
import { setDecisionAndAdvance, clearDecision } from './actions'
import styles from './review.module.css'

type Decision = 'keep' | 'update' | 'delete' | 'archive'

interface Props {
  id: string
  currentDecision: string | null
  pending: number
}

export default function ReviewControls({ id, currentDecision, pending }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleDecision(decision: Decision) {
    if (decision === 'archive') {
      setShowModal(true)
      return
    }
    await setDecisionAndAdvance(id, decision)
  }

  async function handleArchiveSave() {
    setSaving(true)
    await setDecisionAndAdvance(id, 'archive', notes.trim() || undefined)
  }

  async function handleArchiveSkip() {
    setSaving(true)
    await setDecisionAndAdvance(id, 'archive')
  }

  return (
    <>
      <div className={styles.controls}>
        {currentDecision && (
          <form action={clearDecision.bind(null, id)}>
            <button type="submit" className={styles.undoBtn}>Undo</button>
          </form>
        )}

        {(['keep', 'update', 'delete', 'archive'] as Decision[]).map(decision => (
          <button
            key={decision}
            onClick={() => handleDecision(decision)}
            className={`${styles.btn} ${styles[decision]} ${currentDecision === decision ? styles.active : ''}`}
          >
            {decision.charAt(0).toUpperCase() + decision.slice(1)}
          </button>
        ))}
      </div>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Archive — add notes</h3>
            <textarea
              className={styles.modalTextarea}
              placeholder="Add archival notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              autoFocus
              disabled={saving}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => { setShowModal(false); setNotes('') }}
                className={styles.modalCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveSkip}
                className={styles.modalSkip}
                disabled={saving}
              >
                Skip
              </button>
              <button
                onClick={handleArchiveSave}
                className={styles.modalSave}
                disabled={saving || !notes.trim()}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
