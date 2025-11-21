
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getTenantById } from '../services/tenantService';
import type { Tenant } from '../types';
import { FloatingChatButton } from '../components/FloatingChatButton';
import { ChatWidget } from '../components/ChatWidget';
import { clearSessionId } from '../utils/session';

const EmbedPage: React.FC = () => {
  const { tenantId } = ReactRouterDOM.useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      // Se não houver ID na URL, tenta usar o mock padrão para garantir que algo apareça
      const targetId = tenantId || 'mock-1';
      
      try {
        const tenantData = await getTenantById(targetId);
        if (tenantData) {
          setTenant(tenantData);
        } else {
          // Se falhar, fallback para um tenant manual para evitar tela preta vazia
          setTenant({
              id: 'fallback',
              name: 'Chatbot',
              themeColor: '#8b5cf6',
              systemPrompt: 'Assistente virtual',
              whatsappNumber: '',
              collectionFields: []
          });
        }
      } catch (err) {
        setError("Erro de conexão.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [tenantId]);

  const toggleChat = () => {
    setIsChatOpen(prev => {
        if (prev) {
            clearSessionId();
        }
        return !prev;
    });
  };

  if (loading) {
    return (
        <div className="fixed bottom-5 right-5 w-16 h-16 flex items-center justify-center z-[999999] pointer-events-none">
             {/* Spinner simples */}
            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className={`w-full h-screen bg-transparent ${!isChatOpen ? 'pointer-events-none' : ''}`}>
      {isChatOpen && <ChatWidget tenant={tenant} isEmbed={true} onClose={toggleChat} />}
      
      {!isChatOpen && (
        <div className="pointer-events-auto z-[999999]">
            <FloatingChatButton tenant={tenant} isOpen={isChatOpen} onClick={toggleChat} />
        </div>
      )}
    </div>
  );
};

export default EmbedPage;
