
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
    const clearBackground = () => {
        // Remove propriedades de cor do HTML, BODY e ROOT
        document.documentElement.style.setProperty('background-color', 'transparent', 'important');
        document.body.style.setProperty('background-color', 'transparent', 'important');
        const root = document.getElementById('root');
        if (root) root.style.setProperty('background-color', 'transparent', 'important');
        
        // Remove classes do Tailwind que possam estar definindo fundo
        document.body.classList.remove('bg-onzy-dark', 'bg-onzy-darker', 'bg-gray-900', 'bg-black');
        document.body.style.overflow = 'hidden'; // Evita barras de rolagem no iframe
    };

    // Executa imediatamente
    clearBackground();
    
    // E reforça a cada 100ms nos primeiros segundos para garantir que nenhum CSS externo sobrescreva
    const interval = setInterval(clearBackground, 100);
    
    // Para o intervalo após 2 segundos
    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        // Restaura estilos ao sair (opcional, mas boa prática se SPA mudar de rota)
        document.documentElement.style.removeProperty('background-color');
        document.body.style.removeProperty('background-color');
        document.body.style.removeProperty('overflow');
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
    // Spinner de carregamento
    return (
        <div className="fixed bottom-5 right-5 w-16 h-16 flex items-center justify-center z-[999999] pointer-events-none">
            <div className="w-8 h-8 border-4 border-onzy-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }
  
  if (error) {
    return (
        <div className="fixed bottom-5 right-5 bg-red-600 text-white p-3 rounded-lg shadow-lg z-[999999] max-w-xs text-xs">
            <strong>Erro:</strong> {error}
        </div>
    );
  }

  if (!tenant) return null;

  return (
    <div className={`w-full h-screen bg-transparent ${!isChatOpen ? 'pointer-events-none' : ''}`}>
      {isChatOpen && <ChatWidget tenant={tenant} isEmbed={true} onClose={toggleChat} />}
      
      {/* Botão flutuante sempre visível quando o chat está fechado */}
      {!isChatOpen && (
        <div className="pointer-events-auto z-[999999]">
            <FloatingChatButton tenant={tenant} isOpen={isChatOpen} onClick={toggleChat} />
        </div>
      )}
    </div>
  );
};

export default EmbedPage;
