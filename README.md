# 슈퍼멤버스 FAQ 챗봇 테스터

슈퍼멤버스 플랫폼 전용 FAQ 기반 AI 챗봇의 성능을 테스트하고 비교하는 웹 애플리케이션입니다.

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

### 4. 비용 분석
- 모델별 토큰 사용량 추적
- 실시간 비용 계산
- 월간/연간 비용 예측

### 5. 일괄 테스트
- 여러 질문을 한 번에 테스트
- 모델별 성능 비교
- 결과 리포트 생성

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
`.env.local` 파일을 생성하고 다음 내용을 추가:
```env
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Google Services
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
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
│   │   │   ├── api/         # API 라우트
│   │   │   └── prompts/     # 프롬프트 관리 페이지
│   │   └── components/      # React 컴포넌트
│   ├── data/                # 로컬 데이터 저장
│   │   ├── processed_qna.json
│   │   └── prompts.json
│   └── package.json
├── documents/               # 프로젝트 문서
│   └── PRD.md              # 제품 요구사항 문서
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

## 🚀 배포

배포 시 환경 변수를 설정해야 합니다. 각 플랫폼의 환경 변수 설정 방법을 참고하세요.

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