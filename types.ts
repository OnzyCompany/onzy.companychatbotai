

export interface Tenant {
  id: string;
  name: string;
  themeColor: string;
  systemPrompt: string;
  whatsappNumber: string;
  collectionFields: string[];
}

export interface Lead {
  id: string;
  sessionId: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  [key: string]: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}