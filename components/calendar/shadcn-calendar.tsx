"use client"
import { useState } from "react";
import { zhTW } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

export interface CalendarDayRecord {
  date: Date
  eventCount: number
  isWorkday: boolean
}

export interface CalendarGridProps {
  dayRecords: CalendarDayRecord[]
  selectedDate: Date | undefined
  onSelectedDate:any
  onMonthChange: (newMonth: Date) => void
}

export default function CalendarGrid({dayRecords, selectedDate, onSelectedDate, onMonthChange}: CalendarGridProps) {
  const [today] = useState<number>(()=>parseInt(formatDate.yyyyMMdd(new Date())));

  const [dayRecordsMap] = useState<Map<number, CalendarDayRecord>>(()=>{
    const map = new Map<number, CalendarDayRecord>();
    dayRecords.forEach(day => {
      map.set(parseInt(formatDate.yyyyMMdd(day.date)), day);
    });
    return map;
  });

  const isBeforeThenToday = (date: Date) => parseInt(formatDate.yyyyMMdd(date)) < today;

  const getRecord = (date: Date) => dayRecordsMap.get(parseInt(formatDate.yyyyMMdd(date)));

  const handleSelect = (date: Date | undefined) => {
    onSelectedDate(date);
  }

  return (
    <Card>
      <Calendar
        classNames={{
          root: "rounded-md select-none flex justify-center",
          day_today: "underline text-red-500",
          day_selected: "border-2 border-black",
        }}
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        fromDate={new Date(2024, 0, 1)}
        modifiers={{ past: isBeforeThenToday }}
        modifiersClassNames={{
          past: "text-gray-400 opacity-50",
        }}
        showOutsideDays={false}
        locale={zhTW}
        components={{
          DayContent: ({ date }) => <DayItem date={date} record={getRecord(date)} />
        }}
        onMonthChange={onMonthChange}
      />
    </Card>
  )
}

function DayItem({ date, record }: { date: Date, record: CalendarDayRecord | undefined }) {
  
  return (
    <>
    <div className={cn("relative h-9 w-9 flex items-center justify-center")}>
      {record?.isWorkday && <div className="absolute inset-[8px] rounded-full bg-blue-100" />}
      <span className="relative z-10">{date.getDate()}</span>
      {record?.isWorkday && workload(record.eventCount)}
    </div>
    </>
  );
};

function workload(eventCount: number) {
  let workloadState = null;

  switch (eventCount) {
    case 0:
      workloadState = null;
      break;
    case 1:
      workloadState =  (
        <>
          <Badge className="h-1 w-1 rounded-full p-0 bg-blue-500 pointer-events-none" />
        </>
      );
      break;
    case 2:
      workloadState =  (
        <>
          <Badge className="h-1 w-1 rounded-full p-0 bg-blue-500 pointer-events-none" />
          <Badge className="h-1 w-1 rounded-full p-0 bg-blue-500 pointer-events-none" />
        </>
      );
      break;
    case 3:
      workloadState =  (
        <>
          <Badge className="h-1 w-2 rounded-full p-0 bg-blue-500 pointer-events-none" />
          <Badge className="h-1 w-1 rounded-full p-0 bg-blue-500 pointer-events-none" />
        </>
      );
      break;
    case 4:
      workloadState =  (
          <Badge className="h-1 w-4 rounded-full p-0 bg-blue-500 pointer-events-none" />
      );
      break;
    case 5:
      workloadState =  (
        <>
          <Badge className="h-1 w-4 rounded-full p-0 bg-blue-500 pointer-events-none" />
          <Badge className="h-1 w-1 rounded-full p-0 bg-blue-500 pointer-events-none" />
        </>
      );
      break;
    case 6:
      workloadState =  (
          <Badge className="h-1 w-6 rounded-full p-0 bg-blue-500 pointer-events-none" />
      );
      break;

    // overload
    default:
      workloadState = (
        <Badge className="h-1 w-6 rounded-full p-0 bg-red-500 pointer-events-none" />
      );
      break;
  }

  return (
    <>
    {/* background */}
    {/* <div className="absolute bottom-1 flex items-center gap-0.5">
      <Badge className="h-1 w-6 rounded-full p-0 bg-gray-100 pointer-events-none"/>
    </div> */}

    {/* workload */}
    <div className="absolute bottom-1 flex items-center gap-0.5 pointer-events-none">
      {workloadState}
    </div>
    </>
  );  
}