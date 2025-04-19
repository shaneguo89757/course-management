import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
// import { ShadcnCalendarView } from "@/components/shadcn-calendar-view"
import { ManageCalendarView } from "@/components/calendar/manage-calendar-view"

export default function () {
  return (
    <DashboardShell>
      <div className="grid max-w-3xl mx-auto">
        <DashboardHeader heading="課程行事曆" description="透過月曆管理與紀錄開課狀況，以及課程上課學員" />
        <ManageCalendarView />
      </div>
    </DashboardShell>
  )
}

