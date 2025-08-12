import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs/promises'
import path from 'path'

const FAQ_FILE_PATH = path.join(process.cwd(), 'data', 'processed_qna.json')

// Google Sheets ID 추출 함수
function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

export async function POST(request: NextRequest) {
  try {
    const { sheetUrl } = await request.json()
    
    if (!sheetUrl) {
      return NextResponse.json(
        { error: 'Google Sheets URL이 필요합니다.' },
        { status: 400 }
      )
    }

    const sheetId = extractSheetId(sheetUrl)
    if (!sheetId) {
      return NextResponse.json(
        { error: '유효한 Google Sheets URL이 아닙니다.' },
        { status: 400 }
      )
    }

    // Google Sheets API 인증 (API Key 방식 - 공개 시트용)
    const sheets = google.sheets({ 
      version: 'v4',
      auth: process.env.GOOGLE_SHEETS_API_KEY
    })

    // 시트 데이터 읽기
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: ['블로거!A2:C', '광고주!A2:C'] // 헤더 제외하고 데이터만
    })

    const ranges = response.data.valueRanges || []
    
    // FAQ 데이터 형식으로 변환
    const faqData: any = {
      블로거: [],
      광고주: []
    }

    // 블로거 데이터 처리
    if (ranges[0]?.values) {
      faqData.블로거 = ranges[0].values.map((row: any[]) => ({
        question: row[0] || '',
        answer: row[1] || '',
        type: row[2] || '매장,제품'
      })).filter(item => item.question && item.answer)
    }

    // 광고주 데이터 처리
    if (ranges[1]?.values) {
      faqData.광고주 = ranges[1].values.map((row: any[]) => ({
        question: row[0] || '',
        answer: row[1] || '',
        type: row[2] || '매장,제품'
      })).filter(item => item.question && item.answer)
    }

    // 파일로 저장
    await fs.writeFile(
      FAQ_FILE_PATH,
      JSON.stringify(faqData, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: 'FAQ 데이터가 성공적으로 동기화되었습니다.',
      data: {
        블로거: faqData.블로거.length,
        광고주: faqData.광고주.length,
        total: faqData.블로거.length + faqData.광고주.length
      }
    })
  } catch (error: any) {
    console.error('Google Sheets sync error:', error)
    
    if (error.code === 403) {
      return NextResponse.json(
        { error: '시트에 접근할 수 없습니다. 시트가 공개되어 있는지 확인하세요.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'FAQ 동기화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // 현재 FAQ 데이터와 마지막 동기화 정보 반환
    const data = await fs.readFile(FAQ_FILE_PATH, 'utf-8')
    const faqData = JSON.parse(data)
    
    return NextResponse.json({
      lastSync: new Date().toISOString(), // 실제로는 메타데이터로 관리하면 좋음
      count: {
        블로거: faqData.블로거?.length || 0,
        광고주: faqData.광고주?.length || 0,
        total: (faqData.블로거?.length || 0) + (faqData.광고주?.length || 0)
      }
    })
  } catch (error) {
    return NextResponse.json({
      lastSync: null,
      count: { 블로거: 0, 광고주: 0, total: 0 }
    })
  }
}