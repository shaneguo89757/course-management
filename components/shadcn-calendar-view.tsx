"use client"
import { useState, useEffect } from "react";
import { format, addMonths } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManageCourseDialog } from "@/components/manage-course-dialog";
import { useCourses } from "@/lib/data/index";
import { cn } from "@/lib/utils";

const getYearMonth = (d: Date) => format(d, "yyyyMM"); // e.g., "202504"
const formatDate = (date: Date | undefined) => {
  if (!date) return "";
  return format(date, "yyyyMMdd");
};

const checkScreenSize = () => {
  const width = window.innerWidth;
  if (width >= 1200) return 3;
  else if (width >= 992) return 2;
  else return 1;
};

export function ShadcnCalendarView() {
  const { addCourse, fetchCourses, getCoursesForMonth, courseMonths } = useCourses();
  const [today] = useState<number>(()=>parseInt(formatDate(new Date())));
  const [nowDate, setNowDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date|undefined>(new Date());
  const [managingCourse, setManagingCourse] = useState<string | null>(null);
  const [numberOfMonths, setNumberOfMonths] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const fetchVisibleMonths = async (currentDate: Date) => {
    const yearMonths = Array.from({ length: numberOfMonths }, (_, i) =>
      getYearMonth(addMonths(currentDate, i))
    );
    await fetchCourses(yearMonths);
  };

  const getCourseForDate = (date: Date | undefined) => {
    if (!date) return null;
    const yearMonth = getYearMonth(date);
    const monthCourses = getCoursesForMonth(yearMonth);
    const yyyyMMdd = parseInt(formatDate(date));
    return monthCourses.find((course) => course.date === yyyyMMdd) || null;
  };

  const isBeforeThenToday = (day: Date) => {
    const yyyyMMdd = parseInt(formatDate(day));
    return yyyyMMdd < today;
  }

  const addCourseToDate = (date: Date) => {
    const yyyyMMdd = parseInt(formatDate(date));
    addCourse(yyyyMMdd, "基礎課程");
  }

  const handleMonthChange = (newMonth: Date) => {
    setNowDate(newMonth);
  };

  useEffect(() => {
    const handleResize = () => {
      const newNumber = checkScreenSize();
      setNumberOfMonths(newNumber);
    };

    handleResize();

    if (window.innerWidth >= 768) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const course = getCourseForDate(selectedDate);
      setSelectedCourse(course);
    } else {
      setSelectedCourse(null);
    }
  }, [selectedDate, courseMonths]);

  useEffect(() => {
    fetchVisibleMonths(nowDate);
  }, [nowDate]);

  const customDay = ({ date }: { date: Date }) => {
    const course = getCourseForDate(date);
    return (
      <div className="relative h-9 w-9 flex items-center justify-center">
        <span>{date.getDate()}</span>
        {course && (
          <Badge
            className={cn(
              "absolute bottom-1 h-1.5 w-1.5 rounded-full p-0", // 沒有編匡
              course.students.length >= 7 ? "bg-red-500" : "bg-blue-500" // 先不做任何顏色變化
            )}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <CalendarGrid
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          numberOfMonths={numberOfMonths}
          isBeforeThenToday={isBeforeThenToday}
          customDay={customDay}
          handleMonthChange={handleMonthChange}
        />
        <CalendarSidebar
          selectedDate={selectedDate}
          selectedCourse={selectedCourse}
          setManagingCourse={setManagingCourse}
          addCourseToDate={addCourseToDate}
        />
      </div>

      {/* 管理課程 Dialog */}
      {managingCourse && (
        <ManageCourseDialog
          courseId={managingCourse}
          open={!!managingCourse}
          onOpenChange={(open) => !open && setManagingCourse(null)}
        />
      )}
    </div>
  );
}

// Calendar Grid Component
function CalendarGrid({ 
  selectedDate, 
  setSelectedDate, 
  numberOfMonths,
  isBeforeThenToday,
  customDay,
  handleMonthChange
}: { 
  selectedDate: Date | undefined
  setSelectedDate:any
  numberOfMonths: number
  isBeforeThenToday: (day: Date) => boolean
  customDay: ({ date }: { date: Date }) => React.ReactNode
  handleMonthChange: (newMonth: Date) => void
}) {
  return (
    <div className="md:col-span-5">
      <Card>
        <CardContent className="w-auto p-0 flex justify-center">
          <Calendar
            classNames={{
              root: "rounded-md border-0 select-none",
              day_today: "underline",
            }}
            mode="single"
            numberOfMonths={numberOfMonths}
            selected={selectedDate}
            onSelect={setSelectedDate}
            fromDate={new Date(2024, 0, 1)}
            modifiers={{ past: isBeforeThenToday }} // 定義過去日期的條件
            modifiersClassNames={{
              past: "text-gray-400 opacity-50", // 過去日期設為灰色
            }}
            showOutsideDays={false}
            locale={zhTW}
            components={{
              DayContent: customDay
            }}
            onMonthChange={handleMonthChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Calendar Sidebar Component
function CalendarSidebar({ 
  selectedDate, 
  selectedCourse, 
  setManagingCourse, 
  addCourseToDate
}: { 
  selectedDate: Date | undefined
  selectedCourse: any
  setManagingCourse: (id: string | null) => void
  addCourseToDate: (date: Date) => void
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
              onAddCourse={addCourseToDate}
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
function NoCourseView({ selectedDate, onAddCourse }: { selectedDate: Date | undefined, onAddCourse: (date: Date) => void }) {
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
          onClick={() => onAddCourse(selectedDate)}
          className="w-full transform transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          新增課程
        </Button>
      )}
    </div>
  )
}

