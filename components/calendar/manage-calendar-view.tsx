"use client"

import { useState, useEffect } from "react";
import CalendarGrid from "./shadcn-calendar";
import { fakeDayRecords } from "./type";

export function ManageCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date|undefined>(new Date());

  const handleMonthChange = (newMonth: Date) => {
    console.log('handleMonthChange');
  };

  return (
    <div className="flex justify-center">
      <CalendarGrid
        dayRecords={fakeDayRecords}
        selectedDate={selectedDate}
        onSelectedDate={setSelectedDate}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}