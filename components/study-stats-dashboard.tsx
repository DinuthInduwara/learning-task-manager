"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Calendar, Clock, TrendingUp, BookOpen, BarChart3, PieChartIcon, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getStudyStats } from "@/lib/study-sessions"
import type { StudyStats } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface StudyStatsDashboardProps {
  className?: string
}

export function StudyStatsDashboard({ className }: StudyStatsDashboardProps) {
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30)

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const data = await getStudyStats(timeRange)
      setStats(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load study statistics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [timeRange])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatTimeDetailed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  // Prepare chart data
  const dailyChartData =
    stats?.dailyStats.map((stat) => ({
      date: new Date(stat.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: Math.round(stat.time / 60), // Convert to minutes
      timeFormatted: formatTime(stat.time),
    })) || []

  const subjectChartData =
    stats?.subjectBreakdown.map((subject) => ({
      ...subject,
      timeMinutes: Math.round(subject.time / 60),
      timeFormatted: formatTime(subject.time),
    })) || []

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"]

  if (isLoading) {
    return (
      <Card
        className={cn(
          "backdrop-blur-md bg-card/10 border-border/20 shadow-xl dark:bg-zinc-900/40 dark:border-zinc-800/30",
          className,
        )}
      >
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading study statistics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.sessionsCount === 0) {
    return (
      <Card
        className={cn(
          "backdrop-blur-md bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-purple-200/30 shadow-xl dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800/30 dark:bg-zinc-900/40",
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-60" />
            <h3 className="text-xl font-semibold mb-2 text-purple-900">No Study Data Yet</h3>
            <p className="text-purple-700/70">Start a study session to see your progress statistics!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
            Study Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Track your learning progress and patterns</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              onClick={() => setTimeRange(days as 7 | 30 | 90)}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              className={cn(
                "backdrop-blur-sm",
                timeRange === days
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white dark:from-purple-600 dark:to-blue-600"
                  : "bg-white/50 border-white/60 dark:bg-zinc-800/50 dark:border-zinc-700/60 dark:text-zinc-300",
              )}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50/60 to-blue-100/40 border-blue-200/40 shadow-lg dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800/30 dark:bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatTime(stats.totalTime)}</div>
            <p className="text-xs text-blue-700/70">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-gradient-to-br from-green-50/60 to-green-100/40 border-green-200/40 shadow-lg dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800/30 dark:bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Study Sessions</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.sessionsCount}</div>
            <p className="text-xs text-green-700/70">Total sessions</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-gradient-to-br from-purple-50/60 to-purple-100/40 border-purple-200/40 shadow-lg dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800/30 dark:bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Average Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatTime(stats.averageSession)}</div>
            <p className="text-xs text-purple-700/70">Per session</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-gradient-to-br from-orange-50/60 to-orange-100/40 border-orange-200/40 shadow-lg dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800/30 dark:bg-zinc-900/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.subjectBreakdown.length}</div>
            <p className="text-xs text-orange-700/70">Active subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm dark:bg-zinc-800/50">
          <TabsTrigger value="daily" className="data-[state=active]:bg-white/80">
            <Calendar className="h-4 w-4 mr-2" />
            Daily Progress
          </TabsTrigger>
          <TabsTrigger value="subjects" className="data-[state=active]:bg-white/80">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Subject Breakdown
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-white/80">
            <BarChart3 className="h-4 w-4 mr-2" />
            Study Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <CardHeader>
              <CardTitle className="text-lg">Daily Study Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [`${value} minutes`, "Study Time"]}
                      labelStyle={{ color: "#374151" }}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    <Bar dataKey="time" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl dark:bg-zinc-900/60 dark:border-zinc-800/40">
              <CardHeader>
                <CardTitle className="text-lg">Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ subject, percent }) => `${subject} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="timeMinutes"
                      >
                        {subjectChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`${value} minutes`, "Study Time"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "8px",
                          backdropFilter: "blur(10px)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl dark:bg-zinc-900/60 dark:border-zinc-800/40">
              <CardHeader>
                <CardTitle className="text-lg">Subject Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectChartData.map((subject, index) => (
                    <div
                      key={subject.subject}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/40 backdrop-blur-sm dark:bg-zinc-800/40"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: subject.color || COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium text-sm">{subject.subject}</p>
                          <p className="text-xs text-muted-foreground">{subject.sessions} sessions</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/50">
                        {formatTime(subject.time)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl dark:bg-zinc-900/60 dark:border-zinc-800/40">
            <CardHeader>
              <CardTitle className="text-lg">Study Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      formatter={(value: any) => [`${value} minutes`, "Study Time"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="time"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
