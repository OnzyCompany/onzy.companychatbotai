
import React from 'react';
import type { Tenant } from '../types';
import { MessageSquareIcon, XIcon } from './Icons';

interface FloatingChatButtonProps {
  tenant: Tenant;
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ tenant, isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      // FIX: pointer-events-auto ensures the button is always clickable, even when the container has pointer-events-none.
      className="fixed bottom-5 right-5 w-16 h-16 rounded-full text-onzy-darker shadow-lg flex items-center justify-center transition-transform transform hover:scale-110 focus:outline-none z-50 pointer-events-auto"
      style={{ backgroundColor: tenant.themeColor }}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? <XIcon className="w-8 h-8" /> : <MessageSquareIcon className="w-8 h-8" />}
    </button>
  );
};
