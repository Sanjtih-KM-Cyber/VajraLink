
import React, { useState, useEffect } from 'react';
import { HqView } from './HqLayout';
import { getPendingConnectionRequests } from '../api';

interface SidebarProps {
    currentView: HqView;
    setView: (view: HqView) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            const requests = await getPendingConnectionRequests();
            setPendingCount(requests.length);
        };
        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
        { id: 'operatives', label: 'Operatives', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z" /></svg> },
        { id: 'threats', label: 'Threats', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
        { id: 'connectionRequests', label: 'Connection Requests', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1.586l-1.293-1.293a1 1 0 10-1.414 1.414L7.586 6H6a1 1 0 000 2h1.586l-1.293 1.293a1 1 0 101.414 1.414L9 8.414V10a1 1 0 102 0V8.414l1.293 1.293a1 1 0 101.414-1.414L12.414 7H14a1 1 0 100-2h-1.586l-1.293-1.293A1 1 0 0011 3zM10 12a2 2 0 100 4 2 2 0 000-4z" /><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>, badge: pendingCount }
    ];

    return (
        <aside className="w-64 bg-gray-900 flex flex-col border-r border-gray-800 flex-shrink-0">
            <div className="h-20 flex items-center justify-center border-b border-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h1 className="text-xl font-bold text-gray-200 tracking-wider">VAJRALINK HQ</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as HqView)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                            currentView === item.id 
                            ? 'bg-teal-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        {item.icon}
                        <span className="ml-4 font-semibold flex-1 text-left">{item.label}</span>
                        {item.badge && item.badge > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{item.badge}</span>}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800 space-y-4">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">A</div>
                    <div className="ml-3">
                        <p className="font-semibold text-white">hq_admin</p>
                        <p className="text-xs text-gray-400">Control Tower</p>
                    </div>
                </div>
                 <button
                    onClick={onLogout}
                    className="w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-red-800/50 hover:text-red-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="ml-4 font-semibold">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
