import React, { useState } from 'react';
import VpnCheckScreen from './components/VpnCheckScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';

type AppStatus = 'vpn_check' | 'role_selection';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>('vpn_check');

  const handleVpnSuccess = () => {
    setAppStatus('role_selection');
  };

  const handleSelectOperative = () => {
      // Redirect to the operative-specific app
      window.location.href = '/operative.html';
  }

  const renderContent = () => {
    switch (appStatus) {
      case 'role_selection':
        return <RoleSelectionScreen onSelectOperative={handleSelectOperative} />;
      case 'vpn_check':
      default:
        return <VpnCheckScreen onVpnSuccess={handleVpnSuccess} />;
    }
  };

  return <>{renderContent()}</>;
};

export default App;
