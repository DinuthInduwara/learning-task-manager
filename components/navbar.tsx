"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Menu, X, BarChart3, Calendar, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Today's Tasks", href: "/#today", icon: Calendar },
    { name: "Test DB", href: "/test-db", icon: Settings },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/20 backdrop-blur-md bg-background/80 shadow-sm dark:bg-zinc-900/80 dark:border-zinc-800/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              StudyPlanner
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-blue-600 hover:bg-accent/50 transition-all duration-200 dark:text-zinc-300 dark:hover:text-blue-400 dark:hover:bg-zinc-800/50"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 backdrop-blur-md bg-background/95 dark:bg-zinc-900/95">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                      StudyPlanner
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="p-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-blue-600 hover:bg-accent/50 transition-all duration-200 w-full dark:text-zinc-300 dark:hover:text-blue-400 dark:hover:bg-zinc-800/50"
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
