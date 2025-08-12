# Netlify 배포 가이드

## 🚀 빠른 배포 방법

### 1. GitHub에 코드 푸시
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Netlify에서 배포

1. **Netlify 가입/로그인**
   - https://app.netlify.com 접속
   - GitHub 계정으로 로그인

2. **새 사이트 생성**
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 연결 및 저장소 선택

3. **배포 설정**
   - Base directory: `nextjs-chatbot`
   - Build command: `npm run build`
   - Publish directory: `.next`
   - 환경 변수 추가:
     ```
     GOOGLE_SHEETS_API_KEY = AIzaSyBbMhEE9cHTDyBrm5VQgNBnuwAq7-qAplk
     ```

4. **Deploy site** 클릭

## 📝 주의사항

### Next.js App Router 지원
Netlify는 Next.js 14의 App Router를 지원합니다. `netlify.toml` 파일이 이미 설정되어 있습니다.

### 환경 변수
Site settings → Environment variables에서 관리:
- `GOOGLE_SHEETS_API_KEY`: Google Sheets API 키

### 파일 저장 문제 해결
Netlify는 읽기 전용 파일 시스템입니다. FAQ와 프롬프트 데이터 저장을 위해:
1. Netlify Functions 사용 (서버리스 함수)
2. 외부 데이터베이스 연동 필요

## 🔧 로컬 테스트
```bash
cd nextjs-chatbot
npm install
npm run dev
```

## 🌐 배포 후
- 사이트 URL: `https://your-site-name.netlify.app`
- 커스텀 도메인 설정 가능
- 자동 HTTPS 제공

## 📊 모니터링
- Netlify 대시보드에서 배포 상태 확인
- 빌드 로그 및 함수 로그 확인 가능