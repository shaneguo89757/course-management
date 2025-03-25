import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 定義資料庫類型
export type Database = {
  public: {
    Tables: {
      course: {
        Row: {
          id: number
          name: string
          date: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          date: string
        }
        Update: {
          id?: number
          name?: string
          date?: string
        }
      }
      student: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          course_id: string
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          course_id: string
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          course_id?: string
          status?: 'active' | 'inactive'
        }
      }
    }
  }
} 