
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTenants, addTenant, updateTenant, deleteTenant } from '../services/tenantService';
import type { Tenant } from '../types';
import { TenantFormModal } from '../components/TenantFormModal';
import { EmbedCodeModal } from '../components/EmbedCodeModal';
import { OnzyLogoIcon } from '../components/Icons';

const mockTenants: Tenant[] = [
    { id: 'mock-1', name: 'Onzy AI (Preview)', themeColor: '#00ffbb', systemPrompt: 'You are a helpful AI assistant for Onzy.', whatsappNumber: '5511999998888', collectionFields: ['name', 'email'] },
    { id: 'mock-2', name: 'Onzy Company (Preview)', themeColor: '#ff007f', systemPrompt: 'You are a helpful sales agent for Onzy Company.', whatsappNumber: '5521988887777', collectionFields: ['name', 'companyName', 'serviceType'] }
];


const AdminPanel: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantForEmbed, setTenantForEmbed] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tenantsData = await getTenants();
      setTenants(tenantsData);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("firestore is not initialized")) {
        console.warn("Firestore not initialized, loading mock data for development preview.");
        setTenants(mockTenants);
      } else {
        setError(err.message || "Falha ao carregar tenants.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleSaveTenant = async (tenantData: Omit<Tenant, 'id'> | Tenant) => {
    try {
      if ('id' in tenantData) {
        await updateTenant(tenantData.id, tenantData);
      } else {
        await addTenant(tenantData);
      }
      fetchTenants();
      setIsFormModalOpen(false);
      setSelectedTenant(null);
    } catch (err) {
      console.error("Failed to save tenant:", err);
      alert("Failed to save tenant. Check console for details. Are you in preview mode?");
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tenant?')) {
      try {
        await deleteTenant(id);
        fetchTenants();
      } catch (err) {
        console.error("Failed to delete tenant:", err);
        alert("Failed to delete tenant. Check console for details. Are you in preview mode?");
      }
    }
  };
  
  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsFormModalOpen(true);
  };
  
  const openCreateModal = () => {
    setSelectedTenant(null);
    setIsFormModalOpen(true);
  };

  const openEmbedModal = (tenantId: string) => {
    setTenantForEmbed(tenantId);
    setIsEmbedModalOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p>Loading Tenants...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button onClick={fetchTenants} className="px-6 py-2 rounded-lg bg-onzy-neon text-onzy-darker font-bold hover:opacity-90 transition-opacity">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onzy-darker p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3">
            <OnzyLogoIcon className="w-10 h-10 text-onzy-neon" />
            <h1 className="text-3xl font-bold">Onzy Admin Panel</h1>
          </div>
          <button onClick={openCreateModal} className="px-4 py-2 rounded-lg bg-onzy-neon text-onzy-darker font-bold hover:opacity-90 transition-opacity">
            + Criar Novo Tenant
          </button>
        </header>

        <main>
          <h2 className="text-2xl font-semibold mb-6">Gerenciamento de Tenants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="bg-onzy-dark border border-onzy-light-gray rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <Link to={`/${tenant.id}`} className="block hover:text-onzy-neon transition-colors">
                    <h3 className="text-xl font-bold" style={{ color: tenant.themeColor }}>{tenant.name}</h3>
                    <p className="text-sm text-onzy-text-secondary">ID: {tenant.id}</p>
                  </Link>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-onzy-light-gray pt-4">
                  <button onClick={() => openEmbedModal(tenant.id)} className="text-sm text-onzy-text-secondary hover:text-onzy-neon">Código</button>
                  <button onClick={() => openEditModal(tenant)} className="text-sm text-onzy-text-secondary hover:text-onzy-neon">Editar</button>
                  <button onClick={() => handleDeleteTenant(tenant.id)} className="text-sm text-red-500 hover:text-red-400">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <TenantFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveTenant}
          tenantToEdit={selectedTenant}
        />

        <EmbedCodeModal
            isOpen={isEmbedModalOpen}
            onClose={() => setIsEmbedModalOpen(false)}
            tenantId={tenantForEmbed}
        />
      </div>
    </div>
  );
};

export default AdminPanel;