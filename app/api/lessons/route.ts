import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, subject, lesson, dueDate, notes } = body

    // Validate required fields
    if (!title || !type || !subject || !lesson) {
      return NextResponse.json({ error: "Missing required fields: title, type, subject, lesson" }, { status: 400 })
    }

    // Validate type
    if (!["Theory", "Video", "Paper"].includes(type)) {
      return NextResponse.json({ error: "Invalid type. Must be Theory, Video, or Paper" }, { status: 400 })
    }

    // Find subject by name
    const { data: subjectData, error: subjectError } = await supabase
      .from("subjects")
      .select("id")
      .eq("name", subject)
      .single()

    if (subjectError || !subjectData) {
      return NextResponse.json({ error: `Subject "${subject}" not found` }, { status: 404 })
    }

    // Create the task
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title,
        type: type.toLowerCase(),
        subject_id: subjectData.id,
        lesson,
        status: "todo",
        due_date: dueDate || null,
        notes: notes || null,
      })
      .select(`
        *,
        subjects (
          id,
          name,
          color
        )
      `)
      .single()

    if (taskError) {
      console.error("Database error:", taskError)
      return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: taskData,
      message: "Lesson created successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject")
    const lesson = searchParams.get("lesson")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    let query = supabase.from("tasks").select(`
        *,
        subjects (
          id,
          name,
          color
        )
      `)

    // Apply filters
    if (subject && subject !== "all") {
      const { data: subjectData } = await supabase.from("subjects").select("id").eq("name", subject).single()

      if (subjectData) {
        query = query.eq("subject_id", subjectData.id)
      }
    }

    if (lesson && lesson !== "all") {
      query = query.eq("lesson", lesson)
    }

    if (type && type !== "all") {
      query = query.eq("type", type)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
