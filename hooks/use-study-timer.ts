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
  const pausedTimeRef = useRef<number>(0)      // total accumulated paused time
  const pauseStartRef = useRef<number>(0)      // moment pause began

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setHasNotificationPermission(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          setHasNotificationPermission(perm === "granted")
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
        pauseStartRef.current = 0

        // Start the ticking interval
        intervalRef.current = setInterval(() => {
          const now = Date.now()
          const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000)
          setTime(elapsed)
        }, 1000)

        // 25-minute break notification
        notificationTimeoutRef.current = setTimeout(sendBreakNotification, 25 * 60 * 1000)

        toast({ title: "Study Session Started! 📚", description: "Focus time begins now. You've got this!" })
      } catch {
        toast({ title: "Error", description: "Failed to start study session", variant: "destructive" })
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

    // Mark pause start
    pauseStartRef.current = Date.now()

    setIsPaused(true)
    setIsRunning(false)
  }, [])

  const resumeTimer = useCallback(() => {
    if (!isPaused) return

    // Compute how long we were paused, add to total paused time
    const pausedDuration = Date.now() - pauseStartRef.current
    pausedTimeRef.current += pausedDuration
    pauseStartRef.current = 0

    setIsPaused(false)
    setIsRunning(true)

    // Restart ticking interval (do NOT reset startTimeRef)
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000)
      setTime(elapsed)
    }, 1000)

    // Re-schedule break notification for remaining seconds
    const remaining = Math.max(0, 25 * 60 - time)
    if (remaining > 0) {
      notificationTimeoutRef.current = setTimeout(sendBreakNotification, remaining * 1000)
    }
  }, [isPaused, time, sendBreakNotification])

  const stopTimer = useCallback(
    async (notes?: string) => {
      if (!currentSession) return
      try {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current)
          notificationTimeoutRef.current = null
        }

        const finalDuration = time
        const completed = await endStudySession(currentSession.id, finalDuration, notes)

        setIsRunning(false)
        setIsPaused(false)
        setTime(0)
        setCurrentSession(null)
        startTimeRef.current = 0
        pausedTimeRef.current = 0
        pauseStartRef.current = 0

        const mins = Math.floor(finalDuration / 60)
        const secs = finalDuration % 60
        toast({
          title: "Study Session Complete! 🎉",
          description: `Great work! You studied for ${mins}m ${secs}s`,
        })
        onSessionComplete?.(completed)
      } catch {
        toast({ title: "Error", description: "Failed to save study session", variant: "destructive" })
      }
    },
    [currentSession, time, onSessionComplete],
  )

  const formatTime = useCallback((sec: number) => {
    const hh = Math.floor(sec / 3600)
    const mm = Math.floor((sec % 3600) / 60)
    const ss = sec % 60
    if (hh > 0) {
      return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss
        .toString()
        .padStart(2, "0")}`
    }
    return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`
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
