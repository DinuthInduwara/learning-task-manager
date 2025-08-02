"use client"

import { useState } from "react"
import { Play, Pause, Square, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useStudyTimer } from "@/hooks/use-study-timer"
import type { Task } from "@/lib/database"
import { cn } from "@/lib/utils"

interface StudyTimerProps {
  task: Task
  onSessionComplete?: () => void
  className?: string
}

export function StudyTimer({ task, onSessionComplete, className }: StudyTimerProps) {
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)

  const { isRunning, isPaused, time, currentSession, startTimer, pauseTimer, resumeTimer, stopTimer, formatTime } =
    useStudyTimer({
      onSessionComplete: () => {
        setNotes("")
        setShowNotes(false)
        onSessionComplete?.()
      },
    })

  const handleStart = () => {
    startTimer(task.id)
  }

  const handlePause = () => {
    pauseTimer()
  }

  const handleResume = () => {
    resumeTimer()
  }

  const handleStop = () => {
    if (showNotes) {
      stopTimer(notes)
    } else {
      setShowNotes(true)
    }
  }

  const handleStopWithoutNotes = () => {
    stopTimer()
  }

  const isActive = isRunning || isPaused

  return (
    <Card className={cn("backdrop-blur-md bg-white/10 border-white/20 shadow-xl", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Study Timer
        </CardTitle>
        {task && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="truncate">{task.title}</span>
            {task.subjects && (
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: task.subjects.color }} />
                {task.subjects.name}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div
            className={cn(
              "text-4xl font-mono font-bold transition-all duration-300",
              isRunning && "text-green-600 animate-pulse",
              isPaused && "text-yellow-600",
              !isActive && "text-muted-foreground",
            )}
          >
            {formatTime(time)}
          </div>
          {isActive && (
            <p className="text-sm text-muted-foreground mt-1">{isRunning ? "Focus time active" : "Timer paused"}</p>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-2">
          {!isActive ? (
            <Button onClick={handleStart} className="flex-1 max-w-32">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button onClick={handlePause} variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={handleResume} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={handleStop} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Session Notes */}
        {showNotes && (
          <div className="space-y-3 pt-4 border-t border-white/20">
            <Label htmlFor="session-notes" className="text-sm font-medium">
              Session Notes (Optional)
            </Label>
            <Textarea
              id="session-notes"
              placeholder="How did this study session go? Any insights or challenges?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={() => stopTimer(notes)} size="sm" className="flex-1">
                Save Session
              </Button>
              <Button onClick={handleStopWithoutNotes} variant="outline" size="sm">
                Skip Notes
              </Button>
            </div>
          </div>
        )}

        {/* Current Session Info */}
        {currentSession && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-white/20">
            Session started: {new Date(currentSession.start_time).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
