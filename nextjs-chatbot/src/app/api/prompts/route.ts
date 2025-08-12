import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const PROMPTS_FILE_PATH = path.join(process.cwd(), 'data', 'prompts.json')

async function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

export async function GET() {
  try {
    await ensureDirectoryExists(PROMPTS_FILE_PATH)
    const data = await fs.readFile(PROMPTS_FILE_PATH, 'utf-8')
    const prompts = JSON.parse(data)
    return NextResponse.json(prompts)
  } catch (error) {
    // 파일이 없으면 기본값 반환
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

    await ensureDirectoryExists(PROMPTS_FILE_PATH)

    let prompts
    try {
      const currentData = await fs.readFile(PROMPTS_FILE_PATH, 'utf-8')
      prompts = JSON.parse(currentData)
    } catch {
      // 파일이 없으면 기본값 사용
      prompts = {
        systemPrompt: "",
        lastModified: new Date().toISOString(),
        version: 0
      }
    }

    const updatedPrompts = {
      ...prompts,
      systemPrompt,
      lastModified: new Date().toISOString(),
      version: prompts.version + 1
    }

    await fs.writeFile(
      PROMPTS_FILE_PATH,
      JSON.stringify(updatedPrompts, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      message: 'Prompt updated successfully',
      data: updatedPrompts
    })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}