import { getSupabaseClient } from "./supabase-client"
import type { StudySession, StudyStats } from "./types"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

// Study Sessions CRUD
export async function createStudySession(taskId: string): Promise<StudySession> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        task_id: taskId,
        start_time: new Date().toISOString(),
      })
      .select(`
        *,
        tasks (
          id,
          title,
          subject_id,
          subjects (
            id,
            name,
            color
          )
        )
      `)
      .single()

    if (error) {
      console.error("Error creating study session:", error)
      throw new Error(`Failed to create study session: ${error.message}`)
    }

    return data
  })
}

export async function endStudySession(sessionId: string, duration: number, notes?: string): Promise<StudySession> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("study_sessions")
      .update({
        end_time: new Date().toISOString(),
        duration,
        notes,
      })
      .eq("id", sessionId)
      .select(`
        *,
        tasks (
          id,
          title,
          subject_id,
          subjects (
            id,
            name,
            color
          )
        )
      `)
      .single()

    if (error) {
      console.error("Error ending study session:", error)
      throw new Error(`Failed to end study session: ${error.message}`)
    }

    return data
  })
}

export async function getStudySessions(limit = 50): Promise<StudySession[]> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("study_sessions")
      .select(`
        *,
        tasks (
          id,
          title,
          subject_id,
          subjects (
            id,
            name,
            color
          )
        )
      `)
      .order("start_time", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching study sessions:", error)
      throw new Error(`Failed to fetch study sessions: ${error.message}`)
    }

    return data || []
  })
}

export async function getStudyStats(days = 30): Promise<StudyStats> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from("study_sessions")
      .select(`
        *,
        tasks (
          id,
          title,
          subject_id,
          subjects (
            id,
            name,
            color
          )
        )
      `)
      .gte("start_time", startDate.toISOString())
      .not("duration", "is", null)
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching study stats:", error)
      throw new Error(`Failed to fetch study stats: ${error.message}`)
    }

    const sessions = data || []
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const sessionsCount = sessions.length
    const averageSession = sessionsCount > 0 ? totalTime / sessionsCount : 0

    // Subject breakdown
    const subjectMap = new Map()
    sessions.forEach((session) => {
      const subject = session.tasks?.subjects
      if (subject && session.duration) {
        const key = subject.id
        if (subjectMap.has(key)) {
          const existing = subjectMap.get(key)
          existing.time += session.duration
          existing.sessions += 1
        } else {
          subjectMap.set(key, {
            subject: subject.name,
            time: session.duration,
            color: subject.color,
            sessions: 1,
          })
        }
      }
    })

    const subjectBreakdown = Array.from(subjectMap.values())

    // Daily stats
    const dailyMap = new Map()
    sessions.forEach((session) => {
      if (session.duration) {
        const date = new Date(session.start_time).toISOString().split("T")[0]
        dailyMap.set(date, (dailyMap.get(date) || 0) + session.duration)
      }
    })

    const dailyStats = Array.from(dailyMap.entries()).map(([date, time]) => ({
      date,
      time,
    }))

    // Weekly stats (simplified)
    const weeklyMap = new Map()
    sessions.forEach((session) => {
      if (session.duration) {
        const date = new Date(session.start_time)
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        const weekKey = weekStart.toISOString().split("T")[0]
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + session.duration)
      }
    })

    const weeklyStats = Array.from(weeklyMap.entries()).map(([week, time]) => ({
      week,
      time,
    }))

    return {
      totalTime,
      sessionsCount,
      averageSession,
      subjectBreakdown,
      dailyStats,
      weeklyStats,
    }
  })
}
