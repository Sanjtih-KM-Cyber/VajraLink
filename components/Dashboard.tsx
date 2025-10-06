import React, { useState, useEffect } from 'react';
import Sidebar, { ChatInfo, DmChatInfo } from './Sidebar';
import ChatScreen from './ChatScreen';
import UserInfoPanel from './UserInfoPanel';

type Theme = 'light' | 'dark';

const SettingsMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    inactivityDuration: number;
    setInactivityDuration: (duration: number) => void;
}> = ({ isOpen, onClose, onLogout, theme, setTheme, inactivityDuration, setInactivityDuration }) => {
    if (!isOpen) return null;
    
    const handlePasswordChange = () => { alert("Password change requires HQ authorization. A request form would be generated here."); onClose(); };
    const handleQuestionChange = () => { alert("Security question change requires re-authentication. A secure flow would be initiated here."); onClose(); };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}></div>
            <div className="absolute top-20 right-4 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 text-gray-800 dark:text-gray-200">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-400 dark:text-gray-500 px-2 font-semibold uppercase">Appearance</div>
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full text-left flex justify-between items-center p-2 mt-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span>Theme</span>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {theme === 'dark' ? 'Dark' : 'Light'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                        </div>
                    </button>
                </div>
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                     <div className="text-xs text-gray-400 dark:text-gray-500 px-2 font-semibold uppercase">Security</div>
                     <button onClick={handlePasswordChange} className="w-full text-left p-2 mt-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Change Password</button>
                     <button onClick={handleQuestionChange} className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Change Security Question</button>
                </div>
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                     <div className="text-xs text-gray-400 dark:text-gray-500 px-2 font-semibold uppercase">Session</div>
                     <div className="p-2 mt-1">
                        <label htmlFor="inactivity-select" className="text-sm">Auto-lock after</label>
                        <select id="inactivity-select" value={inactivityDuration / 60000} onChange={(e) => setInactivityDuration(Number(e.target.value) * 60000)} className="w-full mt-1 p-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm">
                            <option value={1}>1 minute</option>
                            <option value={2}>2 minutes</option>
                            <option value={5}>5 minutes</option>
                        </select>
                     </div>
                </div>
                 <div className="p-2">
                    <button onClick={onLogout} className="w-full flex items-center p-2 rounded text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};


const INITIAL_CHATS: ChatInfo[] = [
    {
        id: 'alpha',
        name: 'Alpha Group',
        type: 'Encrypted Channel',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z" /></svg>,
    },
    {
        id: 'work',
        name: 'Project Condor',
        type: 'Work Group',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    }
];

const INITIAL_DMS: DmChatInfo[] = [
    {
        id: 'dm-sarah',
        name: 'Sarah Jenkins',
        type: 'Direct Message',
        icon: <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white">SJ</div>,
        rank: 'Lead Analyst',
        status: 'Online',
        joinDate: '2022-08-15',
    },
    {
        id: 'dm-mike',
        name: 'Mike Chen',
        type: 'Direct Message',
        icon: <div className="h-6 w-6 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold text-white">MC</div>,
        rank: 'Field Agent',
        status: 'Away',
        joinDate: '2023-01-20',
    }
];

interface DashboardProps {
  onScreenshotAttempt: () => void;
  onLogout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  inactivityDuration: number;
  setInactivityDuration: (duration: number) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const [chats, setChats] = useState<ChatInfo[]>(INITIAL_CHATS);
  const [dms] = useState<DmChatInfo[]>(INITIAL_DMS);
  const [selectedChat, setSelectedChat] = useState<ChatInfo | DmChatInfo>(chats[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserInfoPanelOpen, setUserInfoPanelOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [complaintCount, setComplaintCount] = useState(0);
  const [showHqAlert, setShowHqAlert] = useState(false);

  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => e.preventDefault();
    
    const detectScreenshot = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
        (e.ctrlKey && e.key === 'PrintScreen')
      ) {
        props.onScreenshotAttempt();
      }
    };

    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', detectScreenshot);
    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', detectScreenshot);
    };
  }, [props.onScreenshotAttempt]);

  useEffect(() => {
    if (complaintCount > 2 && !showHqAlert) {
      setShowHqAlert(true);
      setTimeout(() => setShowHqAlert(false), 5000);
    }
  }, [complaintCount, showHqAlert]);

  const handleAddGroup = (newGroup: ChatInfo) => {
    setChats(prevChats => [...prevChats, newGroup]);
    setSelectedChat(newGroup);
  };
  
  const handleReportFiled = () => setComplaintCount(c => c + 1);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  
  const handleSelectChat = (chat: ChatInfo | DmChatInfo) => {
    setSelectedChat(chat);
    setUserInfoPanelOpen(false);
  };

  const selectedDmInfo = selectedChat.type === 'Direct Message' ? selectedChat as DmChatInfo : undefined;

  return (
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar 
        chats={chats}
        dms={dms}
        onChatSelect={handleSelectChat}
        onAddGroup={handleAddGroup}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        onToggleSettings={() => setSettingsOpen(!isSettingsOpen)}
        activeChatId={selectedChat.id}
      />
      <SettingsMenu {...props} isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
      <div 
        className="flex-1 flex flex-col relative"
        onClick={() => {
          if (!isSidebarCollapsed) {
            toggleSidebar();
          }
        }}
      >
        <ChatScreen 
          key={selectedChat.id}
          chatInfo={selectedChat}
          onHeaderClick={() => selectedChat.type === 'Direct Message' && setUserInfoPanelOpen(true)}
          onReportFiled={handleReportFiled}
        />
        {isUserInfoPanelOpen && selectedDmInfo && (
            <UserInfoPanel user={selectedDmInfo} onClose={() => setUserInfoPanelOpen(false)} />
        )}
      </div>
      {showHqAlert && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-yellow-700 border border-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.01-1.742 3.01H4.42c-1.53 0-2.493-1.676-1.743-3.01l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.008a1 1 0 011 1v3.5a1 1 0 01-2 0V5z" clipRule="evenodd" /></svg>
              <span>Targeted User Alert: Multiple threats reported. HQ has been notified.</span>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
