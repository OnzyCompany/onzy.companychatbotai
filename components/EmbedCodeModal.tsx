import React, { useState } from 'react';
import { XIcon } from './Icons';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ isOpen, onClose, tenantId }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tenantId) return null;

  const embedUrl = `${window.location.origin}${window.location.pathname}#/embed/${tenantId}`;
  
  const embedCode = `<iframe
  src="${embedUrl}"
  title="Onzy AI Assistant"
  style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    border: none;
    z-index: 9999;
    width: min(420px, 90vw);
    height: min(720px, 85vh);
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0,0,0,0.16);
  "
  allow="microphone"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-onzy-dark border border-onzy-light-gray rounded-lg p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-onzy-text-secondary hover:text-onzy-neon">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Código de Incorporação</h2>
        <p className="text-sm text-onzy-text-secondary mb-4">
          Copie e cole este código no HTML do seu site para adicionar o chatbot.
        </p>
        <div className="bg-onzy-darker p-4 rounded-lg">
          <pre className="text-sm text-onzy-text whitespace-pre-wrap overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-onzy-neon text-onzy-darker font-bold hover:opacity-90 transition-opacity"
          >
            {copied ? 'Copiado!' : 'Copiar Código'}
          </button>
        </div>
      </div>
    </div>
  );
};
