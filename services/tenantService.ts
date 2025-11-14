
import { db } from "../firebase/config";
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

const checkDb = () => {
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your Firebase configuration.");
  }
  return db;
};

// --- Tenant Services ---
export const getTenants = async (): Promise<Tenant[]> => {
  const db = checkDb();
  const tenantsCol = collection(db, 'tenants');
  const snapshot = await getDocs(tenantsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  const db = checkDb();
  const tenantRef = doc(db, 'tenants', id);
  const snapshot = await getDoc(tenantRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Tenant : null;
};

export const addTenant = async (tenantData: Omit<Tenant, 'id'>): Promise<string> => {
  const db = checkDb();
  const docRef = await addDoc(collection(db, 'tenants'), tenantData);
  return docRef.id;
};

export const updateTenant = async (id: string, tenantData: Partial<Tenant>): Promise<void> => {
  const db = checkDb();
  const tenantRef = doc(db, 'tenants', id);
  await updateDoc(tenantRef, tenantData);
};

export const deleteTenant = async (id: string): Promise<void> => {
  const db = checkDb();
  const tenantRef = doc(db, 'tenants', id);
  await deleteDoc(tenantRef);
};

// --- Lead Services ---
export const listenToLeads = (tenantId: string, callback: (leads: Lead[]) => void): (() => void) => {
    const db = checkDb();
    const leadsCol = collection(db, 'tenants', tenantId, 'leads');
    const q = query(leadsCol);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
        callback(leads);
    });
    
    return unsubscribe;
};

export const findOrCreateLeadBySession = async (tenantId: string, sessionId: string): Promise<string> => {
    const db = checkDb();
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
};

export const updateLead = async (tenantId: string, leadId: string, data: Partial<Lead>): Promise<void> => {
    const db = checkDb();
    const leadRef = doc(db, 'tenants', tenantId, 'leads', leadId);
    await updateDoc(leadRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};
