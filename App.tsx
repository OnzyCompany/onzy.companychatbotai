import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import TenantPage from './pages/TenantPage';
import EmbedPage from './pages/EmbedPage';

const App: React.FC = () => {
  return (
    <ReactRouterDOM.HashRouter>
      <ReactRouterDOM.Routes>
        <ReactRouterDOM.Route path="/" element={<AdminPanel />} />
        {/* A rota de embed deve ser definida explicitamente antes da rota dinâmica :tenantId */}
        <ReactRouterDOM.Route path="/embed/:tenantId" element={<EmbedPage />} />
        <ReactRouterDOM.Route path="/:tenantId" element={<TenantPage />} />
      </ReactRouterDOM.Routes>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;