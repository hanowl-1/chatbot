# 슈퍼멤버스 FAQ 챗봇 & 리뷰 관리 시스템

슈퍼멤버스 플랫폼 전용 FAQ 기반 AI 챗봇과 리뷰 답변 관리 시스템을 통합한 웹 애플리케이션입니다.

## 🚀 주요 기능

### 1. 다중 AI 모델 지원
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3 Opus, Sonnet, Haiku
- **Google**: Gemini Pro, Gemini 2.0 Flash

### 2. FAQ 관리
- Google Sheets 연동을 통한 실시간 FAQ 관리
- 블로거/광고주별 FAQ 분류
- 홈페이지 헤더의 빠른 동기화 버튼

### 3. 프롬프트 관리
- 시스템 프롬프트 실시간 편집
- 버전 관리 및 히스토리
- 웹 UI를 통한 간편한 수정
- **Jotai 전역 상태 관리**: 한 번만 로드하여 모든 페이지에서 공유

### 4. 비용 분석
- 모델별 토큰 사용량 추적
- 실시간 비용 계산
- 월간/연간 비용 예측

### 5. 일괄 테스트
- 여러 질문을 한 번에 테스트
- 모델별 성능 비교
- 결과 리포트 생성

### 6. 리뷰 답변 관리 시스템
- **자동 리뷰 동기화**: Supabase와 연동된 실시간 리뷰 데이터 관리
- **리뷰 상태 관리**: 대기중/완료/임시저장 상태 분류
- **AI 답변 생성**: GPT-4를 활용한 자동 답변 생성
- **수동 답변 작성**: 직접 리뷰 답변 작성 및 편집
- **실시간 업데이트 알림**: 새로운 리뷰 자동 감지 및 알림
- **페이지네이션**: 대량 리뷰 효율적 관리

### 7. 백터 데이터베이스 관리
- **엑셀 파일 업로드**: FAQ 데이터 일괄 업로드 지원
- **GitHub Actions 연동**: 백그라운드 처리를 통한 대용량 파일 처리
- **동기화 상태 확인**: 주기적인 동기화 상태 모니터링
- **Toast 알림**: 동기화 완료 및 오류 상태 실시간 알림

## 📋 시작하기

### 사전 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/hanowl-1/chatbot.git
cd chatbot
```

2. 의존성 설치
```bash
cd nextjs-chatbot
npm install
```

3. 환경 변수 설정
```bash
# .env.example을 .env.local로 복사
cp .env.example .env.local
```

`.env.local` 파일을 열어 API 키를 입력:
```env
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
TOGETHER_API_KEY=your_together_api_key_here

# Supabase (리뷰 관리 시스템)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Sheets (선택사항 - FAQ 동기화용)
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
GOOGLE_SHEETS_PRIVATE_KEY=your_private_key_here
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# RAG API (백터 데이터베이스 연동)
RAG_API_URL=your_rag_api_url
RAG_MASTER_TOKEN=your_rag_master_token

# GitHub Actions (엑셀 처리용)
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 http://localhost:3000 접속

## 🔧 환경 설정

### API 키 발급 방법
1. **OpenAI API Key**
   - https://platform.openai.com 접속
   - API Keys 메뉴에서 생성

2. **Anthropic API Key**
   - https://console.anthropic.com 접속
   - API Keys 섹션에서 생성

3. **Google Gemini API Key**
   - https://makersuite.google.com/app/apikey
   - Create API Key 클릭

4. **Google Sheets API Key**
   - https://console.cloud.google.com
   - Sheets API 활성화 후 API 키 생성

5. **Supabase 설정**
   - https://supabase.com 에서 프로젝트 생성
   - Settings → API 에서 URL과 anon key 복사
   - 리뷰 테이블 스키마 설정 필요

6. **GitHub Token**
   - https://github.com/settings/tokens
   - Generate new token (classic)
   - repo 권한 체크

### Google Sheets FAQ 연동

