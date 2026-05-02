import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: pages, error } = await supabase
    .from('pages')
    .select('url, decision, notes')
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
    ['url', 'decision', 'notes'],
    ...(pages ?? []).map(p => [escape(p.url), escape(p.decision), escape(p.notes)]),
  ]

  const csv = rows.map(r => r.join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="page-audits.csv"',
    },
  })
}
