import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 創建具有服務端權限的 Supabase 客戶端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 使用服務端權限創建課程
    const { data, error } = await supabaseAdmin
      .from('course')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Supabase 錯誤:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // 使用服務端權限獲取所有課程
    const { data, error } = await supabaseAdmin
      .from('course')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase 錯誤:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 