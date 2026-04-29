'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function setDecisionAndAdvance(id: string, decision: 'keep' | 'update' | 'delete') {
  const supabase = await createClient()

  await supabase.from('pages').update({ decision }).eq('id', id)

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
  await supabase.from('pages').update({ decision: null }).eq('id', id)
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/review/${id}`)
}
