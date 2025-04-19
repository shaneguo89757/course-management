"use client"

import ManageCourseView from "@/components/course/manage-course-view"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"

export default function CourseManagementPage() {
    return (
        <DashboardShell>
        <DashboardHeader heading="課程設定" description="編輯課程分類與課程項目" />
            <div className="grid gap-4">
                <ManageCourseView />
            </div>
        </DashboardShell>
    )
}
