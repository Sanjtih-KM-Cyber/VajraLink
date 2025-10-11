import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dashboard from './Dashboard.jsx';
import AppLockScreen from './AppLockScreen.jsx';

const OperativeApp = () => {
  const [appStatus, setAppStatus] = useState('authenticated');
  const [showScreenshotWarning, setShowScreenshotWarning] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [inactivityDuration, setInactivityDuration] = useState(2 * 60 * 1000); // Default 2 minutes
  const inactivityTimer = useRef(null);

  const handleLock = useCallback(() => {
    if (appStatus === 'authenticated') {
      setAppStatus('locked');
    }
  }, [appStatus]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(handleLock, inactivityDuration);
  }, [handleLock, inactivityDuration]);
  
  useEffect(() => {
    if (appStatus === 'authenticated') {
      resetInactivityTimer();
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      window.addEventListener('click', resetInactivityTimer);
    }

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
    };
  }, [appStatus, resetInactivityTimer]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleUnlock = () => {
    setAppStatus('authenticated');
    resetInactivityTimer();
  };
  
  const handleLogout = () => {
    // On logout, clear the token and return to the main launcher.
    localStorage.removeItem('vajralink_token');
    window.location.href = '/';
  };

  const handleScreenshotAttempt = () => {
      setShowScreenshotWarning(true);
      setTimeout(() => setShowScreenshotWarning(false), 3000);
  };

  const renderAuthenticatedContent = () => (
    <>
      <Dashboard 
        onScreenshotAttempt={handleScreenshotAttempt} 
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        inactivityDuration={inactivityDuration}
        setInactivityDuration={setInactivityDuration}
      />
      {appStatus === 'locked' && <AppLockScreen onUnlock={handleUnlock} />}
    </>
  );

  return (
    <div className={`text-white min-h-screen font-sans antialiased relative ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-100'}`}>
      {renderAuthenticatedContent()}
      {showScreenshotWarning && (
          <div className="fixed top-5 right-5 bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Screenshot attempt detected and logged.</span>
          </div>
      )}
    </div>
  );
};

export default OperativeApp;
