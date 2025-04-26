"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

interface DashboardRouterProps {
  activeNav: string;
}

export function DashboardRouter({ activeNav }: DashboardRouterProps) {
  switch (activeNav) {
    case "行事曆":
      return <CalendarPage />;
    case "課程":
      return <CoursePage />;
    case "學員":
      return <StudentPage />;
    default:
      return null;
  }
}

// 行事曆
const ManageCalendarView = dynamic(() => import('@/components/calendar/manage-calendar-view').then(mod => mod.ManageCalendarView), {
    loading: () => <div className="flex items-center justify-center h-64">載入中...</div>
})
  
function CalendarPage() {
  return (
    <div className="grid max-w-3xl mx-auto">
      <Suspense fallback={<div className="flex items-center justify-center h-64">載入中...</div>}>
        <ManageCalendarView />
      </Suspense>
    </div>
  );
}

// 課程
const ManageCourseView = dynamic(() => import('@/components/course/manage-course-view').then(mod => mod.default), {
    loading: () => <div className="flex items-center justify-center h-64">載入中...</div>
})

function CoursePage() {
  return (
    <div className="grid max-w-3xl mx-auto">
      <Suspense fallback={<div className="flex items-center justify-center h-64">載入中...</div>}>
        <ManageCourseView />
      </Suspense>
    </div>
  );
}

// 學員
function StudentPage() {
  return (
    <div className="grid max-w-3xl mx-auto">
      {/* 這裡可以加入學員管理組件 */}
    </div>
  );
} 