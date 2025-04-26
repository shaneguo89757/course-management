import ManageCourseView from "@/components/course/manage-course-view";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function () {
  return (
    <DashboardShell>
      <div className="grid max-w-3xl mx-auto">
        <DashboardHeader heading="課程設定" description="編輯課程分類與課程項目" />
        <ManageCourseView />
      </div>
    </DashboardShell>
  );
}
