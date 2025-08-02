"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, Database, Play, Trash2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getSubjects, getTasks, createSubject, createTask, type Subject, type Task } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

export default function TestDatabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "success" | "error">("testing")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreatingData, setIsCreatingData] = useState(false)
  const [isClearingData, setIsClearingData] = useState(false)

  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const testConnection = async () => {
    setConnectionStatus("testing")
    setConnectionError(null)

    try {
      // Check environment variables
      const envStatus: { [key: string]: boolean } = {}
      requiredEnvVars.forEach((varName) => {
        envStatus[varName] = !!process.env[varName]
      })
      setEnvVars(envStatus)

      // Test Supabase connection
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("subjects").select("count").limit(1)

      if (error) {
        throw new Error(`Supabase connection failed: ${error.message}`)
      }

      setConnectionStatus("success")
      toast({
        title: "Connection Successful! ✅",
        description: "Database connection is working properly.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown connection error"
      setConnectionError(errorMessage)
      setConnectionStatus("error")
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const loadData = async () => {
    try {
      const [subjectsData, tasksData] = await Promise.all([getSubjects(), getTasks()])
      setSubjects(subjectsData)
      setTasks(tasksData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data from database",
        variant: "destructive",
      })
    }
  }

  const createSampleData = async () => {
    setIsCreatingData(true)

    try {
      // Create sample subjects
      const sampleSubjects = [
        { name: "Physics", color: "#3B82F6" },
        { name: "Mathematics", color: "#10B981" },
        { name: "ICT", color: "#8B5CF6" },
      ]

      const createdSubjects = []
      for (const subject of sampleSubjects) {
        try {
          const created = await createSubject(subject.name, subject.color)
          createdSubjects.push(created)
        } catch (error) {
          // Subject might already exist, continue
          console.log(`Subject ${subject.name} might already exist`)
        }
      }

      // Create sample tasks
      if (createdSubjects.length > 0) {
        const sampleTasks = [
          {
            title: "Study Kinematics - Motion in One Dimension",
            subject_id: createdSubjects[0].id,
            type: "theory" as const,
            lesson: "Kinematics",
            notes: "Focus on equations of motion and graphical analysis",
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
            status: "todo" as const,
          },
          {
            title: "Watch Khan Academy - Calculus Derivatives",
            subject_id: createdSubjects[1].id,
            type: "video" as const,
            lesson: "Calculus",
            video_url: "https://www.khanacademy.org/math/calculus-1",
            notes: "Take notes on derivative rules",
            due_date: new Date().toISOString().split("T")[0], // Today
            status: "todo" as const,
          },
          {
            title: "Complete Database Design Past Paper",
            subject_id: createdSubjects[2].id,
            type: "paper" as const,
            lesson: "Database Systems",
            notes: "Focus on normalization and ER diagrams",
            due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Yesterday (overdue)
            status: "todo" as const,
          },
        ]

        for (const task of sampleTasks) {
          try {
            await createTask(task)
          } catch (error) {
            console.log("Task creation error:", error)
          }
        }
      }

      await loadData()

      toast({
        title: "Sample Data Created! 🎉",
        description: "Sample subjects and tasks have been added to your database.",
      })
    } catch (error) {
      console.error("Error creating sample data:", error)
      toast({
        title: "Error",
        description: "Failed to create sample data",
        variant: "destructive",
      })
    } finally {
      setIsCreatingData(false)
    }
  }

  const clearAllData = async () => {
    if (!confirm("Are you sure you want to delete ALL data? This cannot be undone!")) {
      return
    }

    setIsClearingData(true)

    try {
      const supabase = getSupabaseClient()

      // Delete all tasks first (due to foreign key constraints)
      await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      // Delete all subjects
      await supabase.from("subjects").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      await loadData()

      toast({
        title: "Data Cleared",
        description: "All subjects and tasks have been deleted.",
      })
    } catch (error) {
      console.error("Error clearing data:", error)
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      })
    } finally {
      setIsClearingData(false)
    }
  }

  useEffect(() => {
    testConnection()
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Database Connection Test
          </h1>
          <p className="text-muted-foreground">Verify your Supabase connection and test database operations</p>
        </div>

        {/* Connection Status */}
        <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Supabase Connection:</span>
              <div className="flex items-center gap-2">
                {connectionStatus === "testing" && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <Badge variant="secondary">Testing...</Badge>
                  </>
                )}
                {connectionStatus === "success" && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </>
                )}
                {connectionStatus === "error" && (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <Badge variant="destructive">Failed</Badge>
                  </>
                )}
              </div>
            </div>

            {connectionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connection Error:</strong>
                  <br />
                  {connectionError}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={testConnection} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requiredEnvVars.map((varName) => (
                <div key={varName} className="flex items-center justify-between">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{varName}</code>
                  <div className="flex items-center gap-2">
                    {envVars[varName] ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Set
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <Badge variant="destructive">Missing</Badge>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Operations */}
        <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl">
          <CardHeader>
            <CardTitle>Database Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={createSampleData}
                disabled={isCreatingData || connectionStatus !== "success"}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {isCreatingData ? "Creating..." : "Create Sample Data"}
              </Button>

              <Button onClick={loadData} variant="outline" disabled={connectionStatus !== "success"}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>

              <Button
                onClick={clearAllData}
                variant="destructive"
                disabled={isClearingData || connectionStatus !== "success"}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearingData ? "Clearing..." : "Clear All Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Display */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Subjects */}
          <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl">
            <CardHeader>
              <CardTitle>Subjects ({subjects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No subjects found</p>
              ) : (
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/40">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="font-medium">{subject.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {subject.id.slice(0, 8)}...
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-xl">
            <CardHeader>
              <CardTitle>Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tasks found</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-lg bg-white/40 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                        <Badge
                          variant={task.status === "done" ? "default" : "secondary"}
                          className="text-xs flex-shrink-0"
                        >
                          {task.status === "done" ? "✅" : "📋"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {task.subjects && (
                          <Badge variant="outline" className="text-xs">
                            <div
                              className="w-2 h-2 rounded-full mr-1"
                              style={{ backgroundColor: task.subjects.color }}
                            />
                            {task.subjects.name}
                          </Badge>
                        )}

                        <Badge variant="secondary" className="text-xs">
                          {task.type === "theory" && "📚"}
                          {task.type === "video" && "🎥"}
                          {task.type === "paper" && "📝"}
                          {" " + task.type}
                        </Badge>

                        {task.lesson && (
                          <Badge variant="outline" className="text-xs">
                            📚 {task.lesson}
                          </Badge>
                        )}
                      </div>

                      {task.due_date && (
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        {connectionStatus === "success" && (
          <Alert className="backdrop-blur-md bg-green-50/60 border-green-200/40">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Database Connection Successful!</strong>
              <br />
              Your Supabase connection is working properly. You can now use the study planner application.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
