import { getSupabaseClient, type Subject, type Task } from "./supabase-client"

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

// Subjects
export async function getSubjects(): Promise<Subject[]> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("subjects").select("*").order("name")

    if (error) {
      console.error("Error fetching subjects:", error)
      throw new Error(`Failed to fetch subjects: ${error.message}`)
    }

    return data || []
  })
}

export async function createSubject(name: string, color: string): Promise<Subject> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("subjects").insert({ name, color }).select().single()

    if (error) {
      console.error("Error creating subject:", error)
      throw new Error(`Failed to create subject: ${error.message}`)
    }

    return data
  })
}

export async function deleteSubject(id: string): Promise<void> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("subjects").delete().eq("id", id)

    if (error) {
      console.error("Error deleting subject:", error)
      throw new Error(`Failed to delete subject: ${error.message}`)
    }
  })
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        subjects (
          id,
          name,
          color
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tasks:", error)
      throw new Error(`Failed to fetch tasks: ${error.message}`)
    }

    return data || []
  })
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "subjects">): Promise<Task> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select(`
        *,
        subjects (
          id,
          name,
          color
        )
      `)
      .single()

    if (error) {
      console.error("Error creating task:", error)
      throw new Error(`Failed to create task: ${error.message}`)
    }

    return data
  })
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        subjects (
          id,
          name,
          color
        )
      `)
      .single()

    if (error) {
      console.error("Error updating task:", error)
      throw new Error(`Failed to update task: ${error.message}`)
    }

    return data
  })
}

export async function deleteTask(id: string): Promise<void> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Error deleting task:", error)
      throw new Error(`Failed to delete task: ${error.message}`)
    }
  })
}

export async function completeTask(id: string): Promise<Task> {
  return updateTask(id, {
    status: "done",
    completed_at: new Date().toISOString(),
  })
}

export async function uncompleteTask(id: string): Promise<Task> {
  return updateTask(id, {
    status: "todo",
    completed_at: undefined,
  })
}

// Lessons
export async function getLessons(): Promise<string[]> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("lesson")
      .not("lesson", "is", null)
      .not("lesson", "eq", "")

    if (error) {
      console.error("Error fetching lessons:", error)
      throw new Error(`Failed to fetch lessons: ${error.message}`)
    }

    const uniqueLessons = [...new Set(data?.map((item) => item.lesson).filter(Boolean))] as string[]
    return uniqueLessons.sort()
  })
}

export async function getLessonsBySubject(subjectId: string): Promise<string[]> {
  return withRetry(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("tasks")
      .select("lesson")
      .eq("subject_id", subjectId)
      .not("lesson", "is", null)
      .not("lesson", "eq", "")

    if (error) {
      console.error("Error fetching lessons by subject:", error)
      throw new Error(`Failed to fetch lessons by subject: ${error.message}`)
    }

    const uniqueLessons = [...new Set(data?.map((item) => item.lesson).filter(Boolean))] as string[]
    return uniqueLessons.sort()
  })
}
