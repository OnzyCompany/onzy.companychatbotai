
import { db, firebaseInitializationError } from "../firebase/config";
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where, 
    Timestamp,
    serverTimestamp,
    QuerySnapshot,
    DocumentSnapshot,
    DocumentData
} from "firebase/firestore";
import type { Tenant, Lead } from "../types";

// Constantes de cor para migração automática
const OLD_GREEN = '#00ffbb';
const NEW_PURPLE = '#8b5cf6';

// Helper para corrigir a cor de tenants antigos
const migrateTenantColor = (tenant: Tenant): Tenant => {
    if (tenant.themeColor === OLD_GREEN) {
        return { ...tenant, themeColor: NEW_PURPLE };
    }
    return tenant;
};

// Mock Data for fallback when DB is not available or empty
const MOCK_TENANTS: Tenant[] = [
    { 
        id: 'mock-1', 
        name: 'Onzy AI (Demo)', 
        themeColor: NEW_PURPLE, 
        systemPrompt: 'Você é o assistente virtual da Onzy AI. Seja útil, profissional e breve.', 
        whatsappNumber: '5511999998888', 
        collectionFields: ['nome', 'email'] 
    },
    { 
        id: 'mock-2', 
        name: 'Empresa Exemplo (Demo)', 
        themeColor: '#ff007f', 
        systemPrompt: 'Você é um especialista em vendas focado em fechar negócios. Seja persuasivo.', 
        whatsappNumber: '5521988887777', 
        collectionFields: ['nome', 'empresa', 'servico'] 
    }
];

const checkDb = () => {
  if (!db) {
    return null;
  }
  return db;
};

// Helper para evitar travamentos por bloqueio de CORS/Firebase
const withTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error("Firebase Connection Timeout (Domain likely blocked)")), ms)
        )
    ]);
};

// --- Tenant Services ---
export const getTenants = async (): Promise<Tenant[]> => {
  const db = checkDb();
  if (!db) return MOCK_TENANTS;
  
  try {
      const tenantsCol = collection(db, 'tenants');
      // Timeout curto para evitar tela branca se o domínio for bloqueado
      const snapshot = await withTimeout<QuerySnapshot<DocumentData>>(getDocs(tenantsCol));
      const dbTenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
      
      const combined = [...dbTenants];
      MOCK_TENANTS.forEach(mock => {
          if (!combined.find(t => t.id === mock.id)) {
              combined.push(mock);
          }
      });
      
      return combined.length > 0 ? combined.map(migrateTenantColor) : MOCK_TENANTS;
  } catch (error) {
      console.warn("Firebase load failed or timed out. Using Mock Data.", error);
      return MOCK_TENANTS;
  }
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  const db = checkDb();
  
  // Tenta buscar no DB primeiro
  if (db && !id.startsWith('mock-')) {
    try {
        const tenantRef = doc(db, 'tenants', id);
        // Timeout CRÍTICO: Se o Firebase bloquear o domínio, ele não responde erro imediato, ele trava.
        // O timeout força o erro para cair no catch e mostrar o Mock.
        const snapshot = await withTimeout<DocumentSnapshot<DocumentData>>(getDoc(tenantRef));
        
        if (snapshot.exists()) {
            const tenantData = { id: snapshot.id, ...snapshot.data() } as Tenant;
            return migrateTenantColor(tenantData);
        }
    } catch (error) {
        console.warn("Error fetching tenant from DB (likely blocked domain). Fallback to Mock.", error);
        // Continua para o fallback abaixo
    }
  }

  // Fallback: Procura nos Mocks
  const mockTenant = MOCK_TENANTS.find(t => t.id === id) || MOCK_TENANTS.find(t => t.id === 'mock-1');
  
  if (mockTenant) {
      return migrateTenantColor(mockTenant);
  }
  
  return null;
};

export const addTenant = async (tenantData: Omit<Tenant, 'id'>): Promise<string> => {
  const db = checkDb();
  if (!db) {
      alert("Modo Demo: Tenant criado apenas localmente.");
      return `mock-new-${Date.now()}`;
  }
  try {
    const docRef = await addDoc(collection(db, 'tenants'), tenantData);
    return docRef.id;
  } catch (e) {
      console.error(e);
      alert("Erro ao salvar no banco. Criando localmente.");
      return `mock-new-${Date.now()}`;
  }
};

export const updateTenant = async (id: string, tenantData: Partial<Tenant>): Promise<void> => {
  const db = checkDb();
  if (!db || id.startsWith('mock-')) {
      return;
  }
  const tenantRef = doc(db, 'tenants', id);
  await updateDoc(tenantRef, tenantData);
};

export const deleteTenant = async (id: string): Promise<void> => {
  const db = checkDb();
  if (!db || id.startsWith('mock-')) {
      return;
  }
  const tenantRef = doc(db, 'tenants', id);
  await deleteDoc(tenantRef);
};

// --- Lead Services ---
export const listenToLeads = (tenantId: string, callback: (leads: Lead[]) => void): (() => void) => {
    const db = checkDb();
    if (!db || tenantId.startsWith('mock-')) {
        // Retorna mock leads imediatamente
        callback([
            { id: 'lead-1', sessionId: 'sess-1', createdAt: {}, updatedAt: {}, nome: 'João Silva', email: 'joao@example.com' },
            { id: 'lead-2', sessionId: 'sess-2', createdAt: {}, updatedAt: {}, nome: 'Maria Santos', email: 'maria@example.com' }
        ] as any);
        return () => {};
    }

    try {
        const leadsCol = collection(db, 'tenants', tenantId, 'leads');
        const q = query(leadsCol);
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
            callback(leads);
        }, (error) => {
            console.error("Error listening to leads:", error);
            // Em caso de erro de permissão/domínio no listener, não travamos a UI
            callback([]);
        });
        return unsubscribe;
    } catch (e) {
        callback([]);
        return () => {};
    }
};

export const findOrCreateLeadBySession = async (tenantId: string, sessionId: string): Promise<string> => {
    const db = checkDb();
    if (!db || tenantId.startsWith('mock-')) return "mock-lead-id";
    
    try {
        const leadsCol = collection(db, 'tenants', tenantId, 'leads');
        const q = query(leadsCol, where('sessionId', '==', sessionId));
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        }
        
        const newLeadData = {
            sessionId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(leadsCol, newLeadData);
        return docRef.id;
    } catch (error) {
        console.error("Error finding/creating lead:", error);
        return "mock-lead-id";
    }
};

export const updateLead = async (tenantId: string, leadId: string, data: Partial<Lead>): Promise<void> => {
    const db = checkDb();
    if (!db || tenantId.startsWith('mock-')) {
        return;
    }
    
    try {
        const leadRef = doc(db, 'tenants', tenantId, 'leads', leadId);
        await updateDoc(leadRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating lead:", error);
    }
};
