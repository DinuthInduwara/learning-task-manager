"use client"

import { useEffect, useState } from "react"
import { isToday, isPast, parseISO } from "date-fns"
import { Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TaskCard } from "@/components/task-card"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { SubjectProgress } from "@/components/subject-progress"
import { TaskFilters } from "@/components/task-filters"
import { LessonOverview } from "@/components/lesson-overview"
import { TodayTasksSection } from "@/components/today-tasks-section"
import { StudyStatsDashboard } from "@/components/study-stats-dashboard"
import { getSubjects, getTasks, getLessons, type Subject, type Task } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [lessons, setLessons] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedLesson, setSelectedLesson] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [subjectsData, tasksData, lessonsData] = await Promise.all([getSubjects(), getTasks(), getLessons()])
      setSubjects(subjectsData)
      setTasks(tasksData)
      setLessons(lessonsData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load data"
      setError(errorMessage)
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sort tasks by priority: incomplete tasks by due date (ascending), then completed tasks
  const sortTasksByPriority = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      // First, separate completed and incomplete tasks
      if (a.status === "done" && b.status !== "done") return 1
      if (a.status !== "done" && b.status === "done") return -1

      // If both are completed, sort by completion date (most recent first)
      if (a.status === "done" && b.status === "done") {
        if (!a.completed_at && !b.completed_at) return 0
        if (!a.completed_at) return 1
        if (!b.completed_at) return -1
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      }

      // For incomplete tasks, prioritize by due date
      if (a.status !== "done" && b.status !== "done") {
        // Tasks without due dates go to the end
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1

        // Sort by due date (ascending - earliest first)
        const dateA = parseISO(a.due_date)
        const dateB = parseISO(b.due_date)
        return dateA.getTime() - dateB.getTime()
      }

      return 0
    })
  }

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.lesson?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = !selectedSubject || task.subject_id === selectedSubject
    const matchesLesson = !selectedLesson || task.lesson === selectedLesson
    const matchesType = !selectedType || task.type === selectedType
    const matchesStatus = !selectedStatus || task.status === selectedStatus

    return matchesSearch && matchesSubject && matchesLesson && matchesType && matchesStatus
  })

  const sortedTasks = sortTasksByPriority(filteredTasks)

  // Dashboard stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "done").length
  const todayTasks = tasks.filter((task) => task.due_date && isToday(parseISO(task.due_date)) && task.status === "todo")
  const overdueTasks = tasks.filter(
    (task) => task.due_date && isPast(parseISO(task.due_date)) && task.status === "todo",
  )

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedSubject("")
    setSelectedLesson("")
    setSelectedType("")
    setSelectedStatus("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your study plan...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-left">
                  <strong>Connection Error:</strong>
                  <br />
                  {error}
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please check your Supabase configuration and internet connection.
                </p>
                <Button onClick={loadData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Study Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 dark:text-zinc-400">Track your A/L exam preparation progress</p>
          </div>
          <AddTaskDialog subjects={subjects} onTaskAdded={loadData} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50/60 to-blue-100/40 border-blue-200/40 shadow-xl hover:shadow-2xl transition-all duration-300 dark:from-zinc-800/60 dark:to-zinc-700/40 dark:border-zinc-600/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-zinc-200">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-zinc-100">{totalTasks}</div>
              <p className="text-xs text-blue-700/70 dark:text-zinc-400 mt-1">{completedTasks} completed</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-green-50/60 to-green-100/40 border-green-200/40 shadow-xl hover:shadow-2xl transition-all duration-300 dark:from-zinc-800/60 dark:to-zinc-700/40 dark:border-zinc-600/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-zinc-200">Progress</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-zinc-100">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </div>
              <p className="text-xs text-green-700/70 dark:text-zinc-400 mt-1">Overall completion</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50/60 to-indigo-100/40 border-blue-200/40 shadow-xl hover:shadow-2xl transition-all duration-300 dark:from-zinc-800/60 dark:to-zinc-700/40 dark:border-zinc-600/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-zinc-200">Due Today</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-zinc-100">{todayTasks.length}</div>
              <p className="text-xs text-blue-700/70 dark:text-zinc-400 mt-1">Tasks due today</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-red-50/60 to-orange-100/40 border-red-200/40 shadow-xl hover:shadow-2xl transition-all duration-300 dark:from-zinc-800/60 dark:to-zinc-700/40 dark:border-zinc-600/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900 dark:text-zinc-200">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-zinc-100">{overdueTasks.length}</div>
              <p className="text-xs text-red-700/70 dark:text-zinc-400 mt-1">Tasks overdue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-md shadow-lg border border-white/40 dark:bg-zinc-800/60 dark:border-zinc-700/40">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-white/90 data-[state=active]:shadow-md dark:data-[state=active]:bg-zinc-700/90 dark:text-zinc-300"
            >
              Today's Focus
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-white/90 data-[state=active]:shadow-md dark:data-[state=active]:bg-zinc-700/90 dark:text-zinc-300"
            >
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="data-[state=active]:bg-white/90 data-[state=active]:shadow-md dark:data-[state=active]:bg-zinc-700/90 dark:text-zinc-300"
            >
              Subjects
            </TabsTrigger>
            <TabsTrigger
              value="lessons"
              className="data-[state=active]:bg-white/90 data-[state=active]:shadow-md dark:data-[state=active]:bg-zinc-700/90 dark:text-zinc-300"
            >
              Lessons
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white/90 data-[state=active]:shadow-md dark:data-[state=active]:bg-zinc-700/90 dark:text-zinc-300"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6" id="today">
            <TodayTasksSection tasks={tasks} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <StudyStatsDashboard />
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <LessonOverview lessons={lessons} tasks={tasks} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskFilters
              subjects={subjects}
              lessons={lessons}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedLesson={selectedLesson}
              onLessonChange={setSelectedLesson}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onClearFilters={clearFilters}
            />

            <div className="grid gap-4">
              {sortedTasks.length === 0 ? (
                <Card className="backdrop-blur-md bg-gradient-to-br from-gray-50/50 to-white/50 border-gray-200/30 shadow-xl dark:from-zinc-800/50 dark:to-zinc-700/50 dark:border-zinc-600/30">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2 dark:text-zinc-200">No tasks found</h3>
                      <p className="text-muted-foreground mb-4 dark:text-zinc-400">
                        {tasks.length === 0
                          ? "Get started by creating your first study task!"
                          : "Try adjusting your filters or search query."}
                      </p>
                      {tasks.length === 0 && <AddTaskDialog subjects={subjects} onTaskAdded={loadData} />}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Priority indicator */}
                  <div className="text-sm text-muted-foreground mb-2 px-1 dark:text-zinc-400">
                    📋 Tasks sorted by priority: overdue first, then by due date, completed tasks at bottom
                  </div>
                  {sortedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} subjects={subjects} onUpdate={loadData} />
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subject) => (
                <SubjectProgress key={subject.id} subject={subject} tasks={tasks} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
