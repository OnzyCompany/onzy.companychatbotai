
// MOCK DATA MODE - Firebase is disabled in firebase/config.ts

import type { Tenant, Lead } from "../types";

// In-memory store for mock data
let mockTenants: Tenant[] = [
  {
    id: 'onzy-ai',
    name: 'Onzy AI',
    themeColor: '#00ffbb',
    systemPrompt: 'You are a helpful AI assistant for Onzy AI, a company specializing in artificial intelligence solutions.',
    whatsappNumber: '5511999999999',
    collectionFields: ['Nome', 'Empresa', 'Email', 'Necessidade'],
  },
  {
    id: 'onzy-company',
    name: 'Onzy Company',
    themeColor: '#ff6347',
    systemPrompt: 'You are a friendly customer support bot for Onzy Company, helping users with their general inquiries.',
    whatsappNumber: '5521888888888',
    collectionFields: ['Nome Completo', 'Email', 'Assunto', 'Mensagem'],
  },
];

let mockLeads: { [tenantId: string]: Lead[] } = {
    'onzy-ai': [
        {
            id: 'lead1',
            sessionId: 'session123',
            createdAt: new Date(),
            updatedAt: new Date(),
            Nome: 'João Silva',
            Empresa: 'Tech Corp',
            Email: 'joao.silva@example.com',
            Necessidade: 'Desenvolvimento de um novo chatbot'
        }
    ]
};
let leadIdCounter = 2;


const checkDb = () => {
  // In mock mode, this check is disabled.
  return true;
};

// --- Tenant Services (Mock) ---
export const getTenants = async (): Promise<Tenant[]> => {
  console.log("MOCK: Fetching tenants");
  return Promise.resolve(mockTenants);
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  console.log(`MOCK: Fetching tenant by ID: ${id}`);
  const tenant = mockTenants.find(t => t.id === id) || null;
  return Promise.resolve(tenant);
};

export const addTenant = async (tenantData: Omit<Tenant, 'id'>): Promise<string> => {
  console.log("MOCK: Adding new tenant", tenantData);
  const newTenant: Tenant = {
    id: `mock-${Date.now()}`,
    ...tenantData,
  };
  mockTenants.push(newTenant);
  return Promise.resolve(newTenant.id);
};

export const updateTenant = async (id: string, tenantData: Partial<Tenant>): Promise<void> => {
  console.log(`MOCK: Updating tenant ${id}`, tenantData);
  mockTenants = mockTenants.map(t => (t.id === id ? { ...t, ...tenantData } : t));
  return Promise.resolve();
};

export const deleteTenant = async (id: string): Promise<void> => {
  console.log(`MOCK: Deleting tenant ${id}`);
  mockTenants = mockTenants.filter(t => t.id !== id);
  return Promise.resolve();
};

// --- Lead Services (Mock) ---
export const listenToLeads = (tenantId: string, callback: (leads: Lead[]) => void): (() => void) => {
    console.log(`MOCK: Listening to leads for tenant ${tenantId}`);
    const leadsForTenant = mockLeads[tenantId] || [];
    callback(leadsForTenant);
    
    // Return a dummy unsubscribe function as there's no real-time subscription.
    return () => { console.log("MOCK: Unsubscribed from leads."); };
};


export const findOrCreateLeadBySession = async (tenantId: string, sessionId: string): Promise<string> => {
    console.log(`MOCK: Finding/creating lead for session ${sessionId}`);
    if (!mockLeads[tenantId]) {
        mockLeads[tenantId] = [];
    }
    const existingLead = mockLeads[tenantId].find(l => l.sessionId === sessionId);
    if (existingLead) {
        return Promise.resolve(existingLead.id);
    }
    
    const newLead: Lead = {
        id: `lead${leadIdCounter++}`,
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    mockLeads[tenantId].push(newLead);
    return Promise.resolve(newLead.id);
};

export const updateLead = async (tenantId: string, leadId: string, data: Partial<Lead>): Promise<void> => {
    console.log(`MOCK: Updating lead ${leadId} for tenant ${tenantId}`, data);
    if (mockLeads[tenantId]) {
        const leadIndex = mockLeads[tenantId].findIndex(l => l.id === leadId);
        if (leadIndex !== -1) {
            mockLeads[tenantId][leadIndex] = {
                ...mockLeads[tenantId][leadIndex],
                ...data,
                updatedAt: new Date()
            };
        }
    }
    return Promise.resolve();
};
