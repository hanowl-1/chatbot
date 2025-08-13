# 배포 가이드 - 환경 변수 설정

## Netlify 환경 변수 설정

### 1. Netlify 대시보드에서 환경 변수 추가

1. Netlify 대시보드 로그인
2. 해당 사이트 선택
3. **Site configuration** → **Environment variables** 클릭
4. **Add a variable** 버튼 클릭
5. 다음 변수들을 추가:

```
GOOGLE_API_KEY = AIzaSy... (실제 API 키)
OPENAI_API_KEY = sk-... (실제 API 키)
ANTHROPIC_API_KEY = sk-ant-... (실제 API 키)
```

### 2. Google API 키 확인사항

Google API 키가 작동하지 않는 경우:

1. **Google Cloud Console** (https://console.cloud.google.com) 접속
2. 프로젝트 선택
3. **APIs & Services** → **Enabled APIs** 확인
4. 다음 API가 활성화되어 있는지 확인:
   - **Generative Language API** 또는
   - **Vertex AI API**

5. API가 비활성화되어 있다면:
   - **Enable APIs and Services** 클릭
   - "Generative Language API" 검색
   - **Enable** 버튼 클릭

6. **APIs & Services** → **Credentials**에서:
   - API 키가 올바른지 확인
   - API 키 제한사항 확인 (IP 제한, API 제한 등)

### 3. 환경 변수 적용 확인

1. Netlify에서 환경 변수 설정 후 **Deploy** → **Trigger deploy** → **Clear cache and deploy site**
2. 배포 로그에서 환경 변수가 제대로 로드되는지 확인

### 4. 디버깅

배포 후에도 문제가 지속되면:

1. Netlify Functions 로그 확인
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. API 응답의 에러 메시지 확인

## 로컬 테스트

로컬에서 환경 변수 테스트:

```bash
# .env.local 파일 확인
cat .env.local

# 개발 서버 재시작
npm run dev
```

## 주의사항

- 환경 변수 이름은 대소문자를 구분합니다
- API 키 앞뒤의 공백을 제거하세요
- Netlify는 환경 변수 변경 후 재배포가 필요합니다