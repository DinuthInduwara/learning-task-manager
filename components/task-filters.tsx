"use client"

import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Subject } from "@/lib/database"

interface TaskFiltersProps {
  subjects: Subject[]
  lessons: string[]
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSubject: string
  onSubjectChange: (subjectId: string) => void
  selectedLesson: string
  onLessonChange: (lesson: string) => void
  selectedType: string
  onTypeChange: (type: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  onClearFilters: () => void
}

export function TaskFilters({
  subjects,
  lessons,
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedLesson,
  onLessonChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters = searchQuery || selectedSubject || selectedLesson || selectedType || selectedStatus

  const clearIndividualFilter = (filterType: string) => {
    switch (filterType) {
      case "search":
        onSearchChange("")
        break
      case "subject":
        onSubjectChange("")
        break
      case "lesson":
        onLessonChange("")
        break
      case "type":
        onTypeChange("")
        break
      case "status":
        onStatusChange("")
        break
    }
  }

  return (
    <Card className="backdrop-blur-md bg-white/60 border-white/40 shadow-lg dark:bg-zinc-900/60 dark:border-zinc-800/40">
      <CardContent className="p-4 space-y-4">
        {/* Search and Clear */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, notes, or lessons..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/70 border-white/60 backdrop-blur-sm dark:bg-zinc-800/70 dark:border-zinc-700/60"
            />
          </div>
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="sm"
              className="bg-white/50 border-white/60 dark:bg-zinc-800/50 dark:border-zinc-700/60"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subject Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Subject</label>
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="bg-white/70 border-white/60 backdrop-blur-sm dark:bg-zinc-800/70 dark:border-zinc-700/60">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lesson Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Lesson</label>
            <Select value={selectedLesson} onValueChange={onLessonChange}>
              <SelectTrigger className="bg-white/70 border-white/60 backdrop-blur-sm dark:bg-zinc-800/70 dark:border-zinc-700/60">
                <SelectValue placeholder="All lessons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lessons</SelectItem>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson} value={lesson}>
                    {lesson}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Type</label>
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger className="bg-white/70 border-white/60 backdrop-blur-sm dark:bg-zinc-800/70 dark:border-zinc-700/60">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="theory">📚 Theory</SelectItem>
                <SelectItem value="video">🎥 Video</SelectItem>
                <SelectItem value="paper">📝 Paper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Status</label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="bg-white/70 border-white/60 backdrop-blur-sm dark:bg-zinc-800/70 dark:border-zinc-700/60">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">📋 To Do</SelectItem>
                <SelectItem value="done">✅ Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/30 dark:border-zinc-700/30">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
              <Filter className="h-4 w-4" />
              <span>Active filters:</span>
            </div>

            {searchQuery && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                Search: "{searchQuery}"
                <button onClick={() => clearIndividualFilter("search")} className="ml-1 hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedSubject && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                Subject: {subjects.find((s) => s.id === selectedSubject)?.name}
                <button onClick={() => clearIndividualFilter("subject")} className="ml-1 hover:text-green-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedLesson && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                Lesson: {selectedLesson}
                <button onClick={() => clearIndividualFilter("lesson")} className="ml-1 hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedType && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                Type: {selectedType}
                <button onClick={() => clearIndividualFilter("type")} className="ml-1 hover:text-orange-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedStatus && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                Status: {selectedStatus}
                <button onClick={() => clearIndividualFilter("status")} className="ml-1 hover:text-gray-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
