-- 기존 prompts 테이블 삭제 (주의: 데이터가 삭제됩니다)
DROP TABLE IF EXISTS prompts;

-- 새로운 prompts 테이블 생성
CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  prompt_type VARCHAR(50) NOT NULL UNIQUE, -- 'query_analysis', 'answer_generation', 'confidence_check'
  prompt_text TEXT NOT NULL,
  last_modified TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 기본 프롬프트 데이터 삽입
INSERT INTO prompts (prompt_type, prompt_text) VALUES 
('query_analysis', '당신은 사용자 질문을 분석하는 AI입니다.
다음 작업을 수행하세요:
1. 질문 의도 파악
2. 카테고리 분류 (매장/제품/블로거/기타)
3. 핵심 키워드 추출
4. 질문 유형 판단 (단순/복합)'),

('answer_generation', '당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇입니다.
RAG 검색 결과를 기반으로 정확하고 친절한 답변을 생성하세요.
- FAQ 데이터를 우선 참조
- 명확하고 구조화된 답변 제공
- 단계별 설명이 필요한 경우 번호를 매겨 설명'),

('confidence_check', '당신은 AI 답변의 품질을 평가하는 검증 시스템입니다.
다음 기준으로 신뢰도를 평가하세요:
1. 답변의 정확성 (0~1)
2. FAQ와의 일치도
3. 답변의 완성도
4. 자동 응답 가능 여부 판단

신뢰도 기준:
- 0.7 이상: 자동 응답 가능
- 0.4~0.7: 검토 필요
- 0.4 미만: 수동 응답 필요');

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_prompt_type ON prompts(prompt_type);