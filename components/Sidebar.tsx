import React, { useState } from 'react';
import SearchOperativesModal from './SearchOperativesModal';
import { Operative, Group, OperativeStatus } from '../common/types';
import { getOperatives, addGroup } from '../hq/api';


export interface ChatInfo {
  id: string;
  name: string;
  type: string;
  // FIX: Allow className to be passed to the icon element via React.cloneElement
  icon: React.ReactElement<{ className?: string }>;
}

export interface DmChatInfo extends ChatInfo {
    rank: string;
    status: 'Online' | 'Away' | 'Offline';
    joinDate: string;
    isStatusVisible: boolean;
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
  currentUserProfile: Operative;
  onStatusChange: (newStatus: OperativeStatus) => void;
}

const BOTS_LIST: ChatInfo[] = [
    {
        id: 'bot-opsec',
        name: 'OPSEC Sentinel',
        type: 'Utility Bot',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000 16zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 4a1 1 0 100-2 1 1 0 000 2zm4-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    }
];

const groupToChatInfo = (group: Group): ChatInfo => ({
    id: group.id,
    name: group.name,
    type: 'Encrypted Channel',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={group.icon} /></svg>,
});


const CreateGroupModal: React.FC<{onClose: () => void; onAddGroup: (group: ChatInfo) => void; currentUser: string}> = ({ onClose, onAddGroup, currentUser }) => {
    const [step, setStep] = useState(1); // 1: Details, 2: Members, 3: Submission
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUser]);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableOperatives, setAvailableOperatives] = useState<Operative[]>([]);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'pending' | 'approved'>('idle');

    useState(() => {
        const fetchOps = async () => {
            // In a real app, you might only fetch contacts. For this simulation, we get all.
            const allOps = await getOperatives();
            setAvailableOperatives(allOps.filter(op => op.id !== currentUser));
        };
        fetchOps();
    });

    const handleToggleMember = (operativeId: string) => {
        setSelectedMembers(prev =>
            prev.includes(operativeId)
                ? prev.filter(id => id !== operativeId)
                : [...prev, operativeId]
        );
    };

    const handleCreate = async () => {
        setStep(3);
        setSubmissionStatus('pending');
        try {
            const newGroupData = await addGroup(groupName, currentUser, selectedMembers);
            setSubmissionStatus('approved');
            const newGroupChatInfo = groupToChatInfo(newGroupData);
            setTimeout(() => {
                onAddGroup(newGroupChatInfo);
                onClose();
            }, 1000);
        } catch (error) {
            console.error("Failed to create group:", error);
            alert("Failed to create group. Please try again.");
            setStep(2); // Go back to member selection on error
            setSubmissionStatus('idle');
        }
    };
    
    const filteredOperatives = availableOperatives.filter(op =>
        op.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div>
                         <h2 className="text-xl font-bold mb-4">Create New Group</h2>
                         <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Define a name for your new secure channel.</p>
                         <div>
                            <label htmlFor="groupName" className="text-xs font-semibold text-gray-500 uppercase">Group Name</label>
                            <input 
                                id="groupName"
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g., Operation Nightfall"
                                className="w-full mt-1 px-3 py-2 bg-gray-300 dark:bg-gray-900 border border-gray-400 dark:border-gray-700 rounded-md text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                autoFocus
                            />
                         </div>
                         <div className="flex justify-end space-x-3 mt-8">
                            <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600">Cancel</button>
                            <button onClick={() => setStep(2)} disabled={!groupName.trim()} className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed">Next</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h2 className="text-xl font-bold mb-1">Add Members</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Select operatives to include in "{groupName}".</p>
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search operatives..."
                            className="w-full mb-4 px-3 py-2 bg-gray-300 dark:bg-gray-900 border border-gray-400 dark:border-gray-700 rounded-md text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                           {filteredOperatives.map(op => (
                               <label key={op.id} className="flex items-center p-3 rounded-md bg-gray-300 dark:bg-gray-900/50 hover:bg-gray-400/50 dark:hover:bg-gray-900 cursor-pointer">
                                   <input type="checkbox" checked={selectedMembers.includes(op.id)} onChange={() => handleToggleMember(op.id)} className="h-4 w-4 rounded bg-gray-400 dark:bg-gray-700 border-gray-500 dark:border-gray-600 text-teal-600 focus:ring-teal-500" />
                                   <div className="ml-3">
                                        <p className="font-semibold text-gray-800 dark:text-white">{op.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{op.rank}</p>
                                   </div>
                               </label>
                           ))}
                        </div>
                         <div className="flex justify-between items-center mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMembers.length} members selected</p>
                            <div className="flex space-x-3">
                                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600">Back</button>
                                <button onClick={handleCreate} disabled={selectedMembers.length < 2} className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed">Send Request to HQ</button>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                 if (submissionStatus === 'pending') {
                    return (
                        <div className="text-center p-4">
                            <svg className="animate-spin h-8 w-8 text-teal-500 dark:text-teal-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-lg">Request Pending...</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting approval from HQ servers.</p>
                        </div>
                    );
                 }
                 if (submissionStatus === 'approved') {
                     return (
                         <div className="text-center p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <p className="text-lg">Group Approved</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Adding group to your channels.</p>
                        </div>
                    );
                 }
                 return null;
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-gray-800 dark:text-white">
               {renderStepContent()}
            </div>
        </div>
    )
}


