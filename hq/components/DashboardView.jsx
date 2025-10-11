import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRecentThreats, getPendingRegistrations, approveRegistration, denyRegistration } from '../api.js';

const StatCard = ({ title, value, trend, icon, isLoading }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
            {isLoading ? (
                <div className="w-full">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
            ) : (
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                    {trend && <p className="text-xs text-green-400 mt-1">{trend}</p>}
                </div>
            )}
            <div className="text-teal-500 p-3 bg-gray-900 rounded-lg">{icon}</div>
        </div>
    </div>
);

const DashboardView = ({ setView }) => {
    const [stats, setStats] = useState(null);
    const [recentThreats, setRecentThreats] = useState([]);
    const [pending, setPending] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsData, threatsData, pendingData] = await Promise.all([
                getDashboardStats(),
                getRecentThreats(2),
                getPendingRegistrations(),
            ]);
            setStats(statsData);
            setRecentThreats(threatsData);
            setPending(pendingData);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleApprove = async (username) => {
        await approveRegistration(username);
        fetchData(); // Refetch all data to update the dashboard
    };

    const handleDeny = async (username) => {
        await denyRegistration(username);
        setPending(current => current.filter(p => p.username !== username));
    };


    const getThreatIcon = (threat) => {
        const iconClasses = "h-5 w-5 text-white";
        if (threat.type.toLowerCase().includes('phishing') || threat.type.toLowerCase().includes('duress')) {
            return <span className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.008a1 1 0 011 1v3.5a1 1 0 01-2 0V5z" clipRule="evenodd" /></svg></span>;
        }
        return <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /></svg></span>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white">HQ Dashboard</h1>
            <p className="text-gray-400 mt-1">Network overview and mission critical alerts.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <StatCard title="Active Operatives" value={stats?.activeOperatives ?? 0} isLoading={isLoading} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z" /></svg>} />
                <StatCard title="Threat Level" value={stats?.threatLevel ?? '...'} isLoading={isLoading} icon={<div className="text-yellow-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>} />
                <StatCard title="Open Threats" value={stats?.openThreats ?? 0} isLoading={isLoading} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                <StatCard title="Network Integrity" value={stats?.networkIntegrity ?? '%'} isLoading={isLoading} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="font-bold text-white text-lg">Global Operative Distribution</h2>
                    <div className="mt-4 bg-gray-900 rounded-lg p-4 flex items-center justify-center h-80">
                         <img src="https://storage.googleapis.com/aistudio-project-files/f1a5ba43-a67b-4835-961f-442b3112469d/world_map.svg" alt="World map with operative locations" className="max-h-full object-contain" />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col">
                     <h2 className="font-bold text-white text-lg mb-4">Pending Approvals</h2>
                     <div className="flex-1 space-y-4 overflow-y-auto">
                        {isLoading ? <p>Loading requests...</p> : pending.length > 0 ? (
                            pending.map(req => (
                                <div key={req.username} className="bg-gray-900 p-4 rounded-lg">
                                    <p className="text-xs text-gray-400">New Operative Request</p>
                                    <p className="font-semibold text-white mt-1">{req.username}</p>
                                    <p className="text-sm text-gray-300">{req.rank}, {req.unit}</p>
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => handleApprove(req.username)} className="flex-1 text-sm bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-2 rounded-lg">Approve</button>
                                        <button onClick={() => handleDeny(req.username)} className="flex-1 text-sm bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-2 rounded-lg">Deny</button>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-400">No pending approvals.</p>}
                     </div>
                </div>
            </div>

             <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-8">
                 <div className="flex justify-between items-center">
                    <h2 className="font-bold text-white text-lg">Recent High-Priority Threats</h2>
                    <button onClick={() => setView('threats')} className="text-sm text-teal-400 hover:underline">View All</button>
                 </div>
                 <div className="mt-4 flow-root">
                    {isLoading ? <p>Loading threats...</p> : (
                        <ul role="list" className="-mb-8">
                            {recentThreats.map((threat, index) => (
                                <li key={threat.id}>
                                    <div className="relative pb-8">
                                        {index !== recentThreats.length - 1 && <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true"></span>}
                                        <div className="relative flex space-x-3">
                                            <div>{getThreatIcon(threat)}</div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-400">{threat.type} <span className="font-medium text-white">reported by {threat.reportedBy}</span></p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500"><time>{threat.timestamp.split(' ')[0]}</time></div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>
             </div>
        </div>
    );
};

export default DashboardView;
