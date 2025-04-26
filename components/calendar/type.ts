import { create } from "zustand";
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

export interface EventStudent {
  id: number;
  name: string;
}

export const fakeEventStudents: EventStudent[] = [
  { id: 1, name: "張三1" },
  { id: 2, name: "李四1" },
  { id: 3, name: "王五1" },
  { id: 4, name: "張三1" },
  { id: 5, name: "李四1" },
  { id: 6, name: "王五1" },
  { id: 7, name: "張三1" },
  { id: 8, name: "李四1" },
  { id: 9, name: "王五1" },
  { id: 10, name: "張三1" },
  { id: 11, name: "李四1" },
  { id: 12, name: "王五1" },
  { id: 13, name: "張三1" },
  { id: 16, name: "張三1" },
  { id: 17, name: "李四1" },
  { id: 18, name: "王五1" },
  { id: 19, name: "張三1" },
  { id: 20, name: "李四1" },
  { id: 21, name: "王五1" }
];

export interface CalendarEvent {
  id: number;
  date: Date;
  studentId: number;
  courseId: number;
  isCanceled?: boolean;
}

export const fakeEvents: CalendarEvent[] = [
  { id: 1, date: new Date("2024-01-01"), studentId: 1, courseId: 1, isCanceled: false },
  { id: 2, date: new Date("2024-01-02"), studentId: 2, courseId: 2, isCanceled: false },
  { id: 3, date: new Date("2024-01-03"), studentId: 3, courseId: 3, isCanceled: false },
  { id: 4, date: new Date("2024-01-01"), studentId: 4, courseId: 4, isCanceled: false },
  { id: 5, date: new Date("2024-01-02"), studentId: 5, courseId: 2, isCanceled: false },
  { id: 6, date: new Date("2024-01-03"), studentId: 6, courseId: 3, isCanceled: true },
  { id: 7, date: new Date("2024-01-03"), studentId: 7, courseId: 3, isCanceled: true },
  { id: 8, date: new Date("2024-01-03"), studentId: 8, courseId: 3, isCanceled: true },
  { id: 9, date: new Date("2024-01-03"), studentId: 9, courseId: 3, isCanceled: true },
]