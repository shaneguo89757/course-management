"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Edit, Save, Settings, Users, Pencil, CalendarPlus2 } from "lucide-react"

import { ManageCourseDialog } from "@/components/manage-course-dialog"
import { useCourses } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Badge } from "@/components/ui/badge"

export function CalendarView() {
  const { courses, simplifiedAddMode, toggleSimplifiedAddMode, hasCourse, courseHasStudents, batchUpdateCourses } =
    useCourses()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [managingCourse, setManagingCourse] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [initialSelectedDates, setInitialSelectedDates] = useState<Set<string>>(new Set())

  const isMobile = useMediaQuery("(max-width: 640px)")

  // 生成當月日曆
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // 當月第一天
    const firstDay = new Date(year, month, 1)
    // 當月最後一天
    const lastDay = new Date(year, month + 1, 0)

    // 計算日曆需要顯示的第一天（可能是上個月的某天）
    const firstDayOfCalendar = new Date(firstDay)
    const dayOfWeek = firstDay.getDay()
    firstDayOfCalendar.setDate(firstDay.getDate() - dayOfWeek)

    // 計算日曆需要顯示的最後一天（可能是下個月的某天）
    const lastDayOfCalendar = new Date(lastDay)
    const remainingDays = 6 - lastDay.getDay()
    lastDayOfCalendar.setDate(lastDay.getDate() + remainingDays)

    // 生成所有日曆天數
    const days: Date[] = []
    const currentDay = new Date(firstDayOfCalendar)

    while (currentDay <= lastDayOfCalendar) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    setCalendarDays(days)
  }, [currentDate])

  // 進入編輯模式時，初始化已選擇的日期
  useEffect(() => {
    if (editMode) {
      const currentSelected = new Set<string>()

      // 將當前有課程的日期加入已選擇集合
      calendarDays.forEach((day) => {
        const dateString = formatDate(day)
        if (hasCourse(dateString)) {
          currentSelected.add(dateString)
        }
      })

      setSelectedDates(currentSelected)
      setInitialSelectedDates(new Set(currentSelected))
      // 進入編輯模式時關閉設置面板
      setShowSettings(false)
    }
  }, [editMode, calendarDays, hasCourse])

  // 前一個月
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 下一個月
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 格式化日期為 YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  // 檢查日期是否為當月
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // 檢查日期是否為今天
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // 獲取指定日期的課程
  const getCourseForDate = (date: Date) => {
    const dateString = formatDate(date)
    return courses.find((course) => course.date === dateString && !course.closed)
  }

  // 處理日期點擊
  const handleDateClick = (date: Date) => {
    if (!editMode) return

    const dateString = formatDate(date)

    // 如果課程有學生，不允許取消
    if (courseHasStudents(dateString) && selectedDates.has(dateString)) {
      return
    }

    // 切換日期選擇狀態
    const newSelectedDates = new Set(selectedDates)
    if (newSelectedDates.has(dateString)) {
      newSelectedDates.delete(dateString)
    } else {
      newSelectedDates.add(dateString)
    }

    setSelectedDates(newSelectedDates)
  }

  // 處理管理課程
  const handleManageCourse = (courseId: string) => {
    if (!editMode) {
      setManagingCourse(courseId)
    }
  }

  // 保存課程變更
  const saveCourseChanges = () => {
    // 找出要添加的日期（新選擇的）
    const datesToAdd: string[] = []
    selectedDates.forEach((date) => {
      if (!initialSelectedDates.has(date)) {
        datesToAdd.push(date)
      }
    })

    // 找出要移除的日期（取消選擇的）
    const datesToRemove: string[] = []
    initialSelectedDates.forEach((date) => {
      if (!selectedDates.has(date)) {
        datesToRemove.push(date)
      }
    })

    // 批量更新課程
    batchUpdateCourses(datesToAdd, datesToRemove)

    // 退出編輯模式
    setEditMode(false)
  }

  // 取消編輯
  const cancelEdit = () => {
    setEditMode(false)
    setSelectedDates(new Set())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h2>
        <div className="flex items-center space-x-2">
          {!editMode && (
            <>
              <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)} title="設置">
                <Settings className="h-4 w-4" />
                <span className="sr-only">設置</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setEditMode(true)} title="編輯課程">
                <CalendarPlus2 className="h-4 w-4" />
                <span className="sr-only">編輯課程</span>
              </Button>
            </>
          )}
          {editMode && (
            <>
              <Button variant="outline" onClick={cancelEdit}>
                取消
              </Button>
              <Button variant="default" onClick={saveCourseChanges}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </>
          )}
          {!editMode && (
            <>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">上個月</span>
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">下個月</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 固定高度的狀態區域，避免畫面偏移 */}
      <div className="h-[60px] flex items-center">
        {showSettings && !editMode && (
          <div className="w-full rounded-md border p-4 bg-muted/20">
            <div className="flex items-center space-x-2">
              <Switch id="simplified-mode" checked={simplifiedAddMode} onCheckedChange={toggleSimplifiedAddMode} />
              <Label htmlFor="simplified-mode">簡化新增課程（直接使用"基礎課程"作為預設名稱）</Label>
            </div>
          </div>
        )}

        {editMode && (
          <div className="w-full rounded-md border p-4 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">課程編輯模式</p>
                <p className="text-muted-foreground">點擊日期來開啟或關閉課程。已有學生的課程無法關閉。</p>
              </div>
              <Badge variant="outline" className="ml-2">
                已選擇 {selectedDates.size} 個日期
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center font-medium">
        <div>日</div>
        <div>一</div>
        <div>二</div>
        <div>三</div>
        <div>四</div>
        <div>五</div>
        <div>六</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const course = getCourseForDate(day)
          const isCurrentMonthDay = isCurrentMonth(day)
          const dateString = formatDate(day)
          const isSelected = selectedDates.has(dateString)
          const hasStudents = courseHasStudents(dateString)
          const isBeforeThenToday = day < new Date()

          return (
            <Card
              key={index}
              className={cn(
                "h-[110px] transition-colors", // 固定高度，確保所有格子大小一致
                !isCurrentMonthDay && "opacity-40",
                isToday(day) && "border-primary",
                !isToday(day) && isBeforeThenToday && "opacity-40",
                editMode && isSelected && "bg-blue-100 dark:bg-blue-900",
                editMode && isCurrentMonthDay && "cursor-pointer hover:border-blue-300",
                editMode && hasStudents && isSelected && "bg-blue-200 dark:bg-blue-800",
              )}
              onClick={() => isCurrentMonthDay && handleDateClick(day)}
            >
              <CardContent className="p-2 flex flex-col h-full">
                {/* 日期顯示 - 固定高度 */}
                <div className="text-sm font-medium mb-1 flex justify-between items-center h-6">
                  <span className={cn(isToday(day) && "text-primary font-bold")}>{day.getDate()}</span>
                  {editMode && hasStudents && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      <Users className="h-3 w-3 mr-1" />
                      {course?.students.length}
                    </Badge>
                  )}
                </div>

                {/* 課程內容區域 - 使用 flex-grow 填充剩餘空間 */}
                <div className="flex-grow flex flex-col">
                  {!editMode && course ? (
                    // 有課程時顯示課程信息
                    <div className="mt-1 space-y-1">
                      <div
                        className={cn(
                          "rounded-md p-1 text-xs",
                          "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20",
                        )}
                        onClick={() => handleManageCourse(course.id)}
                      >
                        {/* 在手機版只顯示人數，在桌面版顯示完整信息 */}
                        {isMobile ? (
                          <div className="flex items-center justify-between">
                            <Users className="h-3 w-3" />
                            <span>{course.students.length}</span>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium">{course.title}</div>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{course.students.length}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : !editMode && isCurrentMonthDay ? (
                    // 無課程時顯示空白佔位，保持高度一致
                    <div className="mt-1 h-[42px] flex items-center justify-center"></div>
                  ) : (
                    // 編輯模式或非當月日期時的空白佔位
                    <div className="mt-1 h-[42px]"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
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

