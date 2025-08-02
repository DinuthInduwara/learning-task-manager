"use client"

import { useState } from "react"
import { format, isToday, isPast } from "date-fns"
import { Calendar, Clock, ExternalLink, MoreHorizontal, Trash2, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { completeTask, uncompleteTask, deleteTask, type Task, type Subject } from "@/lib/database"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  subjects: Subject[]
  onUpdate: () => void
}

export function TaskCard({ task, subjects, onUpdate }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleComplete = async () => {
    setIsLoading(true)
    try {
      if (task.status === "todo") {
        await completeTask(task.id)
        toast({
          title: "Task Completed! 🎉",
          description: `"${task.title}" has been marked as done.`,
        })
      } else {
        await uncompleteTask(task.id)
        toast({
          title: "Task Reopened",
          description: `"${task.title}" has been marked as todo.`,
        })
      }
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return

    setIsLoading(true)
    try {
      await deleteTask(task.id)
      toast({
        title: "Task Deleted",
        description: `"${task.title}" has been deleted.`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "theory":
        return "📚"
      case "video":
        return "🎥"
      case "paper":
        return "📝"
      default:
        return "📋"
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

  const getDueDateStatus = () => {
    if (!task.due_date) return null

    const dueDate = new Date(task.due_date)
    if (isToday(dueDate)) return "today"
    if (isPast(dueDate) && task.status === "todo") return "overdue"
    return "upcoming"
  }

  const dueDateStatus = getDueDateStatus()

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        task.status === "done" && "opacity-75 bg-muted/30",
        dueDateStatus === "overdue" && "border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-900/20",
        dueDateStatus === "today" && "border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-900/20",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Complete Button */}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 rounded-full hover:bg-transparent"
              onClick={handleToggleComplete}
              disabled={isLoading}
            >
              {task.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground hover:text-green-600" />
              )}
            </Button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium text-sm leading-tight",
                  task.status === "done" && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Subject Badge */}
                {task.subjects && (
                  <Badge variant="outline" className="text-xs">
                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: task.subjects.color }} />
                    {task.subjects.name}
                  </Badge>
                )}

                {/* Type Badge */}
                <Badge variant="secondary" className="text-xs">
                  {getTypeIcon(task.type)} {getTypeLabel(task.type)}
                </Badge>

                {/* Lesson Badge */}
                {task.lesson && task.lesson !== "General" && (
                  <Badge variant="outline" className="text-xs">
                    📚 {task.lesson}
                  </Badge>
                )}

                {/* Status Badge */}
                {task.status === "done" && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    ✅ Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleComplete}>
                {task.status === "done" ? (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    Mark as Todo
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Done
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <EditTaskDialog
                  task={task}
                  subjects={subjects}
                  onTaskUpdated={onUpdate}
                  trigger={
                    <div className="flex items-center w-full cursor-pointer">
                      <span className="h-4 w-4 mr-2">✏️</span>
                      Edit Task
                    </div>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Additional Content */}
      {(task.notes || task.video_url || task.due_date) && (
        <CardContent className="pt-0">
          {/* Notes */}
          {task.notes && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.notes}</p>}

          {/* Video Link */}
          {task.video_url && (
            <div className="mb-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-transparent dark:bg-zinc-800/50 dark:border-zinc-700"
                onClick={() => window.open(task.video_url, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Watch Video
              </Button>
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              <span
                className={cn(
                  dueDateStatus === "overdue" && "text-red-600 font-medium dark:text-red-400",
                  dueDateStatus === "today" && "text-blue-600 font-medium dark:text-blue-400",
                )}
              >
                Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                {dueDateStatus === "today" && " (Today)"}
                {dueDateStatus === "overdue" && " (Overdue)"}
              </span>
            </div>
          )}

          {/* Completion Date */}
          {task.status === "done" && task.completed_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3" />
              <span>Completed: {format(new Date(task.completed_at), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
