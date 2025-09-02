import { Message } from "@/types/chat";
import { Prompts } from "@/types/prompts";
import { atom } from "jotai";

// 채팅 메시지 atom
export const chatMessagesAtom = atom<Message[]>([]);

// 프롬프트 atom
export const promptsAtom = atom<Prompts>({
  analyze_query: "",
  generate_answer: "",
  assess_confidence: "",
  generate_final_answer: "",
});
