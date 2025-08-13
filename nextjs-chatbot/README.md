# 슈퍼멤버스 FAQ 챗봇 테스터

슈퍼멤버스 플랫폼을 위한 AI 챗봇 테스터 애플리케이션입니다. 다양한 AI 모델의 성능을 비교하고 테스트할 수 있습니다.

## 주요 기능

- **챗봇 테스트**: OpenAI, Anthropic, Google AI 모델 테스트
- **API 설정**: 각 AI 서비스의 API 키 관리
- **비용 분석**: 모델별 사용 비용 분석
- **일괄 테스트**: 여러 질문을 한 번에 테스트
- **FAQ 업로드**: FAQ 데이터 업로드 및 관리
- **프롬프트 관리**: 시스템 프롬프트 실시간 수정

## 설치 및 실행

### 1. 환경 변수 설정
```bash
# .env.example을 env.local로 복사
cp .env.example env.local

# env.local 파일을 열어 API 키 입력
# OPENAI_API_KEY=your_actual_api_key_here
# ANTHROPIC_API_KEY=your_actual_api_key_here
# GOOGLE_API_KEY=your_actual_api_key_here
```

### 2. 의존성 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 프로젝트 구조

```
nextjs-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # 챗봇 API
│   │   │   ├── prompts/       # 프롬프트 관리 API
│   │   │   └── faq-data/      # FAQ 데이터 API
│   │   └── prompts/           # 프롬프트 관리 페이지
│   └── components/            # React 컴포넌트
└── data/
    ├── prompts.json          # 시스템 프롬프트 설정
    └── processed_qna.json    # FAQ 데이터
```

## 중요 파일

### 시스템 프롬프트
- **위치**: [`/data/prompts.json`](./data/prompts.json)
- **설명**: 챗봇의 기본 동작을 정의하는 시스템 프롬프트
- **수정 방법**: 
  1. 웹 UI에서 "프롬프트 관리" 탭 접속
  2. 텍스트 영역에서 직접 수정 후 저장
  3. 또는 파일을 직접 편집

### FAQ 데이터
- **위치**: [`/data/processed_qna.json`](./data/processed_qna.json)
- **구조**:
```json
{
  "블로거": [
    {
      "question": "질문 내용",
      "answer": "답변 내용",
      "type": "매장,제품"
    }
  ],
  "광고주": [
    {
      "question": "질문 내용",
      "answer": "답변 내용",
      "type": "매장,제품"
    }
  ]
}
```

## API 엔드포인트

### 챗봇 API
- **POST** `/api/chat`
- 요청 본문:
```json
{
  "message": "사용자 메시지",
  "model": "gpt-3.5-turbo",
  "api_key": "YOUR_API_KEY",
  "temperature": 0.1,
  "max_tokens": 500
}
```

### 프롬프트 관리 API
- **GET** `/api/prompts` - 현재 프롬프트 조회
- **PUT** `/api/prompts` - 프롬프트 업데이트
```json
{
  "systemPrompt": "새로운 시스템 프롬프트"
}
```

### FAQ 데이터 API
- **GET** `/api/faq-data` - FAQ 데이터 조회

## 환경 변수

`.env.local` 파일을 생성하여 API 키를 설정할 수 있습니다:

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key
```

## 지원 모델

- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **Google**: Gemini Pro

## 사용 방법

1. **API 설정**: "API 설정" 탭에서 각 서비스의 API 키 입력
2. **챗봇 테스트**: "챗봇 테스트" 탭에서 모델 선택 후 대화
3. **프롬프트 수정**: "프롬프트 관리" 탭에서 시스템 프롬프트 수정
4. **FAQ 업데이트**: "FAQ 업로드" 탭에서 새로운 FAQ 데이터 업로드
5. **비용 확인**: "비용 분석" 탭에서 사용 비용 모니터링

## 라이선스

이 프로젝트는 내부 사용을 위해 개발되었습니다.