"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns"
import { zhTW } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { DayProps } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ManageCourseDialog } from "@/components/manage-course-dialog"
import { useCourses } from "@/lib/data/index"
import { cn } from "@/lib/utils"

export function ShadcnCalendarView() {
  const { courses, addCourse, fetchCourses } = useCourses()
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [managingCourse, setManagingCourse] = useState<string | null>(null)
  const [numberOfMonths, setNumberOfMonths] = useState(1)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkScreenSize = () => {
      const width = window.innerWidth
      // 根據不同寬度設定不同的月份數量
      if (width >= 1200) {
        setNumberOfMonths(3)        // 寬螢幕顯示 3 個月
      } else if (width >= 992) {
        setNumberOfMonths(2)        // 中等螢幕顯示 2 個月
      } else {
        setNumberOfMonths(1)        // 小螢幕顯示 1 個月
      }
    }

    fetchCourses()

    // 初始檢查
    checkScreenSize()

    // 在非手機版本時添加 resize 監聽
    if (window.innerWidth >= 768) {
      window.addEventListener('resize', checkScreenSize)
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [fetchCourses]) // 移除 numberOfMonths 依賴，因為我們只需要在組件掛載時設定監聽

  // 格式化日期為 YYYY-MM-DD
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  // 獲取指定日期的課程
  const getCourseForDate = (date: Date | undefined) => {
    if (!date) return null
    const dateString = formatDate(date)
    return courses.find((course) => course.date === dateString)
  }

  // 處理管理課程
  const handleManageCourse = (courseId: string) => {
    setManagingCourse(courseId)
  }

  // 獲取當前月份的所有課程日期
  const getCourseDates = () => {
    return courses.map((course) => new Date(course.date))
  }

  // 獲取所有課程日期
  const courseDates = courses
    .map(course => new Date(course.date))

  // 獲取已滿的課程日期
  const fullCourseDates = courses
    .filter(course => course.students.length >= 4)
    .map(course => new Date(course.date))

  // 獲取尚有空位的課程日期
  const availableCourseDates = courses
    .filter(course => course.students.length < 4)
    .map(course => new Date(course.date))

  // 當前選中日期的課程
  const selectedCourse = getCourseForDate(selectedDate)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{format(date, "yyyy年MM月", { locale: zhTW })}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-5">
          <Card>
            <CardContent className="w-auto p-0 flex justify-center">
                <Calendar
                  className="rounded-md border-0 select-none"
                  mode="single"
                  numberOfMonths={numberOfMonths}
                  selected={selectedDate}
                  onSelect={(day) => {
                    if (day) {
                      setDate(day)
                      setSelectedDate(day)
                    }
                  }}
                  defaultMonth={date}
                  fromDate={new Date(2024, 0, 1)}
                  showOutsideDays={false}
                  locale={zhTW}
                  components={{
                    Day: (props: DayProps) => {
                      const { date: day, displayMonth } = props
                      if (!day || !isSameMonth(day, displayMonth)) {
                        return null
                      }

                      const course = getCourseForDate(day)
                      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                      const isBeforeThenToday = day < new Date()

                      return (
                        <div
                          onClick={() => {
                            setDate(day)
                            setSelectedDate(day)
                          }}
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
                            "text-lg font-medium"  // 這裡添加了文字大小和粗細
                          )}
                        >
                          {day.getDate()}
                          {course && (
                            <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full p-0",
                                  course.students.length >= 4 
                                    ? "bg-red-500"    // 課程滿人時顯示紅色
                                    : "bg-blue-500"   // 課程未滿時顯示藍色
                                )} 
                              />
                            </div>
                          )}
                        </div>
                      )
                    }
                  }}
                  modifiers={{
                    hasClass: courseDates,
                    fullClass: fullCourseDates,
                    availableClass: availableCourseDates,
                    weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                  }}
                  modifiersStyles={{
                    hasClass: {
                      fontWeight: 'bold'
                    },
                    fullClass: {
                      backgroundColor: '#FFE4E1',  // 淺紅色背景
                      color: '#FF6B6B'
                    },
                    availableClass: {
                      backgroundColor: '#98FB98',  // 淺綠色背景
                      color: '#2E8B57'
                    },
                    weekend: {
                      color: '#FF6B6B'  // 週末顯示紅色
                    }
                  }}
                  modifiersClassNames={{
                    hasClass: 'font-bold',
                    fullClass: 'bg-red-100 text-red-600',
                    availableClass: 'bg-green-100 text-green-600',
                    weekend: 'text-red-500'
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
                    <h3 className="font-medium">{selectedCourse.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{selectedCourse.students.length} 位學員</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleManageCourse(selectedCourse.id)} 
                    className="w-full transform transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    管理課程
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium h-6">... 要上班嗎</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{selectedDate ? "這一天沒有課程" : "請選擇一個日期"}</span>
                    </div>
                  </div>
                  {selectedDate && (
                    <Button
                    variant="outline"
                    onClick={() => addCourse(formatDate(selectedDate), "基礎課程")}
                    className="w-full transform transition-transform duration-200 hover:scale-[1.02] active:scale-95">
                      新增課程
                    </Button>
                  )}
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

