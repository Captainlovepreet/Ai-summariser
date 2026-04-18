import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export type SummaryStyle = "bullet points" | "prose" | "executive summary" | "action items";
export type SummaryLength = "short" | "medium" | "detailed";

export interface SummarizeOptions {
  style: SummaryStyle;
  length: SummaryLength;
}

export async function summarizeContent(
  content: string | { mimeType: string; data: string },
  options: SummarizeOptions
) {
  const prompt = `Summarize the provided content. 
Style: ${options.style}
Length: ${options.length}
Focus on key insights and main takeaways. 
If it's a transcript, identify speakers if possible. 
If it's a PDF, maintain technical accuracy.`;

  const contents = typeof content === "string" 
    ? { parts: [{ text: prompt }, { text: content }] }
    : {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: content.mimeType,
              data: content.data,
            },
          },
        ],
      };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
    // Optional: toolConfig if we want to force search
  });

  return response.text;
}

export async function chatWithContent(
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  message: string,
  contextData?: { mimeType: string; data: string }
) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are an expert content analyzer. You have access to the summarized content. Answer questions accurately based on the content provided.",
    },
    // We can't easily pass the file context in every message in the chat object directly if it's large,
    // but for gemini-3 we can include it in the initial message or as a part.
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ]
  });

  return response.text;
}
