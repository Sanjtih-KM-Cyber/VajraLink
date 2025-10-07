import React, { useState, useEffect } from 'react';
import { getThreats, updateThreatStatus } from '../api';
import { Threat, ThreatStatus } from '../../common/types';
import ThreatDetailPanel from './ThreatDetailPanel';

const ThreatsView: React.FC = () => {
    const [threatList, setThreatList] = useState<Threat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

    const fetchThreats = async () => {
        setIsLoading(true);
        const data = await getThreats();
        setThreatList(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchThreats();
    }, []);

    const handleStatusChange = async (id: number, newStatus: ThreatStatus) => {
        const updatedThreat = await updateThreatStatus(id, newStatus);
        setThreatList(threatList.map(t => t.id === id ? updatedThreat : t));
        setSelectedThreat(updatedThreat); // Update the selected threat as well
    };
    
    const getStatusColor = (status: ThreatStatus) => {
        switch(status) {
            case 'Pending': return 'bg-red-500';
            case 'Reviewing': return 'bg-yellow-500';
            case 'Mitigated': return 'bg-green-500';
        }
    };
    
    const getBorderColor = (status: ThreatStatus) => {
        switch(status) {
            case 'Pending': return 'border-red-500/50';
            case 'Reviewing': return 'border-yellow-500/50';
            case 'Mitigated': return 'border-green-500/50';
        }
    };

    return (
        <div className="p-8 relative h-full flex flex-col">
            <div>
                <h1 className="text-3xl font-bold text-white">Threat Intelligence</h1>
                <p className="text-gray-400 mt-1">Review, analyze, and mitigate threats reported from the field and detected by the system.</p>
            </div>
            
            <div className="mt-8 space-y-4 flex-1 overflow-y-auto pr-2">
                {isLoading ? (
                     <div className="text-center p-8 text-gray-400">Loading threats...</div>
                ) : (
                    threatList.map(threat => (
                        <div 
                            key={threat.id} 
                            onClick={() => setSelectedThreat(threat)}
                            className={`bg-gray-800 border ${getBorderColor(threat.status)} rounded-lg p-5 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200`}
                        >
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
                            <p className="mt-4 text-gray-300 bg-gray-900 p-3 rounded-md text-sm truncate">{threat.details}</p>
                        </div>
                    ))
                )}
            </div>
            {selectedThreat && (
                <ThreatDetailPanel 
                    threat={selectedThreat} 
                    onClose={() => setSelectedThreat(null)}
                    onStatusChange={handleStatusChange} 
                />
            )}
        </div>
    );
};

export default ThreatsView;