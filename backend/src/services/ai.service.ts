import OpenAI from "openai";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY || "dummy-key",
});

export class AiService {
  static async getChatCompletion(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
    if (!OPENROUTER_API_KEY) {
      console.warn("No OpenRouter API key found. Returning mock response.");
      return "This is a mock AI response. Please configure OPENROUTER_API_KEY.";
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo", // You can change this to any openrouter model
        messages: [
          { role: "system", content: "You are a strict educational platform assistant. CRITICAL RULE: If the user's message is NOT directly related to the educational platform, courses, buying courses, or learning, you MUST reply EXACTLY with the string '(invalid question)'. Do NOT provide any other information. Do NOT answer the question. If it's off-topic, output ONLY '(invalid question)'." },
          ...messages
        ],
      });

      return completion.choices[0]?.message?.content || "No response generated.";
    } catch (error: any) {
      console.error("Error calling OpenRouter API:", error);
      throw new Error("Failed to get AI response");
    }
  }
}
