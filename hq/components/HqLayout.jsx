import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import DashboardView from './DashboardView.jsx';
import OperativesView from './OperativesView.jsx';
import ThreatsView from './ThreatsView.jsx';
import ConnectionRequestsView from './ConnectionRequestsView.jsx';

const HqLayout = ({ onLogout }) => {
    const [view, setView] = useState('dashboard');

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <DashboardView setView={setView} />;
            case 'operatives':
                return <OperativesView />;
            case 'threats':
                return <ThreatsView />;
            case 'connectionRequests':
                return <ConnectionRequestsView />;
            default:
                return <DashboardView setView={setView} />;
        }
    };

    return (
        <div className="flex h-full font-sans antialiased text-gray-300">
            <Sidebar currentView={view} setView={setView} onLogout={onLogout} />
            <main className="flex-1 overflow-y-auto bg-gray-950">
                {renderView()}
            </main>
        </div>
    );
};

export default HqLayout;
