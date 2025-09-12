import { useEffect } from "react";
import { useAtom } from "jotai";
import { promptsAtom, isPromptsLoadedAtom } from "@/lib/atoms";
import { fetchInstance } from "@/lib/fetchInstance";

export function useLoadPrompts() {
  const [prompts, setPrompts] = useAtom(promptsAtom);
  const [isLoaded, setIsLoaded] = useAtom(isPromptsLoadedAtom);

  useEffect(() => {
    // 이미 로드했으면 스킵
    if (isLoaded) {
      console.log("✅ 프롬프트가 이미 로드되어 있음");
      return;
    }

    const loadPrompts = async () => {
      try {
        console.log("🔄 프롬프트 최초 로드 시작...");
        const data = await fetchInstance("/prompts");

        if (data && Array.isArray(data)) {
          // 배열을 prompt_type으로 매핑
          const promptMap = data.reduce((acc, item) => {
            acc[item.prompt_type] = item;
            return acc;
          }, {} as any);

          const newPrompts = {
            generate_answer: {
              text: promptMap.answer_generation?.prompt_text || "",
              lastModified: promptMap.answer_generation?.last_modified,
              version: promptMap.answer_generation?.version,
            },
            assess_confidence: {
              text: promptMap.confidence_check?.prompt_text || "",
              lastModified: promptMap.confidence_check?.last_modified,
              version: promptMap.confidence_check?.version,
            },
            refine_question: {
              text: promptMap.refine_question?.prompt_text || "",
              lastModified: promptMap.refine_question?.last_modified,
              version: promptMap.refine_question?.version,
            },
            system: {
              text: promptMap.system?.prompt_text || "",
              lastModified: promptMap.system?.last_modified,
              version: promptMap.system?.version,
            },
          };

          setPrompts(newPrompts);
          setIsLoaded(true);
          console.log("✅ 프롬프트 로드 완료!");
        }
      } catch (error) {
        console.error("❌ 프롬프트 로드 실패:", error);
        // 에러가 나도 일단 로드됨으로 처리 (무한 재시도 방지)
        setIsLoaded(true);
      }
    };

    loadPrompts();
  }, [isLoaded, setPrompts, setIsLoaded]);

  return { isLoaded, prompts };
}
