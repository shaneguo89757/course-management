import { formatDate } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { Swatches } from '@mynaui/icons-react';
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CalendarEvent {
  id: number;
  date: Date;
  studentId: number;
  courseId: number;
  status: string;
}

const events: CalendarEvent[] = [
  { id: 1, date: new Date("2024-01-01"), studentId: 1, courseId: 1, status: "active" },
  { id: 2, date: new Date("2024-01-02"), studentId: 2, courseId: 2, status: "active" },
  { id: 3, date: new Date("2024-01-03"), studentId: 3, courseId: 3, status: "active" },
  { id: 4, date: new Date("2024-01-01"), studentId: 4, courseId: 1, status: "active" },
  { id: 5, date: new Date("2024-01-02"), studentId: 5, courseId: 2, status: "active" },
  { id: 6, date: new Date("2024-01-03"), studentId: 6, courseId: 3, status: "inactive" },
  { id: 7, date: new Date("2024-01-03"), studentId: 7, courseId: 3, status: "inactive" },
  { id: 8, date: new Date("2024-01-03"), studentId: 8, courseId: 3, status: "inactive" },
  { id: 9, date: new Date("2024-01-03"), studentId: 9, courseId: 3, status: "inactive" },
]

export default function ({ selectedDate }: { selectedDate: Date | undefined }) {
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold select-none flex items-center gap-2">
          {selectedDate?formatDate(selectedDate, "yyyy-MM-dd"):"未選擇日期"}
          <Badge variant="secondary" className="text-xs h-4 font-normal">7</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto scrollbar-thin px-4">
        <ul id="course-list" className="space-y-1.5">
          {events.map((event, index) => (
            <li key={event.id.toString()}>
              <EventItem name={event.studentId.toString()} courseName={event.courseId.toString()} categoryName={event.courseId.toString()} activeState={event.status === "active"} onClick={() => {}} />
              {index !== events.length - 1 && <Separator/>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function EventItem({ name, courseName, categoryName, activeState, onClick }: { name: string, courseName: string, categoryName: string, activeState: boolean, onClick: () => void}) {
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
        {/* 名稱 */}
        <span className="flex h-8 items-center gap-1 text-lg font-semibold">{name}</span>
        {/* 課程名稱 */}
        <span className="text-xs h-4 pb-0.5 font-normal text-muted-foreground flex items-center gap-1">
          <Swatches />
          <Badge variant="secondary" className="h-4 text-xs font-normal">{courseName}</Badge>
          <Badge variant="outline" className="h-4 text-xs font-normal">{categoryName}</Badge>
        </span>
      </div>
    </Button>
  );
}
