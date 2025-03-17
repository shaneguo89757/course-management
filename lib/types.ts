// 基礎類型定義
export interface Student {
  id: string
  name: string
  active: boolean
  ig?: string
}

export interface Course {
  id: string
  date: string
  title: string
  students: string[]
  closed: boolean
}

// 數據存儲介面
export interface IDataStore {
  // 學生相關操作
  getStudents(): Promise<Student[]>
  addStudent(name: string, ig?: string): Promise<Student>
  updateStudent(id: string, data: Partial<Student>): Promise<Student>
  toggleStudentStatus(id: string): Promise<Student>
  
  // 課程相關操作
  getCourses(): Promise<Course[]>
  addCourse(date: string, title?: string): Promise<Course>
  closeCourse(id: string): Promise<Course>
  addStudentToCourse(courseId: string, studentId: string): Promise<Course>
  removeStudentFromCourse(courseId: string, studentId: string): Promise<Course>
  addMultipleStudentsToCourse(courseId: string, studentIds: string[]): Promise<Course>
  batchUpdateCourses(datesToAdd: string[], datesToRemove: string[]): Promise<Course[]>
  hasCourse(date: string): Promise<boolean>
  courseHasStudents(date: string): Promise<boolean>
} 