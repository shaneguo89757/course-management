import { supabase } from './supabase'
import type { Database } from './supabase'

type Course = Database['public']['Tables']['course']['Row']
type CourseInsert = Database['public']['Tables']['course']['Insert']
type CourseUpdate = Database['public']['Tables']['course']['Update']

type Student = Database['public']['Tables']['student']['Row']
type StudentInsert = Database['public']['Tables']['student']['Insert']
type StudentUpdate = Database['public']['Tables']['student']['Update']

// 課程相關操作
export const courseApi = {
  // 獲取所有課程
  getAll: async () => {
    const response = await fetch('/api/courses')
    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }
    return response.json()
  },

  // 獲取單個課程
  getById: async (id: number) => {
    const response = await fetch(`/api/courses/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch course')
    }
    return response.json()
  },

  // 創建課程
  create: async (course: CourseInsert) => {
    console.log('正在創建課程:', course)
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    })
    if (!response.ok) {
      throw new Error('Failed to create course')
    }
    return response.json()
  },

  // 更新課程
  update: async (id: number, course: CourseUpdate) => {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    })
    if (!response.ok) {
      throw new Error('Failed to update course')
    }
    return response.json()
  },

  // 刪除課程
  delete: async (id: number) => {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete course')
    }
    return response.json()
  }
}

// 學生相關操作
export const studentApi = {
  // 獲取所有學生
  getAll: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // 獲取單個學生
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // 創建學生
  create: async (student: StudentInsert) => {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 更新學生
  update: async (id: string, student: StudentUpdate) => {
    const { data, error } = await supabase
      .from('students')
      .update(student)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // 刪除學生
  delete: async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
} 