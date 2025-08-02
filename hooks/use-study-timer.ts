"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createStudySession, endStudySession } from "@/lib/study-sessions"
import type { StudySession } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface UseStudyTimerProps {
  onSessionComplete?: (session: StudySession) => void
}

export function useStudyTimer({ onSessionComplete }: UseStudyTimerProps = {}) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [time, setTime] = useState(0) // in seconds
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setHasNotificationPermission(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setHasNotificationPermission(permission === "granted")
        })
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current)
    }
  }, [])

  const sendBreakNotification = useCallback(() => {
    if (hasNotificationPermission && "Notification" in window) {
      new Notification("Study Break Reminder 🌱", {
        body: "You've been studying for 25 minutes. Time for a 5-minute break?",
        icon: "/favicon.ico",
        tag: "study-break",
      })
    }
  }, [hasNotificationPermission])

  const startTimer = useCallback(
    async (taskId: string) => {
      try {
        const session = await createStudySession(taskId)
        setCurrentSession(session)
        setIsRunning(true)
        setIsPaused(false)
        setTime(0)
        startTimeRef.current = Date.now()
        pausedTimeRef.current = 0

        // Start the timer
        intervalRef.current = setInterval(() => {
          const now = Date.now()
          const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000)
          setTime(elapsed)
        }, 1000)

        // Set 25-minute break notification
        notificationTimeoutRef.current = setTimeout(
          () => {
            sendBreakNotification()
          },
          25 * 60 * 1000,
        ) // 25 minutes

        toast({
          title: "Study Session Started! 📚",
          description: "Focus time begins now. You've got this!",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start study session",
          variant: "destructive",
        })
      }
    },
    [sendBreakNotification],
  )

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
      notificationTimeoutRef.current = null
    }

    setIsPaused(true)
    setIsRunning(false)
    pausedTimeRef.current += Date.now() - startTimeRef.current
  }, [])

  const resumeTimer = useCallback(() => {
    if (!isPaused) return

    setIsRunning(true)
    setIsPaused(false)
    startTimeRef.current = Date.now()

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000)
      setTime(elapsed)
    }, 1000)

    // Reset break notification for remaining time
    const remainingBreakTime = Math.max(0, 25 * 60 - time)
    if (remainingBreakTime > 0) {
      notificationTimeoutRef.current = setTimeout(() => {
        sendBreakNotification()
      }, remainingBreakTime * 1000)
    }
  }, [isPaused, time, sendBreakNotification])

  const stopTimer = useCallback(
    async (notes?: string) => {
      if (!currentSession) return

      try {
        // Clear intervals and timeouts
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current)
          notificationTimeoutRef.current = null
        }

        const finalDuration = time
        const completedSession = await endStudySession(currentSession.id, finalDuration, notes)

        setIsRunning(false)
        setIsPaused(false)
        setTime(0)
        setCurrentSession(null)
        startTimeRef.current = 0
        pausedTimeRef.current = 0

        const minutes = Math.floor(finalDuration / 60)
        const seconds = finalDuration % 60

        toast({
          title: "Study Session Complete! 🎉",
          description: `Great work! You studied for ${minutes}m ${seconds}s`,
        })

        onSessionComplete?.(completedSession)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save study session",
          variant: "destructive",
        })
      }
    },
    [currentSession, time, onSessionComplete],
  )

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  return {
    isRunning,
    isPaused,
    time,
    currentSession,
    hasNotificationPermission,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    formatTime,
  }
}
