
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
  style="position:fixed; bottom:20px; right:20px; width:min(90vw, 400px); height:min(80vh, 700px); border:none; border-radius:12px; z-index:9999;"
  allow="clipboard-write; autoplay; microphone"
  title="Onzy AI Assistant">
</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-onzy-dark border border-onzy-light-gray rounded-lg p-8 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-onzy-text-secondary hover:text-onzy-neon">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Embed Onzy Assistant</h2>
        <p className="text-onzy-text-secondary mb-6">
          Copie e cole este código no HTML do seu site, logo antes da tag de fechamento <code>&lt;/body&gt;</code>.
        </p>
        
        <div className="bg-onzy-gray rounded-lg p-4 relative">
          <textarea
            readOnly
            value={embedCode}
            className="w-full h-48 bg-transparent text-onzy-text-secondary resize-none border-none focus:outline-none font-mono text-sm"
          />
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 px-3 py-1 rounded-md bg-onzy-light-gray text-xs text-onzy-text hover:bg-onzy-neon hover:text-onzy-darker transition-colors"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        
        <div className="flex justify-end pt-6">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-onzy-light-gray hover:bg-onzy-gray text-onzy-text transition-colors">Fechar</button>
        </div>
      </div>
    </div>
  );
};
