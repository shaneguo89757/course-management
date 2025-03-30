"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, CalendarRange } from "lucide-react"

import { cn } from "@/lib/utils"
import { AuthNav } from "./auth-nav"

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "課程行事曆",
      href: "/shadcn-calendar",
      icon: CalendarRange,
    },
    {
      title: "學員管理",
      href: "/students",
      icon: Users,
    },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 justify-between">
        <div className="mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold">課程管理系統</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
          <AuthNav />
        </div>
      </div>
    </nav>
  )
}

