import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import FamilyLoginForm from './components/FamilyLoginForm';
import FamilyDashboard from './components/FamilyDashboard';
import FamilyRegistrationForm from './components/FamilyRegistrationForm';
import { AuthProvider } from './contexts/AuthContext';

const FamilyAppContainer: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('vajralink_token'));
  const [showRegister, setShowRegister] = useState(false);

  if (isAuthenticated) {
    return <FamilyDashboard onLogout={() => setIsAuthenticated(false)} />;
  }

  if (showRegister) {
    return <FamilyRegistrationForm onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return <FamilyLoginForm onLoginSuccess={() => setIsAuthenticated(true)} onSwitchToRegister={() => setShowRegister(true)} />;
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