const Sidebar: React.FC<SidebarProps> = ({ chats, dms, onChatSelect, onAddGroup, isCollapsed, onToggle, onToggleSettings, activeChatId, currentUserProfile, onStatusChange }) => {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
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

    const getStatusColor = (status: OperativeStatus) => {
        switch(status) {
            case 'Online': return 'bg-green-500';
            case 'Away': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

  return (
    <>
    {showCreateGroupModal && <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} onAddGroup={onAddGroup} currentUser={currentUserProfile.id} />}
    {showSearchModal && <SearchOperativesModal onClose={() => setShowSearchModal(false)} currentUser={currentUserProfile.id} />}
    <nav className={`flex flex-col bg-gray-100 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <div 
        onClick={onToggle}
        className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center h-[73px] cursor-pointer relative" 
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
           <div className={`flex items-center justify-between mb-2 ${isCollapsed ? 'justify-center' : 'pl-2'}`}>
              <h2 className={`text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider`}>
                {isCollapsed ? 'D' : 'Direct Messages'}
              </h2>
               {!isCollapsed && (
                    <button onClick={() => setShowSearchModal(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-full" aria-label="Find operative">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </button>
                )}
           </div>
          {renderChannelList(dms)}
        </div>
        <div>
           <h2 className={`text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'text-center' : 'pl-2'}`}>
            {isCollapsed ? 'U' : 'Utilities'}
          </h2>
          {renderChannelList(BOTS_LIST)}
        </div>
      </div>
       <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <div className={`flex items-center p-2 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}>
                 <div className={`relative flex-shrink-0`}>
                     <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-lg">
                        {currentUserProfile.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                    </div>
                     <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${getStatusColor(currentUserProfile.status)} border-2 border-gray-100 dark:border-gray-950`}></span>
                 </div>
                 {!isCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{currentUserProfile.name}</p>
                        <select 
                            value={currentUserProfile.status}
                            onChange={(e) => onStatusChange(e.target.value as OperativeStatus)}
                            className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-0 focus:ring-0 p-0"
                            disabled={currentUserProfile.status === 'Offline'}
                        >
                            <option value="Online">Online</option>
                            <option value="Away">Away</option>
                            <option value="Offline" disabled>Offline</option>
                        </select>
                    </div>
                 )}
            </div>
       </div>
    </nav>
    </>
  );
};

export default Sidebar;