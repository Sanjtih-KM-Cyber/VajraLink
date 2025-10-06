import React, { useState } from 'react';

export interface ChatInfo {
  id: string;
  name: string;
  type: string;
  icon: React.ReactElement;
}

export interface DmChatInfo extends ChatInfo {
    rank: string;
    status: 'Online' | 'Away' | 'Offline';
    joinDate: string;
}

interface SidebarProps {
  chats: ChatInfo[];
  dms: DmChatInfo[];
  onChatSelect: (chat: ChatInfo | DmChatInfo) => void;
  onAddGroup: (newGroup: ChatInfo) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onToggleSettings: () => void;
  activeChatId: string;
}

const BOTS_LIST: ChatInfo[] = [
    {
        id: 'bot-opsec',
        name: 'OPSEC Sentinel',
        type: 'Utility Bot',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 4a1 1 0 100-2 1 1 0 000 2zm4-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    }
];

type RequestStatus = 'idle' | 'pending' | 'approved';

const CreateGroupModal: React.FC<{onClose: () => void; onAddGroup: (group: ChatInfo) => void}> = ({ onClose, onAddGroup }) => {
    const [status, setStatus] = useState<RequestStatus>('idle');

    const handleCreate = () => {
        setStatus('pending');
        setTimeout(() => {
            setStatus('approved');
            const newGroup: ChatInfo = {
                id: 'family',
                name: 'Family',
                type: 'Personal Group',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
            };
            setTimeout(() => {
                onAddGroup(newGroup);
                onClose();
            }, 1000);
        }, 2500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Create New Group</h2>
                {status === 'idle' && (
                    <>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Create a new secure group for "Family". This request requires HQ approval for security provisioning.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500">Send Request to HQ</button>
                        </div>
                    </>
                )}
                {status === 'pending' && (
                    <div className="text-center p-4">
                        <svg className="animate-spin h-8 w-8 text-teal-500 dark:text-teal-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-lg">Request Pending...</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting approval from HQ servers.</p>
                    </div>
                )}
                {status === 'approved' && (
                     <div className="text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <p className="text-lg">Group Approved</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Adding group to your channels.</p>
                    </div>
                )}
            </div>
        </div>
    )
}


const Sidebar: React.FC<SidebarProps> = ({ chats, dms, onChatSelect, onAddGroup, isCollapsed, onToggle, onToggleSettings, activeChatId }) => {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  
  const handleSelect = (chat: ChatInfo | DmChatInfo) => {
    onChatSelect(chat);
  };

  const renderChannelList = (list: (ChatInfo | DmChatInfo)[]) => (
    <ul className="space-y-1">
      {list.map(chat => (
        <li key={chat.id}>
          <button 
            onClick={() => handleSelect(chat)}
            className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${isCollapsed ? 'justify-center' : ''} ${
              activeChatId === chat.id 
              ? 'bg-teal-800/50 text-white' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className={isCollapsed ? '' : 'mr-3'}>{chat.icon}</span>
            {!isCollapsed && <span className="flex-1 text-sm font-medium truncate">{chat.name}</span>}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
    {showCreateGroupModal && <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} onAddGroup={onAddGroup} />}
    <nav className={`flex flex-col bg-gray-100 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <div 
        onClick={onToggle}
        className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center h-[73px] cursor-pointer" 
        style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500 dark:text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {!isCollapsed && <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 tracking-wider">VAJRALINK</h1>}
        </div>
        {!isCollapsed && 
          <button onClick={(e) => { e.stopPropagation(); onToggleSettings(); }} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
          </button>
        }
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        <div>
            <div className={`flex items-center justify-between mb-2 ${isCollapsed ? 'justify-center' : 'pl-2'}`}>
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                    {isCollapsed ? 'G' : 'Groups'}
                </h2>
                {!isCollapsed && (
                    <button onClick={() => setShowCreateGroupModal(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-full" aria-label="Create new group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    </button>
                )}
            </div>
          {renderChannelList(chats)}
        </div>
        <div>
           <h2 className={`text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'text-center' : 'pl-2'}`}>
            {isCollapsed ? 'D' : 'Direct Messages'}
          </h2>
          {renderChannelList(dms)}
        </div>
        <div>
           <h2 className={`text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'text-center' : 'pl-2'}`}>
            {isCollapsed ? 'U' : 'Utilities'}
          </h2>
          {renderChannelList(BOTS_LIST)}
        </div>
      </div>
    </nav>
    </>
  );
};

export default Sidebar;
