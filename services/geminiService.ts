import { GoogleGenAI, Type, Content } from "@google/genai";
import type { ChatMessage } from "../types";

// Declare process to inform TypeScript about the global variable injected by the build environment.
declare var process: {
  env: {
    API_KEY: string;
  }
};

let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    // Per coding guidelines, use process.env.API_KEY for the Gemini API key.
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({ apiKey: apiKey });
    } else {
      throw new Error("Gemini API key is not available. Please ensure API_KEY is set in your Vercel environment variables.");
    }
  }
  return ai;
};

const buildContents = (history: ChatMessage[]): Content[] => {
    return history.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({ text: part.text }))
    }));
}

export const streamChatResponse = async (
    history: ChatMessage[],
    systemPrompt: string,
    useProModel: boolean
) => {
    // Use 'gemini-flash-lite-latest' as per guidelines.
    const modelName = useProModel ? 'gemini-2.5-pro' : 'gemini-flash-lite-latest';
    const config = useProModel ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
    
    const contents = buildContents(history);
    
    const genAI = getAi();
    return genAI.models.generateContentStream({
        model: modelName,
        contents,
        config: {
            ...config,
            systemInstruction: systemPrompt,
        }
    });
};


export const extractLeadInfo = async (
  history: ChatMessage[],
  collectionFields: string[]
): Promise<Record<string, any> | null> => {
  if (collectionFields.length === 0) return null;
  const genAI = getAi();
  
  const properties: Record<string, { type: Type, description: string }> = {};
  collectionFields.forEach(field => {
      // Sanitize field name to be a valid identifier for the schema
      const sanitizedField = field.replace(/[^a-zA-Z0-9_]/g, '_');
      properties[sanitizedField] = {
          type: Type.STRING,
          description: `The collected value for the field: ${field}`
      };
  });

  const schema = {
      type: Type.OBJECT,
      properties,
  };

  const modelName = 'gemini-2.5-flash';
  const contents = buildContents(history);
  
  const instruction = {
    role: 'user',
    parts: [{
      text: `Analyze the conversation and extract the information for the following fields: ${collectionFields.join(', ')}. If a piece of information is not present, leave the value as an empty string. Respond ONLY with the JSON object.`
    }]
  };
  
  contents.push(instruction as Content);
  
  try {
    const response = await genAI.models.generateContent({
        model: modelName,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
    });

    const jsonString = response.text.trim();
    if (jsonString) {
      return JSON.parse(jsonString);
    }
    return null;
  } catch (error) {
    console.error("Error extracting lead info:", error);
    return null;
  }
};