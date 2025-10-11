import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import AuthScreen from './components/AuthScreen.jsx';
import OperativeApp from './components/OperativeApp.jsx';

const OperativeAppContainer = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('vajralink_token'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return <OperativeApp />;
  }
  return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <OperativeAppContainer />
    </React.StrictMode>
  );
}
