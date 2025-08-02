"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CalendarIcon, Edit } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { updateTask, type Task, type Subject } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

interface EditTaskDialogProps {
  task: Task
  subjects: Subject[]
  onTaskUpdated: () => void
  trigger?: React.ReactNode
}

export function EditTaskDialog({ task, subjects, onTaskUpdated, trigger }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(task.due_date ? parseISO(task.due_date) : undefined)

  // Form state
  const [formData, setFormData] = useState({
    title: task.title,
    subject_id: task.subject_id,
    type: task.type as "theory" | "video" | "paper",
    lesson: task.lesson || "",
    video_url: task.video_url || "",
    notes: task.notes || "",
  })

  // Reset form when task changes
  useEffect(() => {
    setFormData({
      title: task.title,
      subject_id: task.subject_id,
      type: task.type as "theory" | "video" | "paper",
      lesson: task.lesson || "",
      video_url: task.video_url || "",
      notes: task.notes || "",
    })
    setDate(task.due_date ? parseISO(task.due_date) : undefined)
    setError(null)
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title || !formData.subject_id || !formData.type) {
      setError("Please fill in all required fields (Title, Subject, Type)")
      return
    }

    setIsLoading(true)

    try {
      await updateTask(task.id, {
        title: formData.title,
        subject_id: formData.subject_id,
        type: formData.type,
        lesson: formData.lesson || "General",
        video_url: formData.video_url || undefined,
        notes: formData.notes || undefined,
        due_date: date ? format(date, "yyyy-MM-dd") : undefined,
      })

      toast({
        title: "Task Updated! ✏️",
        description: `"${formData.title}" has been updated successfully.`,
      })

      setError(null)
      setOpen(false)
      onTaskUpdated()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update task"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Study Task</DialogTitle>
          <DialogDescription>Update the details of your study task.</DialogDescription>
        </DialogHeader>

        {/* Scrollable form container */}
        <div className="max-h-[70vh] overflow-y-auto pr-2 dark:scrollbar-thin dark:scrollbar-thumb-zinc-700 dark:scrollbar-track-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Title <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="e.g., Study Kinematics Chapter 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="edit-subject">
                Subject <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <SelectItem value="no-subjects" disabled>
                      No subjects available
                    </SelectItem>
                  ) : (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="edit-type">
                Type <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as "theory" | "video" | "paper" })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">📚 Theory Lesson</SelectItem>
                  <SelectItem value="video">🎥 Video Resource</SelectItem>
                  <SelectItem value="paper">📝 Paper Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lesson */}
            <div className="space-y-2">
              <Label htmlFor="edit-lesson">Lesson/Topic</Label>
              <Input
                id="edit-lesson"
                placeholder="e.g., Kinematics, Electrostatics, Calculus"
                value={formData.lesson}
                onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
              />
            </div>

            {/* Video URL (conditional) */}
            {formData.type === "video" && (
              <div className="space-y-2">
                <Label htmlFor="edit-video_url">Video URL</Label>
                <Input
                  id="edit-video_url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>
            )}

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
