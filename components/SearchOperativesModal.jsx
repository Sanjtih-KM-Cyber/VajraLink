import React, { useState, useEffect } from 'react';
import { searchOperatives, submitConnectionRequest } from '../hq/api.js';

const SearchOperativesModal = ({ onClose, currentUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  
  const [selectedOperative, setSelectedOperative] = useState(null);
  const [reason, setReason] = useState('');
  const [requestStatus, setRequestStatus] = useState('idle');

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setSearchStatus('idle');
      return;
    }

    setSearchStatus('loading');
    const handler = setTimeout(async () => {
      try {
        const data = await searchOperatives(query, currentUser);
        setResults(data);
        setSearchStatus(data.length > 0 ? 'results' : 'no-results');
      } catch (err) {
        setSearchStatus('error');
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query, currentUser]);
  
  const handleSendRequest = async () => {
      if (!selectedOperative || !reason.trim()) return;
      setRequestStatus('sending');
      try {
          await submitConnectionRequest(currentUser, selectedOperative.id, reason);
          setRequestStatus('sent');
      } catch (err) {
          setRequestStatus('error');
      }
  };
  
  const handleResetAndClose = () => {
      setSelectedOperative(null);
      setReason('');
      setRequestStatus('idle');
      setQuery('');
      setResults([]);
      onClose();
  }
  
  const renderMainContent = () => (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Find Operative</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">&times;</button>
        </div>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-3 left-3 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by callsign or name..." className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" autoFocus />
        </div>
        <div className="mt-4 h-64 overflow-y-auto pr-2">
            {searchStatus === 'loading' && <p className="text-center text-gray-400">Searching...</p>}
            {searchStatus === 'no-results' && <p className="text-center text-gray-400">No operatives found matching your query.</p>}
            {searchStatus === 'error' && <p className="text-center text-red-400">Error searching for operatives.</p>}
            {searchStatus === 'results' && (
                <ul className="space-y-2">
                    {results.map(op => (
                        <li key={op.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                                <p className="font-semibold text-white">{op.name}</p>
                                <p className="text-sm text-gray-400">{op.rank}</p>
                            </div>
                            {op.isContact ? (
                                <span className="px-3 py-1.5 text-xs font-semibold bg-gray-700 rounded-md text-gray-400 cursor-default">Connected</span>
                            ) : (
                                <button onClick={() => setSelectedOperative(op)} className="px-3 py-1.5 text-sm font-semibold bg-teal-600 hover:bg-teal-500 rounded-md text-white">Connect</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </>
  );
  
  const renderRequestContent = () => (
      <div>
         <h2 className="text-xl font-bold text-white mb-2">Connection Request</h2>
         <p className="text-gray-400 mb-4 text-sm">You are requesting to connect with <span className="font-semibold text-teal-400">{selectedOperative?.name}</span>.</p>
         <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5} className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="State your reason for connection... (Required for HQ approval)"></textarea>
         <div className="mt-4 flex gap-3">
             <button onClick={() => setSelectedOperative(null)} className="w-full text-center py-2.5 px-4 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700">Back</button>
             <button onClick={handleSendRequest} disabled={!reason.trim() || requestStatus === 'sending'} className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                 {requestStatus === 'sending' ? 'Sending...' : 'Send Request to HQ'}
             </button>
         </div>
      </div>
  );
  
    const renderSentContent = () => (
        <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <h3 className="text-lg font-bold text-white">Request Sent</h3>
            <p className="text-gray-400 mt-1 text-sm">Your request to connect with {selectedOperative?.name} has been sent to HQ for approval. You will be notified when a decision is made.</p>
            <button onClick={handleResetAndClose} className="mt-6 w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-500">Done</button>
        </div>
    );


  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md">
         {!selectedOperative ? renderMainContent() : requestStatus === 'sent' ? renderSentContent() : renderRequestContent()}
      </div>
    </div>
  );
};

export default SearchOperativesModal;
