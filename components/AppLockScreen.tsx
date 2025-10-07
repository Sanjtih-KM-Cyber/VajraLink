import React, { useState } from 'react';
import { triggerDuressAlert } from '../hq/api';

interface AppLockScreenProps {
  onUnlock: () => void;
}

const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDuressScanning, setIsDuressScanning] = useState(false);

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnlocking(true);
    setError('');

    // Simulate checking the password. In a real app, this would be a secure check.
    // For this simulation, any password will work after a short delay.
    // The duress password check is handled on the main login screen.
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
        sessionStorage.removeItem('duressMode');
        onUnlock();
    }, 2000);
  };
  
  const handleDuressBiometricUnlock = () => {
    setIsDuressScanning(true);
    setError('');
    
    // Activate Duress Protocol
    console.warn('DURESS PROTOCOL ACTIVATED VIA BIOMETRIC');
    sessionStorage.setItem('duressMode', 'true');
    // In a real app, we'd get the current user's ID here.
    const currentUser = 'agent_zero'; // Hardcoded for simulation
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await triggerDuressAlert(currentUser, { lat: latitude, lon: longitude });
        },
        async (error) => {
            console.error("Geolocation error:", error);
            await triggerDuressAlert(currentUser, null);
        },
        { enableHighAccuracy: true }
    );

    // Simulate scan and unlock
    setTimeout(() => {
        setIsDuressScanning(false);
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
            disabled={isUnlocking || !password || isScanning || isDuressScanning}
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
            <span className="flex-shrink mx-4 text-gray-500 text-sm">or use biometrics</span>
            <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-24 w-24 transition-colors text-gray-600 ${(isScanning || isDuressScanning) && 'animate-pulse'} ${isScanning && '!text-teal-400'} ${isDuressScanning && '!text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM8.5 6.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0V6.25zM11.5 6.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V7a.75.75 0 01.75-.75zM10 8.5a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0V8.5zM6.5 7a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V7.75A.75.75 0 016.5 7zM13.5 8.5a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8.001 8.001 0 0113.14-6.313.75.75 0 01.912.264l1.25 2.5a.75.75 0 01-.13 1.01l-2.5 2.5a.75.75 0 01-1.012-.132A5.502 5.502 0 005.5 10a.75.75 0 01-1.5 0c0-1.859.923-3.52 2.365-4.524a.75.75 0 01.554-1.293A8.001 8.001 0 012 10z" clipRule="evenodd" />
            </svg>
             <p className="text-gray-400 text-sm h-5">
                {isScanning ? 'Scanning...' : isDuressScanning ? 'Duress Scan Active...' : 'Scan Biometric Signature'}
            </p>
            <div className="w-full flex gap-4 pt-2">
                <button
                    onClick={handleBiometricUnlock}
                    disabled={isScanning || isUnlocking || isDuressScanning}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 hover:border-teal-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Unlock with Standard Biometrics"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.672 1.908A8 8 0 1018.092 13.33L16 11.237a6 6 0 11-9.236-9.236l2.103-2.103a1 1 0 011.414 0l.293.293a1 1 0 010 1.414l-1.06 1.06a4 4 0 105.656 5.657l1.06-1.06a1 1 0 011.414 0l.293.293a1 1 0 010 1.414l-2.103 2.103a8.001 8.001 0 00-11.314-11.314L5.257.5a1 1 0 011.414 1.408z" clipRule="evenodd" /></svg>
                    Standard Scan
                </button>
                 <button
                    onClick={handleDuressBiometricUnlock}
                    disabled={isScanning || isUnlocking || isDuressScanning}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-red-300 bg-gray-800 border border-gray-700 hover:border-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Unlock with Duress Biometrics"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.008a1 1 0 011 1v3.5a1 1 0 01-2 0V5z" clipRule="evenodd" /></svg>
                    Duress Scan
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AppLockScreen;