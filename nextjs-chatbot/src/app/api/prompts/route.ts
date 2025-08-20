import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Supabase에서 프롬프트 가져오기
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) {
      // 데이터가 없으면 기본값 반환
      const defaultPrompts = {
        systemPrompt: "당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇입니다.",
        lastModified: new Date().toISOString(),
        version: 1
      }
      return NextResponse.json(defaultPrompts)
    }

    // API 응답 형식 맞추기
    return NextResponse.json({
      systemPrompt: data.system_prompt,
      lastModified: data.last_modified,
      version: data.version
    })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    const defaultPrompts = {
      systemPrompt: "당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇입니다.",
      lastModified: new Date().toISOString(),
      version: 1
    }
    return NextResponse.json(defaultPrompts)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { systemPrompt } = body

    if (!systemPrompt) {
      return NextResponse.json(
        { error: 'System prompt is required' },
        { status: 400 }
      )
    }

    // 현재 버전 가져오기
    const { data: currentData } = await supabase
      .from('prompts')
      .select('version')
      .eq('id', 1)
      .single()

    const currentVersion = currentData?.version || 0

    // Supabase에서 프롬프트 업데이트
    const { data, error } = await supabase
      .from('prompts')
      .update({
        system_prompt: systemPrompt,
        last_modified: new Date().toISOString(),
        version: currentVersion + 1
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      // 레코드가 없으면 생성
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('prompts')
          .insert({
            id: 1,
            system_prompt: systemPrompt,
            last_modified: new Date().toISOString(),
            version: 1
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        return NextResponse.json({
          message: 'Prompt created successfully',
          data: {
            systemPrompt: newData.system_prompt,
            lastModified: newData.last_modified,
            version: newData.version
          }
        })
      }
      throw error
    }

    return NextResponse.json({
      message: 'Prompt updated successfully',
      data: {
        systemPrompt: data.system_prompt,
        lastModified: data.last_modified,
        version: data.version
      }
    })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}