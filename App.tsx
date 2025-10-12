import React, { useState } from 'react';
import VpnCheckScreen from './components/VpnCheckScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import UserTypeSelectionScreen from './components/UserTypeSelectionScreen';
import FamilyRegistrationForm from './components/FamilyRegistrationForm';
import FamilyLoginForm from './components/FamilyLoginForm';

type AppStatus = 'vpn_check' | 'role_selection' | 'user_type_selection' | 'family_registration' | 'family_login';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>('vpn_check');

  const handleVpnSuccess = () => {
    setAppStatus('role_selection');
  };

  const handleSelectUser = () => {
    setAppStatus('user_type_selection');
  };

  const handleSelectOperative = () => {
      window.location.href = '/operative.html';
  }

  const handleSelectFamily = () => {
      setAppStatus('family_login');
  }

  const renderContent = () => {
    switch (appStatus) {
      case 'family_login':
        return <FamilyLoginForm onSwitchToRegister={() => setAppStatus('family_registration')} />;
      case 'family_registration':
        return <FamilyRegistrationForm />;
      case 'user_type_selection':
        return <UserTypeSelectionScreen onSelectOperative={handleSelectOperative} onSelectFamily={handleSelectFamily} />;
      case 'role_selection':
        return <RoleSelectionScreen onSelectUser={handleSelectUser} />;
      case 'vpn_check':
      default:
        return <VpnCheckScreen onVpnSuccess={handleVpnSuccess} />;
    }
  };

  return <>{renderContent()}</>;
};

export default App;