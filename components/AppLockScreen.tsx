import React, { useState } from 'react';

interface AppLockScreenProps {
  onUnlock: () => void;
}

const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnlocking(true);
    setError('');

    // Simulate checking the password. In a real app, this would be a secure check.
    // For this simulation, any password will work after a short delay.
    setTimeout(() => {
        onUnlock();
    }, 1000);
  };
  
  const handleBiometricUnlock = () => {
    setIsScanning(true);
    setError('');
    // Simulate biometric scan
    setTimeout(() => {
        setIsScanning(false);
        onUnlock();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-teal-900/50">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Session Locked</h1>
        <p className="text-gray-400 mb-6">For your security, your session has been locked due to inactivity.</p>
        
        <form onSubmit={handlePasswordUnlock}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to unlock"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button 
            type="submit" 
            disabled={isUnlocking || !password || isScanning}
            className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isUnlocking ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Unlocking...
                </>
            ) : 'Unlock'}
          </button>
        </form>

        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <div className="flex flex-col items-center">
            <button
                onClick={handleBiometricUnlock}
                disabled={isScanning || isUnlocking}
                className="flex flex-col items-center justify-center text-gray-400 hover:text-teal-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Unlock with Biometrics"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 transition-colors ${isScanning ? 'text-teal-500 animate-pulse' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM8.5 6.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0V6.25zM11.5 6.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V7a.75.75 0 01.75-.75zM10 8.5a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0V8.5zM6.5 7a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V7.75A.75.75 0 016.5 7zM13.5 8.5a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8.001 8.001 0 0113.14-6.313.75.75 0 01.912.264l1.25 2.5a.75.75 0 01-.13 1.01l-2.5 2.5a.75.75 0 01-1.012-.132A5.502 5.502 0 005.5 10a.75.75 0 01-1.5 0c0-1.859.923-3.52 2.365-4.524a.75.75 0 01.554-1.293A8.001 8.001 0 012 10z" clipRule="evenodd" />
                </svg>
                <span className="mt-2 text-sm font-semibold">{isScanning ? 'Scanning...' : 'Unlock with Biometrics'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AppLockScreen;