
import React, { useState, useEffect } from 'react';
import type { Tenant } from '../types';
import { XIcon } from './Icons';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, 'id'> | Tenant) => void;
  tenantToEdit?: Tenant | null;
}

export const TenantFormModal: React.FC<TenantFormModalProps> = ({ isOpen, onClose, onSave, tenantToEdit }) => {
  const [name, setName] = useState('');
  const [themeColor, setThemeColor] = useState('#00ffbb');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [collectionFields, setCollectionFields] = useState('');

  useEffect(() => {
    if (tenantToEdit) {
      setName(tenantToEdit.name);
      setThemeColor(tenantToEdit.themeColor);
      setSystemPrompt(tenantToEdit.systemPrompt);
      setWhatsappNumber(tenantToEdit.whatsappNumber);
      setCollectionFields(tenantToEdit.collectionFields.join(', '));
    } else {
      setName('');
      setThemeColor('#00ffbb');
      setSystemPrompt('You are a helpful assistant.');
      setWhatsappNumber('');
      setCollectionFields('');
    }
  }, [tenantToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fieldsArray = collectionFields.split(',').map(f => f.trim().replace(/\s+/g, '_')).filter(f => f); // camelCase or snake_case
    const tenantData = {
      name,
      themeColor,
      systemPrompt,
      whatsappNumber,
      collectionFields: fieldsArray,
    };
    onSave(tenantToEdit ? { ...tenantData, id: tenantToEdit.id } : tenantData);
  };

  if (!isOpen) return null;

  const InputField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string}> = ({label, ...props}) => (
     <div>
        <label className="block text-sm font-medium text-onzy-text-secondary mb-1">{label}</label>
        <input {...props} className="w-full bg-onzy-light-gray border border-onzy-gray rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-onzy-neon"/>
     </div>
  );
  
  const TextAreaField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder?: string}> = ({label, ...props}) => (
      <div>
        <label className="block text-sm font-medium text-onzy-text-secondary mb-1">{label}</label>
        <textarea {...props} rows={4} className="w-full bg-onzy-light-gray border border-onzy-gray rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-onzy-neon"/>
      </div>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-onzy-dark border border-onzy-light-gray rounded-lg p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-onzy-text-secondary hover:text-onzy-neon">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6">{tenantToEdit ? 'Editar Tenant' : 'Criar Novo Tenant'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Nome do Tenant" value={name} onChange={(e) => setName(e.target.value)} placeholder="Onzy Company" />
          <div>
            <label className="block text-sm font-medium text-onzy-text-secondary mb-1">Cor do Tema</label>
            <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-full h-10 p-1 bg-onzy-light-gray border border-onzy-gray rounded-lg cursor-pointer" />
          </div>
          <TextAreaField label="Prompt de Sistema da IA" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="You are a helpful sales assistant for Onzy Company..." />
          <InputField label="Número do WhatsApp (com código do país)" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="5511999998888" />
          <div>
              <InputField label="Campos para Coletar (separados por vírgula)" value={collectionFields} onChange={(e) => setCollectionFields(e.target.value)} placeholder="nome, email, nomeDaEmpresa, tipoDeServico" />
              <p className="text-xs text-onzy-text-secondary mt-1">Ex: nomeDoCliente, email, telefone</p>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-onzy-light-gray hover:bg-onzy-gray text-onzy-text transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-onzy-neon text-onzy-darker font-bold hover:opacity-90 transition-opacity">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
