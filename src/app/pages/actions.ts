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

export async function importCSV(formData: FormData) {
  const file = formData.get('csv') as File
  if (!file || file.size === 0) return { count: 0, error: 'No file provided' }

  const text = await file.text()
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  const urls = lines
    .filter(line => line.toLowerCase() !== 'url') // skip header
    .map(line => line.split(',')[0].trim())        // take first column
    .filter(line => line.startsWith('http'))

  if (urls.length === 0) return { count: 0, error: 'No valid URLs found in file' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('pages')
    .insert(urls.map(url => ({ url })))

  if (error) return { count: 0, error: error.message }

  revalidatePath('/dashboard')
  return { count: urls.length, error: null }
}

export async function deletePage(id: string) {
  const supabase = await createClient()
  await supabase.from('pages').delete().eq('id', id)
  revalidatePath('/dashboard')
}
