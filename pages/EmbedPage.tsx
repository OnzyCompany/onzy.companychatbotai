import React, { useState, useLayoutEffect } from 'react';
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

  // Garante que o fundo seja transparente assim que o componente montar
  useLayoutEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    const root = document.getElementById('root');
    if (root) root.style.backgroundColor = 'transparent';
    
    // Remove classes escuras que possam ter sido injetadas
    document.body.classList.remove('bg-onzy-dark', 'bg-onzy-darker');
    
    return () => {
        // Cleanup opcional
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
    }
  }, []);

  React.useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) {
        setError("ID não fornecido.");
        setLoading(false);
        return;
      }
      try {
        const tenantData = await getTenantById(tenantId);
        if (tenantData) {
          setTenant(tenantData);
        } else {
          setError("Tenant não encontrado.");
        }
      } catch (err) {
        setError("Erro ao carregar.");
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
    // Mostra um pequeno spinner transparente para indicar que está carregando (em vez de invisível total)
    return (
        <div className="fixed bottom-5 right-5 w-16 h-16 flex items-center justify-center z-50">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }
  
  if (error) {
    return (
        <div className="fixed bottom-5 right-5 bg-red-600 text-white p-3 rounded-lg shadow-lg z-50 max-w-xs text-xs">
            <strong>Erro:</strong> {error}
        </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className={`w-full h-screen bg-transparent ${!isChatOpen ? 'pointer-events-none' : ''}`}>
      {isChatOpen && <ChatWidget tenant={tenant} isEmbed={true} onClose={toggleChat} />}
      {!isChatOpen && <FloatingChatButton tenant={tenant} isOpen={isChatOpen} onClick={toggleChat} />}
    </div>
  );
};

export default EmbedPage;