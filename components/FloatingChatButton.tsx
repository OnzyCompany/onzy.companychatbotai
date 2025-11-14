
import React, { useState } from 'react';
import { ChatWidget } from './ChatWidget';
import type { Tenant } from '../types';
import { MessageSquareIcon, XIcon } from './Icons';
import { clearSessionId } from '../utils/session';

interface FloatingChatButtonProps {
  tenant: Tenant;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ tenant }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(prev => {
        // Clear session when closing the chat
        if (prev) {
            clearSessionId();
        }
        return !prev;
    });
  };

  return (
    <>
      {isOpen && <ChatWidget tenant={tenant} isEmbed={true} />}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 w-16 h-16 rounded-full text-onzy-darker shadow-lg flex items-center justify-center transition-transform transform hover:scale-110 focus:outline-none z-50"
        style={{ backgroundColor: tenant.themeColor }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <XIcon className="w-8 h-8" /> : <MessageSquareIcon className="w-8 h-8" />}
      </button>
    </>
  );
};
