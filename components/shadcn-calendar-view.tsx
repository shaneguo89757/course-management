"use client"

import type React from "react"

import { useState } from "react"
import { format, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns"
import { zhTW } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { DayProps } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ManageCourseDialog } from "@/components/manage-course-dialog"
import { useCourses } from "@/lib/data"
import { cn } from "@/lib/utils"

export function ShadcnCalendarView() {
  const { courses } = useCourses()
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [managingCourse, setManagingCourse] = useState<string | null>(null)

  // 格式化日期為 YYYY-MM-DD
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  // 獲取指定日期的課程
  const getCourseForDate = (date: Date | undefined) => {
    if (!date) return null
    const dateString = formatDate(date)
    return courses.find((course) => course.date === dateString && !course.closed)
  }

  // 處理管理課程
  const handleManageCourse = (courseId: string) => {
    setManagingCourse(courseId)
  }

  // 獲取當前月份的所有課程日期
  const getCourseDates = () => {
    return courses.filter((course) => !course.closed).map((course) => new Date(course.date))
  }

  // 當前選中日期的課程
  const selectedCourse = getCourseForDate(selectedDate)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{format(date, "yyyy年MM月", { locale: zhTW })}</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setDate(subMonths(date, 1))}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">上個月</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDate(addMonths(date, 1))}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">下個月</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-5">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                numberOfMonths={3}
                selected={date}
                onSelect={(day) => setDate(day as Date)}
                className="rounded-md border"
                showOutsideDays={false}
                locale={zhTW}
                components={{
                  Day: (props: DayProps) => {
                    const { date: day, displayMonth } = props
                    if (!day) {
                      return null
                    }

                    const course = getCourseForDate(day)
                    const isSelected = date ? isSameDay(day, date) : false
                    const isBeforeThenToday = day < new Date()

                    return (
                      <div
                        className={cn(
                          // 基礎樣式
                          "relative flex h-9 w-9 items-center justify-center p-0 font-normal rounded-md scale-95",
                          // 添加 hover 效果，改為灰色背景
                          "transition-all duration-200 ease-in-out hover:scale-100 hover:shadow-md hover:bg-gray-100",
                          // 如果有課程，添加淺藍色背景
                          course && "bg-blue-100 text-blue-600 hover:bg-gray-100",
                          // 如果是選中的日期
                          isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                          // 如果是過去的日期
                          !isSelected && isBeforeThenToday && "opacity-40",
                        )}
                      >
                        {day.getDate()}
                        {course && (
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                            <Badge variant="outline" className="h-1.5 w-1.5 rounded-full p-0 bg-blue-500" />
                          </div>
                        )}
                      </div>
                    )
                  }
                }}
                modifiersClassNames={{
                  today: "bg-accent text-accent-foreground",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, "yyyy年MM月dd日", { locale: zhTW }) : "選擇日期"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCourse ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedCourse.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{selectedCourse.students.length} 位學員</span>
                    </div>
                  </div>
                  <Button onClick={() => handleManageCourse(selectedCourse.id)} className="w-full">
                    管理課程
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedDate ? "這一天沒有課程" : "請選擇一個日期"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {managingCourse && (
        <ManageCourseDialog
          courseId={managingCourse}
          open={!!managingCourse}
          onOpenChange={(open) => {
            if (!open) setManagingCourse(null)
          }}
        />
      )}
    </div>
  )
}

