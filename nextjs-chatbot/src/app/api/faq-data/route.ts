import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const faqPath = path.join(process.cwd(), 'data', 'processed_qna.json')
    const data = await fs.readFile(faqPath, 'utf-8')
    const faqData = JSON.parse(data)
    
    return NextResponse.json({
      data: faqData,
      count: Object.values(faqData).flat().length
    })
  } catch (error) {
    return NextResponse.json({
      data: { 블로거: [], 광고주: [] },
      count: 0
    })
  }
}