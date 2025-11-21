
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
    // Force transparent background for iframe usage
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    
    const fetchTenant = async () => {
      if (!tenantId) {
        setError("Tenant ID is missing.");
        setLoading(false);
        return;
      }
      try {
        const tenantData = await getTenantById(tenantId);
        if (tenantData) {
          setTenant(tenantData);
        } else {
          setError(`Tenant "${tenantId}" not found.`);
        }
      } catch (err) {
        setError("Failed to load tenant configuration.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
    
    return () => {
        // Cleanup if unmounted (though usually unmount implies page close)
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
    }
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
    return null; // Keep invisible while loading
  }
  
  if (error) {
    // Show a visible error bubble so the user knows the iframe loaded but failed
    return (
        <div className="fixed bottom-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-xs">
            <p className="text-sm font-bold">Onzy Error:</p>
            <p className="text-xs">{error}</p>
        </div>
    );
  }

  if (!tenant) {
    return (
        <div className="fixed bottom-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
            <p className="text-xs">Tenant not initialized.</p>
        </div>
    );
  }

  return (
    <div className={`w-full h-screen bg-transparent ${!isChatOpen ? 'pointer-events-none' : ''}`}>
      {isChatOpen && <ChatWidget tenant={tenant} isEmbed={true} onClose={toggleChat} />}
      {!isChatOpen && <FloatingChatButton tenant={tenant} isOpen={isChatOpen} onClick={toggleChat} />}
    </div>
  );
};

export default EmbedPage;
