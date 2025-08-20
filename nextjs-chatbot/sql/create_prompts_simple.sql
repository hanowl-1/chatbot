-- 프롬프트 테이블 생성 (간단 버전)
CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY DEFAULT 1,
    system_prompt TEXT NOT NULL,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- 기본 프롬프트 삽입
INSERT INTO prompts (id, system_prompt) 
VALUES (1, '당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇입니다.')
ON CONFLICT (id) DO NOTHING;

-- ID가 1인 레코드만 존재하도록 제약
ALTER TABLE prompts ADD CONSTRAINT single_prompt CHECK (id = 1);