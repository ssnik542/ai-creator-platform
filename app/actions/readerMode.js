"use server";

import { stripCodeFences } from "@/lib/utils";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transformForReaderMode({ content, mode }) {
  let instruction = "";

  if (mode === "quick") {
    instruction = `
Rewrite this article for a QUICK READ:
- Short paragraphs
- Bullet points where possible
- Remove deep explanations
- Keep key insights
- Keep HTML formatting
`;
  }

  if (mode === "beginner") {
    instruction = `
Rewrite this article for BEGINNERS:
- Simple language
- Explain technical terms
- Add examples
- Friendly tone
- Keep HTML formatting
`;
  }

  if (mode === "deep") {
    instruction = `
Rewrite this article for ADVANCED readers:
- Keep technical depth
- Add implementation insights
- Add trade-offs
- Keep HTML formatting
`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: instruction,
      },
      {
        role: "user",
        content: `CONTENT:${content}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim();
  const improvedContent = stripCodeFences(raw);
  return improvedContent;
}
