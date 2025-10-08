import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import AuthScreen from './components/AuthScreen';
import OperativeApp from './components/OperativeApp';

const OperativeAppContainer: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (isAuthenticated) {
    return <OperativeApp />;
  }
  return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
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
