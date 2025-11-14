
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTenantById } from '../services/tenantService';
import type { Tenant } from '../types';
import { ChatWidget } from '../components/ChatWidget';
import { LeadDashboard } from '../components/LeadDashboard';
import { OnzyLogoIcon } from '../components/Icons';

type View = 'assistant' | 'dashboard';

const TenantPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('assistant');

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
        setError("Failed to load tenant data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [tenantId]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p>Loading Tenant...</p></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen"><p className="text-red-500">{error}</p></div>;
  }
  
  if (!tenant) return null;

  const TabButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
        activeView === view ? 'bg-onzy-neon text-onzy-darker' : 'bg-transparent text-onzy-text-secondary hover:bg-onzy-light-gray'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-onzy-darker p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <OnzyLogoIcon className="w-8 h-8" style={{ color: tenant.themeColor }} />
            <h1 className="text-2xl sm:text-3xl font-bold text-onzy-text">{tenant.name}</h1>
          </div>
          <Link
            to="/"
            className="text-sm text-onzy-text-secondary hover:text-onzy-neon border border-onzy-light-gray px-4 py-2 rounded-lg transition-colors"
          >
            &larr; Voltar ao Painel
          </Link>
        </header>

        <main>
          <div className="mb-8 p-1 bg-onzy-gray rounded-lg flex justify-center space-x-2">
            <TabButton view="assistant" label="Onzy Assistant" />
            <TabButton view="dashboard" label="Tenant Dashboard" />
          </div>

          <div className="bg-onzy-dark rounded-lg p-2 min-h-[600px]">
            {activeView === 'assistant' && <ChatWidget tenant={tenant} isEmbed={false} />}
            {activeView === 'dashboard' && <LeadDashboard tenantId={tenant.id} whatsappNumber={tenant.whatsappNumber} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantPage;
