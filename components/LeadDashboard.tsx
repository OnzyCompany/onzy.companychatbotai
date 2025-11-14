
import React, { useState, useEffect } from 'react';
import { listenToLeads } from '../services/tenantService';
import type { Lead } from '../types';
import { WhatsAppIcon } from './Icons';

interface LeadDashboardProps {
  tenantId: string;
  whatsappNumber: string;
}

export const LeadDashboard: React.FC<LeadDashboardProps> = ({ tenantId, whatsappNumber }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToLeads(tenantId, (newLeads) => {
      setLeads(newLeads);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId]);

  const handleSendToWhatsApp = (lead: Lead) => {
    const leadData = Object.entries(lead)
      .filter(([key]) => !['id', 'sessionId', 'createdAt', 'updatedAt'].includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const message = encodeURIComponent(`Novo Lead Recebido:\n\n${leadData}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };
  
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    return 'N/A';
  }

  return (
    <div className="p-8 bg-onzy-gray rounded-lg">
      <h2 className="text-2xl font-bold mb-6" style={{color: '#f0f0f0'}}>Leads & Informações Coletadas</h2>
      {loading && <p>Carregando leads...</p>}
      {!loading && leads.length === 0 && <p>Nenhum lead coletado ainda.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-onzy-dark border border-onzy-light-gray rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-onzy-neon">Lead #{lead.id.substring(0, 6)}</h3>
              <p className="text-xs text-onzy-text-secondary mb-4">{formatDate(lead.updatedAt)}</p>
              <div className="space-y-2 text-sm">
                {Object.entries(lead)
                  .filter(([key]) => !['id', 'sessionId', 'createdAt', 'updatedAt'].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <span className="font-semibold capitalize text-onzy-text-secondary">{key.replace(/([A-Z])/g, ' $1')}: </span>
                      <span className="text-onzy-text">{value}</span>
                    </div>
                  ))}
              </div>
            </div>
            <button 
              onClick={() => handleSendToWhatsApp(lead)}
              className="mt-6 w-full bg-onzy-light-gray hover:bg-onzy-neon hover:text-onzy-darker transition-colors text-onzy-text font-bold py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              Enviar para WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
