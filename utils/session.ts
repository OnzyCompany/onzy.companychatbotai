
import type { ChatMessage } from '../types';

const SESSION_ID_KEY = 'onzy_chat_session_id';
const CHAT_HISTORY_PREFIX = 'onzy_chat_history_';

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const clearSessionId = (): void => {
  sessionStorage.removeItem(SESSION_ID_KEY);
}

export const saveChatHistory = (tenantId: string, messages: ChatMessage[]): void => {
    if (!tenantId) return;
    try {
        const historyJson = JSON.stringify(messages);
        sessionStorage.setItem(`${CHAT_HISTORY_PREFIX}${tenantId}`, historyJson);
    } catch (error) {
        console.error("Could not save chat history:", error);
    }
}

export const loadChatHistory = (tenantId: string): ChatMessage[] | null => {
    if (!tenantId) return null;
    try {
        const historyJson = sessionStorage.getItem(`${CHAT_HISTORY_PREFIX}${tenantId}`);
        return historyJson ? JSON.parse(historyJson) : null;
    } catch (error) {
        console.error("Could not load chat history:", error);
        return null;
    }
}
