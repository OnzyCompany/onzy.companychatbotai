
import React, { useState, useEffect } from 'react';
// Fix: Changed react-router-dom import to use namespace import to resolve "no exported member" error.
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
          setError("Tenant not found.");
        }
      } catch (err) {
        setError("Failed to load tenant configuration.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [tenantId]);

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
  }, []);

  const toggleChat = () => {
    setIsChatOpen(prev => {
        if (prev) {
            clearSessionId();
        }
        return !prev;
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-transparent"><p>Loading Assistant...</p></div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-screen bg-transparent"><p className="text-red-500">{error}</p></div>;
  }

  if (!tenant) {
    return null;
  }

  // FIX: This container makes the entire iframe area "click-through" when the chat is closed,
  // preventing the invisible iframe from blocking content on the parent page on all devices.
  return (
    <div className={`w-full h-screen bg-transparent ${!isChatOpen ? 'pointer-events-none' : ''}`}>
      {isChatOpen && <ChatWidget tenant={tenant} isEmbed={true} onClose={toggleChat} />}
      {!isChatOpen && <FloatingChatButton tenant={tenant} isOpen={isChatOpen} onClick={toggleChat} />}
    </div>
  );
};

export default EmbedPage;