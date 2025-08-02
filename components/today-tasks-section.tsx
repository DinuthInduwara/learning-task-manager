"use client"

import { useState } from "react"
import { format, isToday, parseISO } from "date-fns"
import { Calendar, Clock, Play, CheckCircle2, BookOpen, Video, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudyTimer } from "@/components/study-timer"
import { completeTask, type Task } from "@/lib/database"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface TodayTasksSectionProps {
  tasks: Task[]
  onUpdate: () => void
}

export function TodayTasksSection({ tasks, onUpdate }: TodayTasksSectionProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set())

  const todayTasks = tasks.filter((task) => task.due_date && isToday(parseISO(task.due_date)) && task.status === "todo")

  const handleCompleteTask = async (task: Task) => {
    setCompletingTasks((prev) => new Set(prev).add(task.id))

    try {
      await completeTask(task.id)
      toast({
        title: "Task Completed! 🎉",
        description: `"${task.title}" has been marked as done.`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete task",
        variant: "destructive",
      })
    } finally {
      setCompletingTasks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(task.id)
        return newSet
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "theory":
        return <BookOpen className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "paper":
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "theory":
        return "Theory"
      case "video":
        return "Video"
      case "paper":
        return "Paper"
      default:
        return "Task"
    }
  }

  if (todayTasks.length === 0) {
    return (
      <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/30 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-60" />
            <h3 className="text-xl font-semibold mb-2 text-blue-900">All Caught Up! 🎉</h3>
            <p className="text-blue-700/70">No tasks due today. Great job staying on track!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Today's Focus
        </h2>
        <p className="text-muted-foreground mt-1">
          {todayTasks.length} task{todayTasks.length !== 1 ? "s" : ""} due today
        </p>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {todayTasks.map((task) => (
          <Card
            key={task.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
              "backdrop-blur-md bg-gradient-to-br from-white/60 to-white/30",
              "border-white/40 shadow-xl hover:shadow-2xl",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-400/10 before:to-purple-400/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
              selectedTask?.id === task.id && "ring-2 ring-blue-400 ring-opacity-60 shadow-blue-200/50",
            )}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold leading-tight text-gray-900 group-hover:text-blue-900 transition-colors">
                    {task.title}
                  </CardTitle>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {/* Subject Badge */}
                    {task.subjects && (
                      <Badge variant="outline" className="text-xs bg-white/50 border-white/60 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: task.subjects.color }} />
                        {task.subjects.name}
                      </Badge>
                    )}

                    {/* Type Badge */}
                    <Badge variant="secondary" className="text-xs bg-white/40 text-gray-700 backdrop-blur-sm">
                      {getTypeIcon(task.type)}
                      <span className="ml-1">{getTypeLabel(task.type)}</span>
                    </Badge>

                    {/* Lesson Badge */}
                    {task.lesson && task.lesson !== "General" && (
                      <Badge variant="outline" className="text-xs bg-white/50 border-white/60 backdrop-blur-sm">
                        📚 {task.lesson}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              {/* Notes */}
              {task.notes && (
                <p className="text-sm text-gray-600 line-clamp-2 bg-white/30 rounded-lg p-2 backdrop-blur-sm">
                  {task.notes}
                </p>
              )}

              {/* Due Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Due: {format(parseISO(task.due_date!), "h:mm a")}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setSelectedTask(task)}
                  size="sm"
                  className={cn(
                    "flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                    "text-white shadow-lg hover:shadow-xl transition-all duration-200",
                    selectedTask?.id === task.id && "from-blue-600 to-blue-700",
                  )}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {selectedTask?.id === task.id ? "Active" : "Start"}
                </Button>

                <Button
                  onClick={() => handleCompleteTask(task)}
                  disabled={completingTasks.has(task.id)}
                  size="sm"
                  variant="outline"
                  className="bg-white/50 border-white/60 hover:bg-green-50 hover:border-green-200 hover:text-green-700 backdrop-blur-sm transition-all duration-200"
                >
                  {completingTasks.has(task.id) ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Study Timer */}
      {selectedTask && (
        <div className="mt-8">
          <StudyTimer
            task={selectedTask}
            onSessionComplete={() => {
              setSelectedTask(null)
              onUpdate()
            }}
            className="max-w-md mx-auto"
          />
        </div>
      )}
    </div>
  )
}
