
const SESSION_ID_KEY = 'onzy_chat_session_id';

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
