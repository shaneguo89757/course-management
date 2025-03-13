import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ShadcnCalendarView } from "@/components/shadcn-calendar-view"

export default function ShadcnCalendarPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Shadcn 行事曆" description="使用 Shadcn/UI Calendar 組件的行事曆" />
      <div className="grid gap-4">
        <ShadcnCalendarView />
      </div>
    </DashboardShell>
  )
}

