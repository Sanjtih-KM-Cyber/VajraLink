import React, { useState, useEffect } from 'react';

type VpnStatus = 'idle' | 'connecting' | 'connected' | 'error';

const VpnCheckScreen: React.FC<{ onVpnSuccess: () => void }> = ({ onVpnSuccess }) => {
  const [status, setStatus] = useState<VpnStatus>('idle');

  const handleConnect = () => {
    setStatus('connecting');
    // Simulate network connection
    setTimeout(() => {
        // Simulate a successful connection
        setStatus('connected');
    }, 2500);
  };

  useEffect(() => {
    if (status === 'connected') {
      const timer = setTimeout(() => {
        onVpnSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onVpnSuccess]);
  
  const StatusIcon = () => {
      switch(status) {
          case 'connecting':
              return <svg className="animate-spin h-10 w-10 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
          case 'connected':
              return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
          default:
              return <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
      }
  }

  const StatusText = () => {
    switch(status) {
        case 'connecting':
            return "Establishing secure tunnel...";
        case 'connected':
            return "Connection Established";
        default:
            return "Secure Connection Required";
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="mx-auto mb-6 flex items-center justify-center h-20 w-20 rounded-full bg-gray-900">
                <StatusIcon />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2"><StatusText /></h1>
            <p className="text-gray-400 mb-8 px-4">You must connect to the VajraLink secure network before accessing the platform.</p>

            {status === 'idle' && (
                <button 
                    onClick={handleConnect}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-teal-500 transition-colors"
                >
                    Connect to Secure Network
                </button>
            )}
            
            {status === 'connecting' && (
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-teal-500 h-2.5 rounded-full animate-vpn-progress"></div>
                </div>
            )}
            
            {status === 'connected' && (
                <p className="text-green-400 font-semibold">Redirecting to login...</p>
            )}
        </div>
      </div>
      <style>{`
        @keyframes vpn-progress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        .animate-vpn-progress {
            animation: vpn-progress 2.5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default VpnCheckScreen;
