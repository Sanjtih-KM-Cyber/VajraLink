import React, { useState } from 'react';
import VpnCheckScreen from './components/VpnCheckScreen';
import OperativeApp from './components/OperativeApp';
import AuthScreen from './components/AuthScreen';

type AppStatus = 'vpn_check' | 'login' | 'authenticated';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>('vpn_check');

  const handleVpnSuccess = () => {
    setAppStatus('login');
  };

  const handleLoginSuccess = () => {
    setAppStatus('authenticated');
  };

  const renderContent = () => {
    switch (appStatus) {
      case 'authenticated':
        return <OperativeApp />;
      case 'login':
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
      case 'vpn_check':
      default:
        return <VpnCheckScreen onVpnSuccess={handleVpnSuccess} />;
    }
  };

  return <>{renderContent()}</>;
};

export default App;
