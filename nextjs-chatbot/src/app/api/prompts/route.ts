import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const PROMPTS_FILE_PATH = path.join(process.cwd(), 'data', 'prompts.json')

export async function GET() {
  try {
    const data = await fs.readFile(PROMPTS_FILE_PATH, 'utf-8')
    const prompts = JSON.parse(data)
    return NextResponse.json(prompts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load prompts' },
      { status: 500 }
    )
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

    const currentData = await fs.readFile(PROMPTS_FILE_PATH, 'utf-8')
    const prompts = JSON.parse(currentData)

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
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    )
  }
}