export interface StudySession {
  id: string
  task_id: string
  start_time: string
  end_time?: string
  duration?: number // in seconds
  notes?: string
  created_at: string
  tasks?: {
    id: string
    title: string
    subject_id: string
    subjects?: {
      id: string
      name: string
      color: string
    }
  }
}

export interface StudyStats {
  totalTime: number
  sessionsCount: number
  averageSession: number
  subjectBreakdown: {
    subject: string
    time: number
    color: string
    sessions: number
  }[]
  dailyStats: {
    date: string
    time: number
  }[]
  weeklyStats: {
    week: string
    time: number
  }[]
}
