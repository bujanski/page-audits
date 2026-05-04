'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function fetchPageMeta(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UPS-Audits/1.0)' },
      cache: 'no-store',
    })
    if (!res.ok) return {}
    const html = await res.text()

    const title =
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null
    const description =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']*)[^>]+name=["']description["']/i)?.[1] ??
      null
    const keywords =
      html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']*)[^>]+name=["']keywords["']/i)?.[1] ??
      null

    return { meta_title: title, meta_description: description, meta_keywords: keywords }
  } catch {
    return {}
  }
}

export async function setDecisionAndAdvance(
  id: string,
  decision: 'keep' | 'update' | 'delete' | 'archive',
  notes?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const updateData: Record<string, unknown> = {
    decision,
    notes: notes ?? null,
    decided_by: user?.email ?? null,
    decided_at: new Date().toISOString(),
  }

  if (decision === 'archive') {
    const { data: page } = await supabase.from('pages').select('url').eq('id', id).single()
    if (page?.url) Object.assign(updateData, await fetchPageMeta(page.url))
  }

  await supabase.from('pages').update(updateData).eq('id', id)

  const { data: next } = await supabase
    .from('pages')
    .select('id')
    .is('decision', null)
    .neq('id', id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  revalidatePath('/dashboard')

  if (next) {
    redirect(`/dashboard/review/${next.id}`)
  } else {
    redirect('/dashboard')
  }
}

export async function clearDecision(id: string) {
  const supabase = await createClient()
  await supabase.from('pages').update({ decision: null, notes: null, meta_title: null, meta_description: null, meta_keywords: null, decided_by: null, decided_at: null }).eq('id', id)
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/review/${id}`)
}
