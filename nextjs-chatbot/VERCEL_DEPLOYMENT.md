# Vercel 배포 가이드

## 1. 사전 준비

### 필요한 것들
- Vercel 계정 (없으면 https://vercel.com 에서 가입)
- Git 저장소 (GitHub, GitLab, Bitbucket 중 하나)

## 2. 배포 방법

### 방법 1: Vercel CLI 사용 (추천)

1. Vercel CLI 설치
```bash
npm i -g vercel
```

2. 프로젝트 디렉토리에서 배포
```bash
cd nextjs-chatbot
vercel
```

3. 프롬프트에 따라 설정
- 프로젝트 이름 설정
- 환경 변수 설정 (아래 참조)

### 방법 2: GitHub 연동

1. GitHub에 코드 푸시
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. Vercel 대시보드에서:
   - "New Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

## 3. 환경 변수 설정

Vercel 대시보드 > Settings > Environment Variables에서 추가:

```
GOOGLE_SHEETS_API_KEY=AIzaSyBbMhEE9cHTDyBrm5VQgNBnuwAq7-qAplk
```

선택적 환경 변수 (필요시):
```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
```

## 4. 배포 후 설정

### data 폴더 처리
Vercel은 파일 시스템 쓰기를 지원하지 않으므로 다음 중 선택:

1. **임시 솔루션** (현재 가능)
   - `/tmp` 디렉토리 사용하도록 코드 수정
   - 서버 재시작시 데이터 초기화됨

2. **영구 솔루션** (권장)
   - Vercel KV Storage 사용
   - 외부 데이터베이스 (Supabase, MongoDB Atlas 등) 사용

### 임시 솔루션 적용 방법

다음 파일들의 경로를 수정:
- `src/app/api/prompts/route.ts`
- `src/app/api/google-sheets-sync/route.ts`

```typescript
// 기존
const PROMPTS_FILE_PATH = path.join(process.cwd(), 'data', 'prompts.json')

// 변경
const PROMPTS_FILE_PATH = path.join('/tmp', 'prompts.json')
```

## 5. 도메인 설정 (선택사항)

1. Vercel 대시보드 > Settings > Domains
2. 커스텀 도메인 추가
3. DNS 설정 안내에 따라 진행

## 6. 배포 확인

- 배포 URL: `https://your-project-name.vercel.app`
- 빌드 로그 확인
- 환경 변수 적용 확인

## 7. 주의사항

1. **파일 저장 제한**
   - Vercel은 읽기 전용 파일 시스템
   - FAQ 데이터와 프롬프트 저장을 위해 외부 저장소 필요

2. **API 제한**
   - 무료 플랜: 10초 실행 시간 제한
   - Pro 플랜: 60초까지 가능
   - vercel.json에서 maxDuration 설정

3. **환경 변수**
   - 민감한 정보는 반드시 환경 변수로 설정
   - 클라이언트 사이드에서 사용할 변수는 `NEXT_PUBLIC_` 접두사 필요

## 8. 문제 해결

### 빌드 실패시
1. 로컬에서 `npm run build` 확인
2. 타입스크립트 에러 수정
3. 의존성 확인

### 런타임 에러시
1. Vercel 함수 로그 확인
2. 환경 변수 설정 확인
3. API 경로 확인