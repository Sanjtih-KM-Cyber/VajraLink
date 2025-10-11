import React, { useState, useEffect } from 'react';
import { getPendingConnectionRequests, approveConnectionRequest, denyConnectionRequest } from '../api.js';

const ConnectionRequestsView = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        setIsLoading(true);
        const data = await getPendingConnectionRequests();
        setRequests(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        await approveConnectionRequest(id);
        fetchRequests(); // Refresh the list
    };

    const handleDeny = async (id) => {
        await denyConnectionRequest(id);
        setRequests(current => current.filter(r => r.id !== id));
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Connection Requests</h1>
            <p className="text-gray-400 mt-1">Review and approve/deny requests from operatives to establish new communication channels.</p>
            
            <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Request From</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Request To</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reason</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-8 text-gray-400">Loading requests...</td></tr>
                        ) : requests.length === 0 ? (
                             <tr><td colSpan={5} className="text-center p-8 text-gray-400">No pending connection requests.</td></tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.fromUsername}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.toUsername}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-sm truncate" title={req.reason}>{req.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{req.requestDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 rounded-md text-white">Approve</button>
                                        <button onClick={() => handleDeny(req.id)} className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 rounded-md text-white">Deny</button>
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

export default ConnectionRequestsView;