1. 공식 FAQ Google Sheets:
   - [슈퍼멤버스 FAQ 시트](https://docs.google.com/spreadsheets/d/1QyimFEo-B9-5Nxt4OwWemAUr7aT6xxX0LGKGwSE0UDA/edit)

2. 시트 구성:
   - **블로거** 시트: 블로거 관련 FAQ
   - **광고주** 시트: 광고주 관련 FAQ
   - 열 구성: A(질문) | B(답변) | C(타입)

3. 사용 방법:
   - FAQ 시트 연동 탭에서 "FAQ 데이터 동기화" 클릭
   - 또는 홈페이지 헤더의 "FAQ 동기화" 버튼 사용

## 🏗️ 프로젝트 구조

```
chatbot/
├── nextjs-chatbot/           # Next.js 프로젝트
│   ├── src/
│   │   ├── app/             # App Router 페이지
│   │   │   ├── api/         # API 라우트 (prompts 제거됨)
│   │   │   ├── chatbot/    # 챗봇 테스트 페이지
│   │   │   ├── prompts/    # 프롬프트 관리 페이지
│   │   │   ├── reviews/    # 리뷰 관리 페이지
│   │   │   └── settings/   # 설정 페이지
│   │   ├── components/      # React 컴포넌트
│   │   │   ├── common/      # 공통 컴포넌트
│   │   │   └── reviews/     # 리뷰 관련 컴포넌트
│   │   ├── lib/             # 유틸리티 및 설정
│   │   │   ├── atoms/       # Jotai 전역 상태 관리
│   │   │   └── supabase.ts  # Supabase 클라이언트
│   │   ├── hooks/           # 커스텀 React 훅
│   │   │   └── useLoadPrompts.ts # 프롬프트 로드 훅
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── constants/       # 상수 정의
│   ├── data/                # 로컬 데이터 저장
│   │   ├── processed_qna.json
│   │   └── prompts.json
│   ├── scripts/             # 유틸리티 스크립트
│   │   └── processExcel.js  # 엑셀 처리 스크립트
│   └── package.json
├── .github/                 # GitHub Actions
│   └── workflows/
│       └── process-excel.yml # 엑셀 처리 워크플로우
├── documents/               # 프로젝트 문서
│   └── PRD.md              # 제품 요구사항 문서
├── DEPLOYMENT_GUIDE.md      # 배포 가이드
└── README.md
```

## 📱 주요 화면

### 1. 챗봇 테스트
- AI 모델 선택
- 실시간 대화
- 응답 시간, 토큰, 비용 표시

### 2. 비용 분석
- 월간 예상 쿼리 수 입력
- 모델별 비용 비교
- 연간 비용 예측

### 3. 일괄 테스트
- CSV/텍스트 형식으로 질문 입력
- 선택한 모델들로 동시 테스트
- 결과 요약 및 상세 보기

### 4. FAQ 시트 연동
- Google Sheets 직접 링크
- 원클릭 동기화
- FAQ 데이터 현황 표시

### 5. 프롬프트 관리
- 시스템 프롬프트 편집
- 버전 정보 표시
- 실시간 저장

### 6. 리뷰 관리
- 대기중/완료/임시저장 탭 분류
- AI 답변 자동 생성 (GPT-4)
- 수동 답변 작성 및 편집
- 실시간 업데이트 알림
- 페이지네이션 지원

### 7. 설정 페이지
- 벡터 데이터베이스 동기화
- 엑셀 파일 업로드 및 처리
- 동기화 상태 모니터링
- GitHub Actions 연동 상태

## 🚀 배포

### Netlify 배포

1. GitHub 저장소를 Netlify와 연결
2. 빌드 설정은 자동으로 `netlify.toml` 파일을 참조
3. 환경 변수 설정 (Site settings → Environment variables):
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_API_KEY`
   - `GROQ_API_KEY`
   - `TOGETHER_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `GOOGLE_SHEETS_PRIVATE_KEY`
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `RAG_API_URL`
   - `RAG_MASTER_TOKEN`
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`

### 기타 플랫폼
배포 시 환경 변수를 설정해야 합니다. 각 플랫폼의 환경 변수 설정 방법을 참고하세요.

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Material-UI
- **State Management**: Jotai
- **HTTP Client**: Axios

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Vector DB**: RAG API
- **Background Processing**: GitHub Actions
- **File Processing**: XLSX, Node.js scripts

### AI/ML
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Google**: Gemini Pro, Gemini 2.0 Flash
- **Groq**: LLaMA 모델들
- **Together AI**: 오픈소스 모델들

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.

---

Made with ❤️ for SuperMembers