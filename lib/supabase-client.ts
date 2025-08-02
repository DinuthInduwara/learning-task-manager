import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export type Subject = {
  id: string
  name: string
  color: string
  created_at: string
}

export type Task = {
  id: string
  subject_id: string
  title: string
  type: "theory" | "video" | "paper"
  status: "todo" | "done"
  lesson?: string
  video_url?: string
  notes?: string
  due_date?: string
  completed_at?: string
  created_at: string
  subjects?: Subject
}
