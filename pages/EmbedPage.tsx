
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTenantById } from '../services/tenantService';
import type { Tenant } from '../types';
import { FloatingChatButton } from '../components/FloatingChatButton';

const EmbedPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-onzy-dark"><p>Loading Assistant...</p></div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-screen bg-onzy-dark"><p className="text-red-500">{error}</p></div>;
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="w-full h-screen bg-transparent">
      <FloatingChatButton tenant={tenant} />
    </div>
  );
};

export default EmbedPage;
