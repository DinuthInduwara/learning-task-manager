"use client"

import { useState } from "react"
import { BookOpen, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Task } from "@/lib/database"
import { cn } from "@/lib/utils"

interface LessonOverviewProps {
  lessons: string[]
  tasks: Task[]
}

interface LessonStats {
  lesson: string
  totalTasks: number
  completedTasks: number
  progress: number
  subjects: { name: string; color: string; count: number }[]
  tasksByType: { theory: number; video: number; paper: number }
  recentTasks: Task[]
}

export function LessonOverview({ lessons, tasks }: LessonOverviewProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  const toggleLesson = (lesson: string) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(lesson)) {
        newSet.delete(lesson)
      } else {
        newSet.add(lesson)
      }
      return newSet
    })
  }

  // Calculate lesson statistics
  const lessonStats: LessonStats[] = lessons
    .map((lesson) => {
      const lessonTasks = tasks.filter((task) => task.lesson === lesson)
      const completedTasks = lessonTasks.filter((task) => task.status === "done")

      // Group by subjects
      const subjectMap = new Map()
      lessonTasks.forEach((task) => {
        if (task.subjects) {
          const key = task.subjects.id
          if (subjectMap.has(key)) {
            subjectMap.set(key, {
              ...subjectMap.get(key),
              count: subjectMap.get(key).count + 1,
            })
          } else {
            subjectMap.set(key, {
              name: task.subjects.name,
              color: task.subjects.color,
              count: 1,
            })
          }
        }
      })

      // Count by type
      const tasksByType = {
        theory: lessonTasks.filter((t) => t.type === "theory").length,
        video: lessonTasks.filter((t) => t.type === "video").length,
        paper: lessonTasks.filter((t) => t.type === "paper").length,
      }

      return {
        lesson,
        totalTasks: lessonTasks.length,
        completedTasks: completedTasks.length,
        progress: lessonTasks.length > 0 ? (completedTasks.length / lessonTasks.length) * 100 : 0,
        subjects: Array.from(subjectMap.values()),
        tasksByType,
        recentTasks: lessonTasks
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3),
      }
    })
    .sort((a, b) => b.totalTasks - a.totalTasks)

  if (lessons.length === 0) {
    return (
      <Card className="backdrop-blur-md bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-200/30 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-indigo-400 mx-auto mb-4 opacity-60" />
            <h3 className="text-xl font-semibold mb-2 text-indigo-900">No Lessons Yet</h3>
            <p className="text-indigo-700/70">Create some tasks with lesson topics to see your progress here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Lesson Progress
        </h2>
        <p className="text-muted-foreground mt-1">
          Track your progress across {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Lessons Grid */}
      <div className="grid gap-4">
        {lessonStats.map((stats) => (
          <Card
            key={stats.lesson}
            className="backdrop-blur-md bg-gradient-to-br from-white/60 to-white/30 border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <Collapsible open={expandedLessons.has(stats.lesson)} onOpenChange={() => toggleLesson(stats.lesson)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/20 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{stats.lesson}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {stats.completedTasks} of {stats.totalTasks} tasks completed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{Math.round(stats.progress)}%</div>
                        <div className="text-xs text-muted-foreground">Complete</div>
                      </div>
                      <Button variant="ghost" size="sm" className="p-2">
                        <TrendingUp
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedLessons.has(stats.lesson) && "rotate-180",
                          )}
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <Progress value={stats.progress} className="h-2 bg-white/50" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* Subject Distribution */}
                  {stats.subjects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Subjects</h4>
                      <div className="flex flex-wrap gap-2">
                        {stats.subjects.map((subject) => (
                          <Badge key={subject.name} variant="outline" className="bg-white/50 border-white/60">
                            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: subject.color }} />
                            {subject.name} ({subject.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Task Type Distribution */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Task Types</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {stats.tasksByType.theory > 0 && (
                        <div className="text-center p-2 rounded-lg bg-blue-50/50 backdrop-blur-sm">
                          <div className="text-lg font-semibold text-blue-600">{stats.tasksByType.theory}</div>
                          <div className="text-xs text-blue-700">📚 Theory</div>
                        </div>
                      )}
                      {stats.tasksByType.video > 0 && (
                        <div className="text-center p-2 rounded-lg bg-purple-50/50 backdrop-blur-sm">
                          <div className="text-lg font-semibold text-purple-600">{stats.tasksByType.video}</div>
                          <div className="text-xs text-purple-700">🎥 Video</div>
                        </div>
                      )}
                      {stats.tasksByType.paper > 0 && (
                        <div className="text-center p-2 rounded-lg bg-green-50/50 backdrop-blur-sm">
                          <div className="text-lg font-semibold text-green-600">{stats.tasksByType.paper}</div>
                          <div className="text-xs text-green-700">📝 Paper</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Tasks */}
                  {stats.recentTasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Tasks</h4>
                      <div className="space-y-2">
                        {stats.recentTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/40 backdrop-blur-sm"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {task.status === "done" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span
                                className={cn(
                                  "text-sm truncate",
                                  task.status === "done" && "line-through text-muted-foreground",
                                )}
                              >
                                {task.title}
                              </span>
                            </div>
                            <Badge
                              variant={task.status === "done" ? "default" : "secondary"}
                              className="text-xs ml-2 flex-shrink-0"
                            >
                              {task.status === "done" ? "✅" : "📋"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  )
}
