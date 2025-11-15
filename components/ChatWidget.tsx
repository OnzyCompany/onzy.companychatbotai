
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatResponse, extractLeadInfo } from '../services/geminiService';
import type { ChatMessage, Tenant } from '../types';
import { getSessionId } from '../utils/session';
import { findOrCreateLeadBySession, updateLead } from '../services/tenantService';
import { SendIcon, ZapIcon, BrainCircuitIcon } from './Icons';
import { loadChatHistory, saveChatHistory } from '../utils/session';

interface ChatWidgetProps {
  tenant: Tenant;
  isEmbed: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ tenant, isEmbed }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedHistory = loadChatHistory(tenant.id);
    return savedHistory || [
      {
        role: 'model',
        parts: [{ text: `Olá! Eu sou o assistente virtual da ${tenant.name}. Como posso ajudar?` }],
        timestamp: Date.now(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useProModel, setUseProModel] = useState(false); // Thinking mode
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingLead = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    saveChatHistory(tenant.id, messages);
  }, [messages, tenant.id]);


  const processLeadExtraction = useCallback(async (history: ChatMessage[]) => {
    if (isProcessingLead.current || !tenant.collectionFields || tenant.collectionFields.length === 0) {
        return;
    }
    isProcessingLead.current = true;
    try {
        const extractedData = await extractLeadInfo(history, tenant.collectionFields);
        if (extractedData && Object.values(extractedData).some(v => v)) {
            const sessionId = getSessionId();
            const leadId = await findOrCreateLeadBySession(tenant.id, sessionId);
            await updateLead(tenant.id, leadId, extractedData);
        }
    } catch (error) {
        console.error("Failed to process lead extraction:", error);
    } finally {
        isProcessingLead.current = false;
    }
  }, [tenant.id, tenant.collectionFields]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: input }],
      timestamp: Date.now(),
    };

    const newHistory = [...messages, newUserMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const modelResponseText = await getChatResponse(newHistory, tenant.systemPrompt, useProModel);
      
      const finalModelMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: modelResponseText }],
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, finalModelMessage]);
      
      const finalHistory = [...newHistory, finalModelMessage];
      processLeadExtraction(finalHistory);

    } catch (error: any) {
      console.error("Error from Gemini API:", error);
      const errorMessageText = `Desculpe, ocorreu um erro. Detalhes: ${error.message || 'Falha ao contatar a IA.'}`;
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: errorMessageText }],
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const containerClass = isEmbed
    ? 'fixed bottom-20 right-5 w-full max-w-sm h-[70vh] max-h-[600px] bg-onzy-gray rounded-lg shadow-2xl flex flex-col z-50'
    : 'w-full h-full bg-onzy-gray rounded-lg flex flex-col';

  return (
    <div className={containerClass} style={{ borderColor: tenant.themeColor, borderWidth: isEmbed ? '1px' : '0' }}>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-onzy-neon text-onzy-darker' : 'bg-onzy-light-gray'}`}>
              <p className="whitespace-pre-wrap">{msg.parts.map(p => p.text).join('')}</p>
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-xs rounded-lg px-4 py-2 bg-onzy-light-gray">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-onzy-text-secondary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-onzy-text-secondary rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-onzy-text-secondary rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-onzy-light-gray">
        <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-onzy-text-secondary">AI Model</div>
            <div className="flex items-center space-x-2 p-1 bg-onzy-dark rounded-full">
                <button
                    onClick={() => setUseProModel(false)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${!useProModel ? 'bg-onzy-neon text-onzy-darker' : 'text-onzy-text-secondary'}`}
                >
                    <ZapIcon className="w-4 h-4 inline-block mr-1"/>
                    Fast
                </button>
                <button
                    onClick={() => setUseProModel(true)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${useProModel ? 'bg-onzy-neon text-onzy-darker' : 'text-onzy-text-secondary'}`}
                >
                    <BrainCircuitIcon className="w-4 h-4 inline-block mr-1"/>
                    Thinking Mode
                </button>
            </div>
        </div>
        <form onSubmit={handleSend} className="flex items-center bg-onzy-light-gray rounded-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-grow bg-transparent p-3 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-3 text-onzy-neon disabled:text-onzy-text-secondary disabled:cursor-not-allowed"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};
