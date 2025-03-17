import { ShadcnCalendarView } from "@/components/shadcn-calendar-view"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function HomePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="行事曆" description="管理課程預約和學生登記" />
      <div className="grid gap-4">
        <ShadcnCalendarView />
      </div>
    </DashboardShell>
  )
}

