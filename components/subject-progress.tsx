"use client"

import type React from "react"

import { useMemo } from "react"
import { BookOpen, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Subject, Task } from "@/lib/database"

interface SubjectProgressProps {
  subject: Subject
  tasks: Task[]
}

export function SubjectProgress({ subject, tasks }: SubjectProgressProps) {
  const subjectTasks = tasks.filter((task) => task.subject_id === subject.id)

  const stats = useMemo(() => {
    const total = subjectTasks.length
    const completed = subjectTasks.filter((task) => task.status === "done").length
    const progress = total > 0 ? (completed / total) * 100 : 0

    const byType = {
      theory: subjectTasks.filter((t) => t.type === "theory").length,
      video: subjectTasks.filter((t) => t.type === "video").length,
      paper: subjectTasks.filter((t) => t.type === "paper").length,
    }

    const completedByType = {
      theory: subjectTasks.filter((t) => t.type === "theory" && t.status === "done").length,
      video: subjectTasks.filter((t) => t.type === "video" && t.status === "done").length,
      paper: subjectTasks.filter((t) => t.type === "paper" && t.status === "done").length,
    }

    return {
      total,
      completed,
      progress,
      byType,
      completedByType,
    }
  }, [subjectTasks])

  return (
    <Card className="backdrop-blur-md bg-gradient-to-br from-white/60 to-white/30 border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: `${subject.color}20` }}>
              <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                {subject.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {stats.completed} of {stats.total} tasks completed
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: subject.color }}>
              {Math.round(stats.progress)}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress
            value={stats.progress}
            className="h-2 bg-white/50"
            style={
              {
                "--progress-foreground": subject.color,
              } as React.CSSProperties
            }
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Type Breakdown */}
        {stats.total > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Task Breakdown</h4>
            <div className="grid grid-cols-3 gap-2">
              {/* Theory */}
              {stats.byType.theory > 0 && (
                <div className="text-center p-3 rounded-lg bg-blue-50/50 backdrop-blur-sm border border-blue-200/30">
                  <div className="text-lg font-semibold text-blue-600">
                    {stats.completedByType.theory}/{stats.byType.theory}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">📚 Theory</div>
                  <div className="mt-1">
                    <div className="w-full bg-blue-200/30 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${stats.byType.theory > 0 ? (stats.completedByType.theory / stats.byType.theory) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Video */}
              {stats.byType.video > 0 && (
                <div className="text-center p-3 rounded-lg bg-purple-50/50 backdrop-blur-sm border border-purple-200/30">
                  <div className="text-lg font-semibold text-purple-600">
                    {stats.completedByType.video}/{stats.byType.video}
                  </div>
                  <div className="text-xs text-purple-700 mt-1">🎥 Video</div>
                  <div className="mt-1">
                    <div className="w-full bg-purple-200/30 rounded-full h-1">
                      <div
                        className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${stats.byType.video > 0 ? (stats.completedByType.video / stats.byType.video) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paper */}
              {stats.byType.paper > 0 && (
                <div className="text-center p-3 rounded-lg bg-green-50/50 backdrop-blur-sm border border-green-200/30">
                  <div className="text-lg font-semibold text-green-600">
                    {stats.completedByType.paper}/{stats.byType.paper}
                  </div>
                  <div className="text-xs text-green-700 mt-1">📝 Paper</div>
                  <div className="mt-1">
                    <div className="w-full bg-green-200/30 rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${stats.byType.paper > 0 ? (stats.completedByType.paper / stats.byType.paper) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-white/30">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-700">{stats.completed} done</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{stats.total - stats.completed} pending</span>
            </div>
          </div>

          {stats.progress > 0 && (
            <Badge
              variant="outline"
              className="bg-white/50 border-white/60"
              style={{
                borderColor: `${subject.color}40`,
                color: subject.color,
              }}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {Math.round(stats.progress)}%
            </Badge>
          )}
        </div>

        {/* Empty State */}
        {stats.total === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet for this subject</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
