
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import TenantPage from './pages/TenantPage';
import EmbedPage from './pages/EmbedPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/:tenantId" element={<TenantPage />} />
        <Route path="/embed/:tenantId" element={<EmbedPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
