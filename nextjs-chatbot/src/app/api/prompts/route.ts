import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

// // Supabase 클라이언트 초기화
// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// );

const PROMPT_TYPES = {
  // QUERY_ANALYSIS: "query_analysis",
  REFINE_QUESTION: "refine_question",
  ANSWER_GENERATION: "answer_generation",
  CONFIDENCE_CHECK: "confidence_check",
  // FINAL_ANSWER: "final_answer",
  SYSTEM: "system",
} as const;

const PROMPT_NAME = "heeda_prompts";

export async function GET() {
  try {
    // Supabase에서 모든 프롬프트 가져오기

    const { data, error } = await supabase
      .from(PROMPT_NAME)
      .select("*")
      .order("prompt_type");

    if (error || !data || data.length === 0) {
      // 데이터가 없으면 기본값 반환
      return NextResponse.json({
        // analyze_query: "당신은 사용자 질문을 분석하는 AI입니다.",
        refine_question: "사용자 질문을 더 명확한 질의로 재정의하세요.",
        generate_answer:
          "당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇입니다.",
        assess_confidence:
          "당신은 AI 답변의 품질을 평가하는 검증 시스템입니다.",
        // generate_final_answer: "당신은 최종 답변을 생성하는 AI입니다.",
        system:
          "당신은 도움이 되고 정확한 정보를 제공하는 AI 어시스턴트입니다.",
        lastModified: new Date().toISOString(),
        version: 1,
      });
    }

    // 프롬프트 타입별로 정리
    const promptsMap = data.reduce((acc, item) => {
      acc[item.prompt_type] = item;
      return acc;
    }, {} as Record<string, any>);

    // API 응답 형식 맞추기
    return NextResponse.json({
      // analyze_query: promptsMap[PROMPT_TYPES.QUERY_ANALYSIS]?.prompt_text || "",
      refine_question:
        promptsMap[PROMPT_TYPES.REFINE_QUESTION]?.prompt_text || "",
      generate_answer:
        promptsMap[PROMPT_TYPES.ANSWER_GENERATION]?.prompt_text || "",
      assess_confidence:
        promptsMap[PROMPT_TYPES.CONFIDENCE_CHECK]?.prompt_text || "",
      // generate_final_answer:
      //   promptsMap[PROMPT_TYPES.FINAL_ANSWER]?.prompt_text || "",
      system: promptsMap[PROMPT_TYPES.SYSTEM]?.prompt_text || "",
      lastModified:
        promptsMap[PROMPT_TYPES.ANSWER_GENERATION]?.last_modified ||
        new Date().toISOString(),
      version: Math.max(
        // promptsMap[PROMPT_TYPES.QUERY_ANALYSIS]?.version || 1,
        promptsMap[PROMPT_TYPES.REFINE_QUESTION]?.version || 1,
        promptsMap[PROMPT_TYPES.ANSWER_GENERATION]?.version || 1,
        promptsMap[PROMPT_TYPES.CONFIDENCE_CHECK]?.version || 1,
        // promptsMap[PROMPT_TYPES.FINAL_ANSWER]?.version || 1,
        promptsMap[PROMPT_TYPES.SYSTEM]?.version || 1
      ),
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json({
      // analyze_query: "당신은 사용자 질문을 분석하는 AI입니다.",
      refine_question: "사용자 질문을 더 명확한 질의로 재정의하세요.",
      generate_answer: "당신은 슈퍼멤버스 플랫폼 전용 고객지원 AI 챗봇입니다.",
      assess_confidence: "당신은 AI 답변의 품질을 평가하는 검증 시스템입니다.",
      // generate_final_answer: "당신은 최종 답변을 생성하는 AI입니다.",
      system: "당신은 도움이 되고 정확한 정보를 제공하는 AI 어시스턴트입니다.",
      lastModified: new Date().toISOString(),
      version: 1,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // analyze_query,
      refine_question,
      generate_answer,
      assess_confidence,
      // generate_final_answer,
      system,
    } = body;

    // 업데이트할 프롬프트들 준비
    const updates = [
      // {
      //   type: PROMPT_TYPES.QUERY_ANALYSIS,
      //   text: analyze_query,
      // },
      {
        // refine_question 업데이트 추가
        type: PROMPT_TYPES.REFINE_QUESTION,
        text: refine_question,
      },
      {
        type: PROMPT_TYPES.ANSWER_GENERATION,
        text: generate_answer,
      },
      {
        type: PROMPT_TYPES.CONFIDENCE_CHECK,
        text: assess_confidence,
      },
      // {
      //   type: PROMPT_TYPES.FINAL_ANSWER,
      //   text: generate_final_answer,
      // },
      {
        type: PROMPT_TYPES.SYSTEM,
        text: system,
      },
    ].filter((item) => item.text !== undefined);

    const results = [];

    // 각 프롬프트 타입별로 업데이트 또는 생성
    for (const update of updates) {
      // 먼저 해당 타입의 프롬프트가 있는지 확인
      const { data: existing } = await supabase
        .from(PROMPT_NAME)
        .select("version")
        .eq("prompt_type", update.type)
        .single();

      if (existing) {
        // 업데이트
        const { data, error } = await supabase
          .from(PROMPT_NAME)
          .update({
            prompt_text: update.text,
            last_modified: new Date().toISOString(),
            version: (existing.version || 0) + 1,
          })
          .eq("prompt_type", update.type)
          .select()
          .single();

        if (error) throw error;
        results.push(data);
      } else {
        // 새로 생성
        const { data, error } = await supabase
          .from(PROMPT_NAME)
          .insert({
            prompt_type: update.type,
            prompt_text: update.text,
            last_modified: new Date().toISOString(),
            version: 1,
          })
          .select()
          .single();

        if (error) throw error;
        results.push(data);
      }
    }

    return NextResponse.json({
      message: "Heda Prompts updated successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error updating prompts:", error);
    return NextResponse.json(
      { error: "Failed to update prompts" },
      { status: 500 }
    );
  }
}
