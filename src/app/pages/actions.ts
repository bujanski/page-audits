'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addPage(formData: FormData) {
  const url = (formData.get('url') as string).trim()
  if (!url) return

  const supabase = await createClient()
  await supabase.from('pages').insert({ url })

  revalidatePath('/dashboard')
}

export async function setDecision(id: string, decision: 'keep' | 'update' | 'delete') {
  const supabase = await createClient()
  await supabase.from('pages').update({ decision }).eq('id', id)
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/review/${id}`)
}

export async function deletePage(id: string) {
  const supabase = await createClient()
  await supabase.from('pages').delete().eq('id', id)
  revalidatePath('/dashboard')
}
