
import React, { useState, useEffect } from 'react';
import { getThreats, updateThreatStatus } from '../api';
import { Threat, ThreatStatus } from '../types';

const ThreatsView: React.FC = () => {
    const [threatList, setThreatList] = useState<Threat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchThreats = async () => {
            setIsLoading(true);
            const data = await getThreats();
            setThreatList(data);
            setIsLoading(false);
        };
        fetchThreats();
    }, []);

    const handleStatusChange = async (id: number, newStatus: ThreatStatus) => {
        const updatedThreat = await updateThreatStatus(id, newStatus);
        setThreatList(threatList.map(t => t.id === id ? updatedThreat : t));
    };
    
    const getStatusColor = (status: ThreatStatus) => {
        switch(status) {
            case 'Pending': return 'bg-red-500';
            case 'Reviewing': return 'bg-yellow-500';
            case 'Mitigated': return 'bg-green-500';
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Threat Intelligence</h1>
            <p className="text-gray-400 mt-1">Review, analyze, and mitigate threats reported from the field and detected by the system.</p>
            
            <div className="mt-8 space-y-4">
                {isLoading ? (
                     <div className="text-center p-8 text-gray-400">Loading threats...</div>
                ) : (
                    threatList.map(threat => (
                        <div key={threat.id} className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(threat.status)}`}>{threat.status}</span>
                                        <h2 className="text-lg font-bold text-white">{threat.type}</h2>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Reported by <span className="font-semibold text-teal-400">{threat.reportedBy}</span> via {threat.source}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500">{threat.timestamp}</p>
                            </div>
                            <p className="mt-4 text-gray-300 bg-gray-900 p-3 rounded-md text-sm">{threat.details}</p>
                            <div className="mt-4 flex justify-end space-x-3">
                                {threat.status === 'Pending' && <button onClick={() => handleStatusChange(threat.id, 'Reviewing')} className="px-3 py-1 text-sm font-semibold bg-yellow-600 hover:bg-yellow-500 rounded-md text-white">Acknowledge & Review</button>}
                                {threat.status === 'Reviewing' && <button onClick={() => handleStatusChange(threat.id, 'Mitigated')} className="px-3 py-1 text-sm font-semibold bg-green-600 hover:bg-green-500 rounded-md text-white">Mark as Mitigated</button>}
                                <button onClick={() => alert('This would open a detailed analysis and logging interface.')} className="px-3 py-1 text-sm font-semibold bg-gray-600 hover:bg-gray-500 rounded-md text-white">View Details</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ThreatsView;
