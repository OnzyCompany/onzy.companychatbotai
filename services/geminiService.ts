import { GoogleGenAI, Type, Content } from "@google/genai";
import type { ChatMessage } from "../types";

let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    // Definitive, correct API Key from the 'onzy-chatbot' project.
    const apiKey = "AIzaSyBvYQ9RUJHuNo7wwqZq190VD_LzxQN3NHM";
    if (!apiKey) {
      throw new Error("API_KEY is not configured.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const buildContents = (history: ChatMessage[]): Content[] => {
    return history.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({ text: part.text }))
    }));
}

export const getChatResponse = async (
    history: ChatMessage[],
    systemPrompt: string,
    useProModel: boolean
): Promise<string> => {
    const modelName = useProModel ? 'gemini-2.5-pro' : 'gemini-flash-lite-latest';
    const config = useProModel ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
    
    const contents = buildContents(history);
    
    const genAI = getAi();
    const response = await genAI.models.generateContent({
        model: modelName,
        contents,
        config: {
            ...config,
            systemInstruction: systemPrompt,
        }
    });

    return response.text;
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