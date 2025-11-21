
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import TenantPage from './pages/TenantPage';
import EmbedPage from './pages/EmbedPage';

const App: React.FC = () => {
  return (
    <ReactRouterDOM.HashRouter>
      <ReactRouterDOM.Routes>
        {/* A rota de embed deve ser definida explicitamente antes da rota dinâmica :tenantId */}
        <ReactRouterDOM.Route path="/embed/:tenantId" element={<EmbedPage />} />
        
        {/* Rota raiz para o Painel Admin */}
        <ReactRouterDOM.Route path="/" element={<AdminPanel />} />
        
        {/* Rota dinâmica para a página pública do Tenant */}
        <ReactRouterDOM.Route path="/:tenantId" element={<TenantPage />} />
      </ReactRouterDOM.Routes>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
