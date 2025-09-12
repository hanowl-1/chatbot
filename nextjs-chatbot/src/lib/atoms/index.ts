import { Message } from "@/types/chat";
import { Prompts } from "@/types/prompts";
import { atom } from "jotai";

// 채팅 메시지 atom
export const chatMessagesAtom = atom<Message[]>([]);

// 프롬프트 atom
export const promptsAtom = atom<Prompts>({
  // analyze_query: "",
  refine_question: { text: "", lastModified: undefined, version: undefined },
  generate_answer: { text: "", lastModified: undefined, version: undefined },
  assess_confidence: { text: "", lastModified: undefined, version: undefined },
  // generate_final_answer: "",
  system: { text: "", lastModified: undefined, version: undefined },
});

// 프롬프트가 이미 로드되었는지 체크하는 플래그
export const isPromptsLoadedAtom = atom(false);
