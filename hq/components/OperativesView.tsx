import React, { useState, useEffect } from 'react';
import { getOperatives } from '../api';
import { Operative } from '../../common/types';

const OperativesView: React.FC = () => {
    const [operatives, setOperatives] = useState<Operative[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOperatives = async () => {
            setIsLoading(true);
            const data = await getOperatives();
            setOperatives(data);
            setIsLoading(false);
        };
        fetchOperatives();
    }, []);

    const handleAction = (operativeName: string, action: string) => {
        alert(`Simulated Action: ${action} initiated for ${operativeName}.`);
    };

    const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
        const color = status === 'Online' ? 'bg-green-500' : status === 'Away' ? 'bg-yellow-500' : 'bg-gray-500';
        return (
            <div className="flex items-center">
                <span className={`h-2.5 w-2.5 rounded-full ${color} mr-2`}></span>
                {status}
            </div>
        );
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Operative Management</h1>
            <p className="text-gray-400 mt-1">Monitor and manage all active field and support personnel.</p>
            
            <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Callsign / Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Clearance Level</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-8 text-gray-400">Loading operatives...</td></tr>
                        ) : (
                            operatives.map((op) => (
                                <tr key={op.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{op.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{op.rank}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"><StatusIndicator status={op.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{op.clearance}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleAction(op.name, 'Remote Lock')} className="text-yellow-400 hover:text-yellow-300">Lock App</button>
                                        <button onClick={() => handleAction(op.name, 'Remote Wipe')} className="text-red-500 hover:text-red-400">Wipe Device</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperativesView;