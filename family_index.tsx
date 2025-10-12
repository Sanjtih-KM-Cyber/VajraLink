import React from 'react';
import ReactDOM from 'react-dom/client';
import FamilyDashboard from './components/FamilyDashboard';
import './index.css';

import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FamilyDashboard />
    </AuthProvider>
  </React.StrictMode>,
)