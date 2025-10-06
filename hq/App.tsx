import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import HqLayout from './components/HqLayout';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return <HqLayout onLogout={() => setIsAuthenticated(false)} />;
};

export default App;
