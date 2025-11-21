
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

// Mock Data for fallback when DB is not available or empty
const MOCK_TENANTS: Tenant[] = [
    { 
        id: 'mock-1', 
        name: 'Onzy AI (Demo)', 
        themeColor: '#8b5cf6', // Changed to Purple
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
      
      return combined.length > 0 ? combined : MOCK_TENANTS;
  } catch (error) {
      console.error("Error fetching tenants, falling back to mock:", error);
      return MOCK_TENANTS;
  }
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  const db = checkDb();
  
  // Try DB first
  if (db) {
    try {
        const tenantRef = doc(db, 'tenants', id);
        const snapshot = await getDoc(tenantRef);
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Tenant;
        }
    } catch (error) {
        console.error("Error fetching tenant from DB:", error);
    }
  }

  // Fallback: Check if it matches a Mock ID
  // This ensures that even if DB is connected but empty, the Mock ID works.
  const mockTenant = MOCK_TENANTS.find(t => t.id === id);
  return mockTenant || null;
};

export const addTenant = async (tenantData: Omit<Tenant, 'id'>): Promise<string> => {
  const db = checkDb();
  if (!db) {
      alert("Modo Demo: Tenant criado apenas localmente (não salvo).");
      return `mock-new-${Date.now()}`;
  }
  const docRef = await addDoc(collection(db, 'tenants'), tenantData);
  return docRef.id;
};

export const updateTenant = async (id: string, tenantData: Partial<Tenant>): Promise<void> => {
  const db = checkDb();
  if (!db) {
      alert("Modo Demo: Alterações não são salvas permanentemente.");
      return;
  }
  // Block updating mocks in real DB
  if (id.startsWith('mock-')) {
     alert("Não é possível editar tenants de demonstração no banco de dados real.");
     return;
  }
  const tenantRef = doc(db, 'tenants', id);
  await updateDoc(tenantRef, tenantData);
};

export const deleteTenant = async (id: string): Promise<void> => {
  const db = checkDb();
  if (!db) {
      alert("Modo Demo: Exclusão simulada.");
      return;
  }
  if (id.startsWith('mock-')) {
      alert("Não é possível excluir tenants de demonstração.");
      return;
  }
  const tenantRef = doc(db, 'tenants', id);
  await deleteDoc(tenantRef);
};

// --- Lead Services ---
export const listenToLeads = (tenantId: string, callback: (leads: Lead[]) => void): (() => void) => {
    const db = checkDb();
    if (!db || tenantId.startsWith('mock-')) {
        // Return mock leads for demo
        console.warn("Using mock leads");
        callback([
            { id: 'lead-1', sessionId: 'sess-1', createdAt: {}, updatedAt: {}, nome: 'João Silva', email: 'joao@example.com' },
            { id: 'lead-2', sessionId: 'sess-2', createdAt: {}, updatedAt: {}, nome: 'Maria Santos', email: 'maria@example.com' }
        ] as any);
        return () => {};
    }

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