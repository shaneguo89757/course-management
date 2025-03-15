import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ShadcnCalendarView } from "@/components/shadcn-calendar-view"

export default function ShadcnCalendarPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="課程行事曆" description="透過月曆管理與紀錄開課狀況，以及課程上課學員" />
      <div className="grid gap-4">
        <ShadcnCalendarView />
      </div>
    </DashboardShell>
  )
}

