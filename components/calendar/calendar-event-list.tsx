import { formatDate } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { Swatches } from '@mynaui/icons-react';
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react";
import { CalendarEvent, fakeEvents, fakeEventStudents } from "./type";
import { useCourseStore } from "@/components/course/type";
import CalendarEventCreatorDialog from "./calendar-event-creator-dialog";
import CalendarEventEditorDialog from "./calendar-event-editor-dialog";
import { ScrollArea } from "../ui/scroll-area";


export default function ({ selectedDate }: { selectedDate: Date | undefined }) {
  const {courses, courseCategories} = useCourseStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    setEvents(fakeEvents);
  }, [selectedDate]);

  const handleEventSubmit = async (event: CalendarEvent) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sort by active status first, then by id
    setEvents([...events, event].sort((a, b) => {
      if (a.isCanceled !== b.isCanceled) {
        return a.isCanceled ? 1 : -1;
      }
      return Number(a.id) - Number(b.id);
    }));
  }

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setSelectedEvent(null);
  }

  const handleEventDelete = async (eventId: number) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEvents(events.filter(event => event.id !== eventId));
    setSelectedEvent(null);
  }

  const handleEventItem = (event: CalendarEvent) => {
    const student = fakeEventStudents.find(student => student.id === event.studentId);
    const course = courses.find(course => course.id === event.courseId);
    const category = courseCategories.find(category => category.id === course?.categoryId);
    const activeState = !event.isCanceled;

    return {
      studentName: student?.name ?? "學生" + event.studentId,
      courseName: course?.name ?? "課程" + event.courseId,
      categoryName: category?.name ?? "分類" + course?.categoryId,
      activeState: activeState
    }; 
  }
  
  return (
    <Card>
      <CardHeader className="pb-2 pr-4 pl-5 pt-5">
        <CardTitle className="text-lg font-bold select-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedDate?formatDate(selectedDate, "yyyy-MM-dd"):"未選擇日期"}
            <Badge variant="secondary" className="text-xs h-4 font-normal">{events.length}</Badge>
          </div>
          <CalendarEventCreatorDialog defaultDate={selectedDate} onSubmit={handleEventSubmit} />
        </CardTitle>
      </CardHeader>

      <ScrollArea className="h-full h-[400px]">
        <ul id="course-list" className="space-y-1.5">
          {events.map((event, index) => {
            const {studentName, courseName, categoryName, activeState} = handleEventItem(event);
            return (
              <li key={event.id.toString()}>
                <EventItem 
                  name={studentName}
                  courseName={courseName}
                  categoryName={categoryName}
                  activeState={activeState}
                onClick={() => setSelectedEvent(event)}
              />
              {index !== events.length - 1 && <Separator/>}
            </li>
          );
          })}
        </ul>
      </ScrollArea>
      
      {selectedEvent && (
        <CalendarEventEditorDialog 
          event={selectedEvent} 
          onSubmit={handleEventUpdate}
          onDelete={handleEventDelete}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </Card>
  );
}

function EventItem({ name, courseName, categoryName, activeState, onClick }: { 
  name: string, 
  courseName: string, 
  categoryName: string, 
  activeState: boolean, 
  onClick: () => void
}) {
  return (
    <Button 
      variant="ghost"
      className="w-full justify-start h-14 active:scale-105 transform transition-transform duration-200 p-0 select-none"
      onClick={onClick}
    >
      {/* 狀態線 */}
      <div className={cn("h-12 w-1 rounded-full ml-1", activeState ? "bg-blue-500" : "bg-gray-300")}/>

      {/* 內容 */}
      <div className="flex flex-col items-start">
        {/* 學員名稱 */}
        <span className="flex h-8 items-center gap-1 text-lg font-semibold">{name}</span>
          
        {/* 課程名稱 */}
        <span className="flex items-center gap-1">
          <Swatches className="font-bold"/>
          <div className="text-xs h-4 pb-0.5 font-normal text-muted-foreground flex items-center gap-1">
          <Badge variant="secondary" className="h-4 text-xs font-normal">{courseName}</Badge>
          <Badge variant="outline" className="h-4 text-xs font-normal">{categoryName}</Badge>
          </div>
        </span>
      </div>
    </Button>
  );
}
