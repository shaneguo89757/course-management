import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import { IDataStore, Student, Course } from "../types"

// 初始學生數據
const initialStudents: Student[] = [
  { id: "1", name: "王小明", active: true, ig: "@wang_xiaoming" },
  { id: "2", name: "李小花", active: true, ig: "@li_flower" },
  { id: "3", name: "張大山", active: true, ig: "@zhang_mountain" },
  { id: "4", name: "陳小雨", active: false, ig: "@chen_rain" },
  { id: "5", name: "林小樹", active: true, ig: "@lin_tree" },
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

interface ZustandState {
  students: Student[]
  courses: Course[]
  simplifiedAddMode: boolean
}

export class ZustandStore implements IDataStore {
  private store = create<ZustandState>((set, get) => ({
    students: initialStudents,
    courses: initialCourses,
    simplifiedAddMode: true,
  }))

  async getStudents(): Promise<Student[]> {
    return this.store.getState().students
  }

  async addStudent(name: string, ig?: string): Promise<Student> {
    const newStudent: Student = {
      id: uuidv4(),
      name,
      active: true,
      ig,
    }
    this.store.setState((state) => ({
      students: [...state.students, newStudent],
    }))
    return newStudent
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    let updatedStudent: Student | undefined
    this.store.setState((state) => ({
      students: state.students.map((student) => {
        if (student.id === id) {
          updatedStudent = { ...student, ...data }
          return updatedStudent
        }
        return student
      }),
    }))
    if (!updatedStudent) throw new Error(`Student with id ${id} not found`)
    return updatedStudent
  }

  async toggleStudentStatus(id: string): Promise<Student> {
    let updatedStudent: Student | undefined
    this.store.setState((state) => ({
      students: state.students.map((student) => {
        if (student.id === id) {
          updatedStudent = { ...student, active: !student.active }
          return updatedStudent
        }
        return student
      }),
    }))
    if (!updatedStudent) throw new Error(`Student with id ${id} not found`)
    return updatedStudent
  }

  async getCourses(): Promise<Course[]> {
    return this.store.getState().courses
  }

  async addCourse(date: string, title: string = "基礎課程"): Promise<Course> {
    const newCourse: Course = {
      id: uuidv4(),
      date,
      title,
      students: [],
      closed: false,
    }
    this.store.setState((state) => ({
      courses: [...state.courses, newCourse],
    }))
    return newCourse
  }

  async closeCourse(id: string): Promise<Course> {
    let updatedCourse: Course | undefined
    this.store.setState((state) => ({
      courses: state.courses.map((course) => {
        if (course.id === id) {
          updatedCourse = { ...course, closed: true }
          return updatedCourse
        }
        return course
      }),
    }))
    if (!updatedCourse) throw new Error(`Course with id ${id} not found`)
    return updatedCourse
  }

  async addStudentToCourse(courseId: string, studentId: string): Promise<Course> {
    let updatedCourse: Course | undefined
    this.store.setState((state) => ({
      courses: state.courses.map((course) => {
        if (course.id === courseId) {
          updatedCourse = {
            ...course,
            students: [...course.students, studentId],
          }
          return updatedCourse
        }
        return course
      }),
    }))
    if (!updatedCourse) throw new Error(`Course with id ${courseId} not found`)
    return updatedCourse
  }

  async removeStudentFromCourse(courseId: string, studentId: string): Promise<Course> {
    let updatedCourse: Course | undefined
    this.store.setState((state) => ({
      courses: state.courses.map((course) => {
        if (course.id === courseId) {
          updatedCourse = {
            ...course,
            students: course.students.filter((id) => id !== studentId),
          }
          return updatedCourse
        }
        return course
      }),
    }))
    if (!updatedCourse) throw new Error(`Course with id ${courseId} not found`)
    return updatedCourse
  }

  async addMultipleStudentsToCourse(courseId: string, studentIds: string[]): Promise<Course> {
    let updatedCourse: Course | undefined
    this.store.setState((state) => ({
      courses: state.courses.map((course) => {
        if (course.id === courseId) {
          updatedCourse = {
            ...course,
            students: [...new Set([...course.students, ...studentIds])],
          }
          return updatedCourse
        }
        return course
      }),
    }))
    if (!updatedCourse) throw new Error(`Course with id ${courseId} not found`)
    return updatedCourse
  }

  async batchUpdateCourses(datesToAdd: string[], datesToRemove: string[]): Promise<Course[]> {
    let updatedCourses: Course[] = []
    this.store.setState((state) => {
      let courses = [...state.courses]

      // 處理要添加的日期
      datesToAdd.forEach((date) => {
        const existingCourse = courses.find((course) => course.date === date)
        if (!existingCourse) {
          courses.push({
            id: uuidv4(),
            date,
            title: "基礎課程",
            students: [],
            closed: false,
          })
        } else if (existingCourse.closed) {
          courses = courses.map((course) =>
            course.date === date ? { ...course, closed: false } : course,
          )
        }
      })

      // 處理要移除的日期
      datesToRemove.forEach((date) => {
        const courseToRemove = courses.find((course) => course.date === date)
        if (courseToRemove && courseToRemove.students.length === 0) {
          courses = courses.filter((course) => course.date !== date)
        }
      })

      updatedCourses = courses
      return { courses }
    })
    return updatedCourses
  }

  async hasCourse(date: string): Promise<boolean> {
    return this.store.getState().courses.some(
      (course) => course.date === date && !course.closed,
    )
  }

  async courseHasStudents(date: string): Promise<boolean> {
    const course = this.store.getState().courses.find((course) => course.date === date)
    return course ? course.students.length > 0 : false
  }
} 