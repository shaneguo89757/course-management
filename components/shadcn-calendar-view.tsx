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
  const { courses, addCourse, fetchCourses } = useCourses();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [managingCourse, setManagingCourse] = useState<string | null>(null);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const checkScreenSize = () => {
    const width = window.innerWidth;
    if (width >= 1200) {
      setNumberOfMonths(3);
    } else if (width >= 992) {
      setNumberOfMonths(2);
    } else {
      setNumberOfMonths(1);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await fetchCourses();
    setIsLoading(false);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const getCourseForDate = (date: Date | undefined) => {
    if (!date) return null;
    const dateString = formatDate(date);
    return courses.find((course) => course.date === dateString) || null;
  };
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    // loadData();
    fetchCourses();
    checkScreenSize();

    if (window.innerWidth >= 768) {
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const course = getCourseForDate(selectedDate);
      setSelectedCourse(course);
    } else {
      setSelectedCourse(null);
    }
  }, [selectedDate, courses]);

  if (isLoading) {
    return <div>載入中...</div>;
  }

  return (
    <div className="space-y-4">
      <CalendarHeader date={date} />
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <CalendarGrid 
          date={date}
          selectedDate={selectedDate}
          setDate={setDate}
          setSelectedDate={setSelectedDate}
          numberOfMonths={numberOfMonths}
          getCourseForDate={getCourseForDate}
        />

        <CalendarSidebar 
          selectedDate={selectedDate}
          selectedCourse={selectedCourse}
          setManagingCourse={setManagingCourse}
          addCourse={addCourse}
          formatDate={formatDate}
        />
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

// Calendar Header Component
function CalendarHeader({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold">
        {format(date, "yyyy年MM月", { locale: zhTW })}
      </h2>
    </div>
  )
}

// Calendar Grid Component
function CalendarGrid({ 
  date, 
  selectedDate, 
  setDate, 
  setSelectedDate, 
  numberOfMonths,
  getCourseForDate 
}: { 
  date: Date
  selectedDate: Date | undefined
  setDate: (date: Date) => void
  setSelectedDate: (date: Date) => void
  numberOfMonths: number
  getCourseForDate: (date: Date | undefined) => any
}) {
  return (
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
                  <CalendarDay 
                    day={day}
                    course={course}
                    isSelected={isSelected}
                    isBeforeThenToday={isBeforeThenToday}
                    onSelect={() => {
                      setDate(day)
                      setSelectedDate(day)
                    }}
                  />
                )
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Calendar Day Component
function CalendarDay({ 
  day, 
  course, 
  isSelected, 
  isBeforeThenToday,
  onSelect 
}: { 
  day: Date
  course: any
  isSelected: boolean
  isBeforeThenToday: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center p-0 font-normal rounded-md scale-95",
        "transition-all duration-200 ease-in-out hover:scale-100 hover:shadow-md hover:bg-gray-100",
        course && "bg-blue-100 text-blue-600 hover:bg-gray-100",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
        !isSelected && isBeforeThenToday && "opacity-40",
        "text-lg font-medium"
      )}
    >
      {day.getDate()}
      {course && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <Badge 
            variant="outline" 
            className={cn(
              "h-1.5 w-1.5 rounded-full p-0",
              course.students.length >= 4 ? "bg-red-500" : "bg-blue-500"
            )} 
          />
        </div>
      )}
    </div>
  )
}

// Calendar Sidebar Component
function CalendarSidebar({ 
  selectedDate, 
  selectedCourse, 
  setManagingCourse, 
  addCourse, 
  formatDate 
}: { 
  selectedDate: Date | undefined
  selectedCourse: any
  setManagingCourse: (id: string | null) => void
  addCourse: (date: string, name: string) => void
  formatDate: (date: Date | undefined) => string
}) {
  return (
    <div className="md:col-span-2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? format(selectedDate, "yyyy年MM月dd日", { locale: zhTW }) 
              : "選擇日期"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCourse ? (
            <CourseDetails 
              course={selectedCourse} 
              onManage={() => setManagingCourse(selectedCourse.id)} 
            />
          ) : (
            <NoCourseView 
              selectedDate={selectedDate}
              onAddCourse={() => addCourse(formatDate(selectedDate), "基礎課程")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Course Details Component
function CourseDetails({ course, onManage }: { course: any, onManage: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{course.name}</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>{course.students.length} 位學員</span>
        </div>
      </div>
      <Button 
        onClick={onManage}
        className="w-full transform transition-transform duration-200 hover:scale-[1.02] active:scale-95"
      >
        管理課程
      </Button>
    </div>
  )
}

// No Course View Component
function NoCourseView({ selectedDate, onAddCourse }: { selectedDate: Date | undefined, onAddCourse: () => void }) {
  return (
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
          onClick={onAddCourse}
          className="w-full transform transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          新增課程
        </Button>
      )}
    </div>
  )
}

