import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import HqLayout from './components/HqLayout.jsx';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('vajralink_token'));

    const handleLogout = () => {
        localStorage.removeItem('vajralink_token');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return <HqLayout onLogout={handleLogout} />;
};

export default App;
