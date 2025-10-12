import React, { useState, useEffect } from 'react';
import { getPendingFamilyRegistrations, approveFamilyRegistration, denyFamilyRegistration } from '../api';

const FamilyRegistrationsView: React.FC = () => {
    const [pending, setPending] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getPendingFamilyRegistrations();
        setPending(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (username: string) => {
        await approveFamilyRegistration(username);
        fetchData();
    };

    const handleDeny = async (username: string) => {
        await denyFamilyRegistration(username);
        fetchData();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Pending Family Registrations</h1>
            <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Related To</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Relation</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Operative's Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading registrations...</td></tr>
                        ) : (
                            pending.map((req) => (
                                <tr key={req.username}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{req.operativeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{req.relationship}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{req.operativeNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{req.rank}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleApprove(req.username)} className="text-green-400 hover:text-green-300">Approve</button>
                                        <button onClick={() => handleDeny(req.username)} className="text-red-500 hover:text-red-400">Deny</button>
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

export default FamilyRegistrationsView;