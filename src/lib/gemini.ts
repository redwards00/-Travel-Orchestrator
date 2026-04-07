import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface AgentResult {
  agentName: string;
  content: string;
  sources?: { uri: string; title: string }[];
  status: 'idle' | 'loading' | 'success' | 'error';
}

export async function runAgent(agentName: string, prompt: string): Promise<AgentResult> {
  if (!apiKey) {
    return { agentName, content: "API Key missing.", status: 'error' };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are a specialized travel planning agent: ${agentName}. 
        Provide a detailed, helpful, and well-structured report in Markdown. 
        Focus on accuracy and real-time information. 
        Always include specific names, locations, and if possible, estimated costs or times.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const content = response.text || "No response from agent.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        uri: chunk.web!.uri,
        title: chunk.web!.title || chunk.web!.uri,
      })) || [];

    return {
      agentName,
      content,
      sources,
      status: 'success',
    };
  } catch (error) {
    console.error(`Error in agent ${agentName}:`, error);
    return {
      agentName,
      content: `Error: ${error instanceof Error ? error.message : String(error)}`,
      status: 'error',
    };
  }
}
