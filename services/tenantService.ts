
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
    serverTimestamp
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
    // Quietly fail to null to allow fallback logic to take over
    return null;
  }
  return db;
};

// --- Tenant Services ---
export const getTenants = async (): Promise<Tenant[]> => {
  const db = checkDb();
  if (!db) return MOCK_TENANTS;
  
  try {
      const tenantsCol = collection(db, 'tenants');
      const snapshot = await getDocs(tenantsCol);
      const dbTenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
      
      // Merge DB tenants with Mock tenants (if distinct IDs) so Demo always shows up
      const combined = [...dbTenants];
      MOCK_TENANTS.forEach(mock => {
          if (!combined.find(t => t.id === mock.id)) {
              combined.push(mock);
          }
      });
      
      return combined.length > 0 ? combined.map(migrateTenantColor) : MOCK_TENANTS;
  } catch (error) {
      console.warn("Firebase connection failed (likely CORS/Domain restrictions). Using Mock Data.", error);
      return MOCK_TENANTS;
  }
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  const db = checkDb();
  
  // Tenta buscar no DB primeiro
  if (db && !id.startsWith('mock-')) {
    try {
        const tenantRef = doc(db, 'tenants', id);
        const snapshot = await getDoc(tenantRef);
        if (snapshot.exists()) {
            const tenantData = { id: snapshot.id, ...snapshot.data() } as Tenant;
            return migrateTenantColor(tenantData);
        }
    } catch (error) {
        console.warn("Error fetching tenant from DB (Using Mock fallback):", error);
        // Se der erro (ex: permissão negada por domínio incorreto), cai para o fallback abaixo
    }
  }

  // Fallback: Procura nos Mocks
  // Isso garante que o Iframe funcione mesmo se o DB falhar
  const mockTenant = MOCK_TENANTS.find(t => t.id === id) || MOCK_TENANTS.find(t => t.id === 'mock-1');
  
  if (mockTenant) {
      // Se o ID solicitado não existe nos mocks, mas retornamos o mock-1 por segurança,
      // ajustamos o ID para manter consistência visual, a menos que seja um ID específico
      return migrateTenantColor(mockTenant);
  }
  
  return null;
};

export const addTenant = async (tenantData: Omit<Tenant, 'id'>): Promise<string> => {
  const db = checkDb();
  if (!db) {
      alert("Modo Demo: Tenant criado apenas localmente (não salvo).");
      return `mock-new-${Date.now()}`;
  }
  try {
    const docRef = await addDoc(collection(db, 'tenants'), tenantData);
    return docRef.id;
  } catch (e) {
      console.error(e);
      alert("Erro ao salvar no banco (verifique conexao/permissoes). Criando localmente.");
      return `mock-new-${Date.now()}`;
  }
};

export const updateTenant = async (id: string, tenantData: Partial<Tenant>): Promise<void> => {
  const db = checkDb();
  if (!db || id.startsWith('mock-')) {
      alert("Modo Demo: Alterações não são salvas permanentemente.");
      return;
  }
  const tenantRef = doc(db, 'tenants', id);
  await updateDoc(tenantRef, tenantData);
};

export const deleteTenant = async (id: string): Promise<void> => {
  const db = checkDb();
  if (!db || id.startsWith('mock-')) {
      alert("Modo Demo: Exclusão simulada.");
      return;
  }
  const tenantRef = doc(db, 'tenants', id);
  await deleteDoc(tenantRef);
};

// --- Lead Services ---
export const listenToLeads = (tenantId: string, callback: (leads: Lead[]) => void): (() => void) => {
    const db = checkDb();
    if (!db || tenantId.startsWith('mock-')) {
        console.warn("Using mock leads");
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
        console.log("Modo Demo - Lead atualizado com:", data);
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
