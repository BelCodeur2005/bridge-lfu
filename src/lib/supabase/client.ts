// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import {createSupabaseServerClient}  from './server'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  export async function deleteClient(clientId: string) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.from('clients').delete().eq('id', clientId)

  if (error) {
    console.error("Erreur lors de la suppression du client:", error)
    throw new Error(error.message)
  }

  return { success: true }
}