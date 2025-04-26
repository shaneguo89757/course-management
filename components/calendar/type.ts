import { CalendarDayRecord } from "./shadcn-calendar";

const year = new Date().getFullYear();
const month = new Date().getMonth();
const day = new Date().getDate();

export const fakeDayRecords: CalendarDayRecord[] = [
    { date: new Date(year, month, day + 0), eventCount: 1, isWorkday: true },
    { date: new Date(year, month, day + 1), eventCount: 2, isWorkday: true },
    { date: new Date(year, month, day + 2), eventCount: 3, isWorkday: true },
    { date: new Date(year, month, day + 3), eventCount: 4, isWorkday: true },
    { date: new Date(year, month, day + 4), eventCount: 5, isWorkday: true },
    { date: new Date(year, month, day + 5), eventCount: 6, isWorkday: true },
    { date: new Date(year, month, day + 6), eventCount: 7, isWorkday: true },
    { date: new Date(year, month, day + 7), eventCount: 0, isWorkday: false },
    { date: new Date(year, month, day + 8), eventCount: 0, isWorkday: true }
];
