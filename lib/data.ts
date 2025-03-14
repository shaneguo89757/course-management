"use client"

import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import { createContext } from "react"

// 學生類型
interface Student {
  id: string
  name: string
  active: boolean
  ig?: string // 新增 Instagram 帳號欄位，可選
}

// 課程類型
interface Course {
  id: string
  date: string // YYYY-MM-DD 格式
  title: string
  students: string[] // 學生 ID 列表
  closed: boolean
}

// 學生狀態管理
interface StudentState {
  students: Student[]
  addStudent: (name: string, ig?: string) => void // 修改：添加 ig 參數
  updateStudentName: (id: string, name: string) => void
  updateStudentIg: (id: string, ig: string) => void // 新增：更新 ig 帳號
  updateStudent: (id: string, data: { name?: string; ig?: string }) => void // 新增：更新學生資料
  toggleStudentStatus: (id: string) => void
}

// 課程狀態管理
interface CourseState {
  courses: Course[]
  simplifiedAddMode: boolean // 控制是否使用簡化模式添加課程
  toggleSimplifiedAddMode: () => void // 切換簡化模式
  addCourse: (date: string, title: string) => void
  closeCourse: (id: string) => void
  addStudentToCourse: (courseId: string, studentId: string) => void
  removeStudentFromCourse: (courseId: string, studentId: string) => void
  // 批量添加學生到課程
  addMultipleStudentsToCourse: (courseId: string, studentIds: string[]) => void
  // 批量處理課程的方法
  batchUpdateCourses: (datesToAdd: string[], datesToRemove: string[]) => void
  // 檢查日期是否有課程
  hasCourse: (date: string) => boolean
  // 檢查課程是否有學生
  courseHasStudents: (date: string) => boolean
}

// 初始學生數據
const initialStudents: Student[] = [
  { id: "1", name: "王小明", active: true, ig: "@wang_xiaoming" },
  { id: "2", name: "李小花", active: true, ig: "@li_flower" },
  { id: "3", name: "張大山", active: true, ig: "@zhang_mountain" },
  { id: "4", name: "陳小雨", active: false, ig: "@chen_rain" },
  { id: "5", name: "林小樹", active: true, ig: "@lin_tree" },
  // 添加更多學生以展示搜尋功能的效果
  { id: "6", name: "黃大偉", active: true, ig: "@huang_david" },
  { id: "7", name: "周小琳", active: true, ig: "@zhou_lin" },
  { id: "8", name: "吳美玲", active: true, ig: "@wu_beauty" },
  { id: "9", name: "劉志明", active: true, ig: "@liu_zhiming" },
  { id: "10", name: "鄭雅文", active: true, ig: "@zheng_yawen" },
  { id: "11", name: "林志玲", active: true },
  { id: "12", name: "張學友", active: true, ig: "@jacky_cheung" },
  { id: "13", name: "王力宏", active: true, ig: "@wangleehom" },
  { id: "14", name: "蔡依林", active: true, ig: "@jolin_tsai" },
  { id: "15", name: "周杰倫", active: true, ig: "@jaychou" },
]

// 初始課程數據
const today = new Date().toISOString().split("T")[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
const initialCourses: Course[] = [
  {
    id: "1",
    date: today,
    title: "基礎課程",
    students: ["1", "3", "5"],
    closed: false,
  },
  {
    id: "2",
    date: tomorrow,
    title: "進階課程",
    students: ["2", "5"],
    closed: false,
  },
]

// 創建學生狀態管理
const useStudentStore = create<StudentState>((set) => ({
  students: initialStudents,
  addStudent: (name, ig) =>
    set((state) => ({
      students: [
        ...state.students,
        {
          id: uuidv4(),
          name,
          active: true,
          ig, // 添加 ig 欄位
        },
      ],
    })),
  updateStudentName: (id, name) =>
    set((state) => ({
      students: state.students.map((student) => (student.id === id ? { ...student, name } : student)),
    })),
  updateStudentIg: (id, ig) =>
    set((state) => ({
      students: state.students.map((student) => (student.id === id ? { ...student, ig } : student)),
    })),
  updateStudent: (id, data) =>
    set((state) => ({
      students: state.students.map((student) => (student.id === id ? { ...student, ...data } : student)),
    })),
  toggleStudentStatus: (id) =>
    set((state) => ({
      students: state.students.map((student) =>
        student.id === id ? { ...student, active: !student.active } : student,
      ),
    })),
}))

// 創建課程狀態管理
const useCourseStore = create<CourseState>((set, get) => ({
  courses: initialCourses,
  simplifiedAddMode: true, // 預設使用簡化模式
  toggleSimplifiedAddMode: () =>
    set((state) => ({
      simplifiedAddMode: !state.simplifiedAddMode,
    })),
  addCourse: (date, title="基礎課程") =>
    set((state) => ({
      courses: [
        ...state.courses,
        {
          id: uuidv4(),
          date,
          title,
          students: [],
          closed: false,
        },
      ],
    })),
  closeCourse: (id) =>
    set((state) => ({
      courses: state.courses.map((course) => (course.id === id ? { ...course, closed: true } : course)),
    })),
  addStudentToCourse: (courseId, studentId) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId ? { ...course, students: [...course.students, studentId] } : course,
      ),
    })),
  // 批量添加學生到課程
  addMultipleStudentsToCourse: (courseId, studentIds) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              students: [...new Set([...course.students, ...studentIds])], // 使用 Set 去重
            }
          : course,
      ),
    })),
  removeStudentFromCourse: (courseId, studentId) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId ? { ...course, students: course.students.filter((id) => id !== studentId) } : course,
      ),
    })),
  // 批量更新課程
  batchUpdateCourses: (datesToAdd, datesToRemove) =>
    set((state) => {
      // 當前課程列表
      let updatedCourses = [...state.courses]

      // 處理要添加的日期
      datesToAdd.forEach((date) => {
        // 檢查該日期是否已有課程
        const existingCourse = updatedCourses.find((course) => course.date === date)
        if (!existingCourse) {
          // 如果沒有課程，則添加新課程
          updatedCourses.push({
            id: uuidv4(),
            date,
            title: "基礎課程",
            students: [],
            closed: false,
          })
        } else if (existingCourse.closed) {
          // 如果課程已關閉，則重新開啟
          updatedCourses = updatedCourses.map((course) =>
            course.date === date ? { ...course, closed: false } : course,
          )
        }
      })

      // 處理要移除的日期
      datesToRemove.forEach((date) => {
        // 找到該日期的課程
        const courseToRemove = updatedCourses.find((course) => course.date === date)
        if (courseToRemove && courseToRemove.students.length === 0) {
          // 如果課程沒有學生，則從列表中移除
          updatedCourses = updatedCourses.filter((course) => course.date !== date)
        }
      })

      return { courses: updatedCourses }
    }),
  // 檢查日期是否有課程
  hasCourse: (date) => {
    const { courses } = get()
    return courses.some((course) => course.date === date && !course.closed)
  },
  // 檢查課程是否有學生
  courseHasStudents: (date) => {
    const { courses } = get()
    const course = courses.find((course) => course.date === date)
    return course ? course.students.length > 0 : false
  },
}))

// 創建上下文
const StudentsContext = createContext<StudentState | null>(null)
const CoursesContext = createContext<CourseState | null>(null)

// 自定義 hooks
export const useStudents = () => {
  const store = useStudentStore()
  return store
}

export const useCourses = () => {
  const store = useCourseStore()
  return store
}

