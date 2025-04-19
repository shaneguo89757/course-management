"use client"

import { useState, useEffect } from "react";
import CalendarGrid from "./shadcn-calendar";
import { fakeDayRecords } from "./type";
import EventList from "./calendar-event-list";

export function ManageCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date|undefined>(new Date());

  const handleMonthChange = (newMonth: Date) => {
    console.log('handleMonthChange');
  };

  return (
    <div className="flex flex-col md:flex-row justify-center gap-4">
      <div className="h-fit">
        <CalendarGrid
          dayRecords={fakeDayRecords}
          selectedDate={selectedDate}
          onSelectedDate={setSelectedDate}
          onMonthChange={handleMonthChange}
        />
      </div>
      <div className="flex-1">
        <EventList selectedDate={selectedDate} />
      </div>
    </div>
  );
}