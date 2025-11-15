import React from 'react';
// Fix: Changed react-router-dom import to use namespace import to resolve "no exported member" error.
import * as ReactRouterDOM from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import TenantPage from './pages/TenantPage';
import EmbedPage from './pages/EmbedPage';

const App: React.FC = () => {
  return (
    <ReactRouterDOM.HashRouter>
      <ReactRouterDOM.Routes>
        <ReactRouterDOM.Route path="/" element={<AdminPanel />} />
        <ReactRouterDOM.Route path="/:tenantId" element={<TenantPage />} />
        <ReactRouterDOM.Route path="/embed/:tenantId" element={<EmbedPage />} />
      </ReactRouterDOM.Routes>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
