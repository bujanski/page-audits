import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: pages, error } = await supabase
    .from('pages')
    .select('url, decision, notes, meta_title, meta_description, meta_keywords, decided_by, decided_at')
    .order('created_at', { ascending: true })

  if (error) return new NextResponse('Export failed', { status: 500 })

  const escape = (val: string | null) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const rows = [
    ['url', 'decision', 'notes', 'meta_title', 'meta_description', 'meta_keywords', 'decided_by', 'decided_at'],
    ...(pages ?? []).map(p => [escape(p.url), escape(p.decision), escape(p.notes), escape(p.meta_title), escape(p.meta_description), escape(p.meta_keywords), escape(p.decided_by), escape(p.decided_at)]),
  ]

  const csv = rows.map(r => r.join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="page-audits.csv"',
    },
  })
}
