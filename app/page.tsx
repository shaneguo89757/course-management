"use client"
import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { DashboardRouter } from "@/components/dashboard/dashboard-router"

export default function HomePage() {
  const [activeNav, setActiveNav] = useState("行事曆")
  
  return (
    <div className="flex h-full flex-col">
      <MainNav activeNav={activeNav} onNavChange={setActiveNav} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
            <DashboardRouter activeNav={activeNav} />
        </div>
      </main>
    </div>
  )
}