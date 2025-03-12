"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users } from "lucide-react"

import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "行事曆",
      href: "/",
      icon: Calendar,
    },
    {
      title: "學員管理",
      href: "/students",
      icon: Users,
    },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold">課程管理系統</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </nav>
  )
}

