import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import FamilyLoginForm from './components/FamilyLoginForm';
import FamilyDashboard from './components/FamilyDashboard';
import { AuthProvider } from './contexts/AuthContext';

const FamilyAppContainer: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('vajralink_token'));

  if (isAuthenticated) {
    return <FamilyDashboard onLogout={() => setIsAuthenticated(false)} />;
  }
  return <FamilyLoginForm onLoginSuccess={() => setIsAuthenticated(true)} onSwitchToRegister={function (): void {
    throw new Error('Function not implemented.');
  } } />;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <FamilyAppContainer />
      </AuthProvider>
    </React.StrictMode>
  );
}