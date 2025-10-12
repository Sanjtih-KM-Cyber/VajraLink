
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import OperativesView from './OperativesView';
import ThreatsView from './ThreatsView';
import ConnectionRequestsView from './ConnectionRequestsView';
import FamilyRegistrationsView from './FamilyRegistrationsView';

export type HqView = 'dashboard' | 'operatives' | 'threats' | 'connectionRequests' | 'familyRegistrations' | 'settings';

interface HqLayoutProps {
    onLogout: () => void;
}

const HqLayout: React.FC<HqLayoutProps> = ({ onLogout }) => {
    const [view, setView] = useState<HqView>('dashboard');

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
            case 'familyRegistrations':
                return <FamilyRegistrationsView />;
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
