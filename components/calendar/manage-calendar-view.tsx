"use client"

import { useState, useEffect } from "react";
import CalendarGrid, { CalendarDayRecord } from "./shadcn-calendar";
import { fakeDayRecords } from "./type";
import EventList from "./calendar-event-list";

export function ManageCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date|undefined>(new Date());
  const [monthRecords, setMonthRecords] = useState<{month: number, dayRecords: CalendarDayRecord[]}>();

  useEffect(() => {
    if (!selectedDate || selectedDate?.getMonth() == monthRecords?.month) {
      return;
    }

    const month = selectedDate.getMonth();
    const dayRecords = fakeDayRecords.filter(dayRecord => dayRecord.date.getMonth() === month);
    setMonthRecords({month, dayRecords});
  }, [selectedDate]);

  return (
    <div className="flex flex-col md:flex-row justify-center gap-4">
      <div className="h-fit">
        <CalendarGrid
          dayRecords={monthRecords?.dayRecords ?? []}
          selectedDate={selectedDate}
          onSelectedDate={setSelectedDate}
          onMonthChange={setSelectedDate}
        />
      </div>
      <div className="flex-1">
        <EventList selectedDate={selectedDate} />
      </div>
    </div>
  );
}