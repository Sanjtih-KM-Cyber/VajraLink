import React, { useState, useEffect, useMemo } from 'react';
import { ChatInfo } from './Sidebar';
import { Group, Operative } from '../common/types';
import { getGroupDetails, getOperatives, removeMemberFromGroup, addMemberToGroup, leaveGroup, deleteGroup } from '../hq/api';

interface GroupInfoPanelProps {
  chatInfo: ChatInfo;
  currentUser: string;
  onClose: () => void;
  onGroupUpdate: () => void; // To refresh the sidebar
  onSelectChat: (chat: ChatInfo | null) => void;
}

const AddMembersModal: React.FC<{
    group: Group;
    onClose: () => void;
    onMembersAdded: () => void;
    currentUser: string;
}> = ({ group, onClose, onMembersAdded, currentUser }) => {
    const [availableOperatives, setAvailableOperatives] = useState<Operative[]>([]);
    const [selectedOperatives, setSelectedOperatives] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchOperatives = async () => {
            const allOps = await getOperatives(); // In a real app, this should be user's contacts
            const nonMembers = allOps.filter(op => !group.members.includes(op.id));
            setAvailableOperatives(nonMembers);
        };
        fetchOperatives();
    }, [group.members]);

    const handleToggle = (opId: string) => {
        setSelectedOperatives(prev => prev.includes(opId) ? prev.filter(id => id !== opId) : [...prev, opId]);
    };

    const handleAdd = async () => {
        setIsAdding(true);
        await Promise.all(selectedOperatives.map(opId => addMemberToGroup(group.id, opId, currentUser)));
        setIsAdding(false);
        onMembersAdded();
        onClose();
    };

    const filteredOperatives = useMemo(() => 
        availableOperatives.filter(op => op.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [availableOperatives, searchTerm]
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-white">
                <h2 className="text-xl font-bold mb-4">Add Members to {group.name}</h2>
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search operatives..." className="w-full mb-4 px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {filteredOperatives.map(op => (
                        <label key={op.id} className="flex items-center p-3 rounded-md bg-gray-900/50 hover:bg-gray-700 cursor-pointer">
                            <input type="checkbox" checked={selectedOperatives.includes(op.id)} onChange={() => handleToggle(op.id)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-teal-600 focus:ring-teal-500" />
                            <div className="ml-3"><p className="font-semibold">{op.name}</p></div>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-600 hover:bg-gray-500">Cancel</button>
                    <button onClick={handleAdd} disabled={selectedOperatives.length === 0 || isAdding} className="px-4 py-2 rounded-md text-sm font-semibold bg-teal-600 hover:bg-teal-500 disabled:bg-gray-500">
                        {isAdding ? 'Adding...' : 'Add Selected'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GroupInfoPanel: React.FC<GroupInfoPanelProps> = ({ chatInfo, currentUser, onClose, onGroupUpdate, onSelectChat }) => {
    const [group, setGroup] = useState<Group | null>(null);
    const [allOperatives, setAllOperatives] = useState<Operative[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddMembers, setShowAddMembers] = useState(false);

    const fetchGroupData = async () => {
        setIsLoading(true);
        const [groupDetails, operatives] = await Promise.all([
            getGroupDetails(chatInfo.id),
            getOperatives() // To map member IDs to names
        ]);
        setGroup(groupDetails);
        setAllOperatives(operatives);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchGroupData();
    }, [chatInfo.id]);

    const handleRemoveMember = async (memberId: string) => {
        if (!group || !confirm(`Are you sure you want to remove this member from ${group.name}?`)) return;
        await removeMemberFromGroup(group.id, memberId, currentUser);
        fetchGroupData(); // Refresh data
    };
    
    const handleLeave = async () => {
        if (!group || !confirm(`Are you sure you want to leave ${group.name}?`)) return;
        await leaveGroup(group.id, currentUser);
        onGroupUpdate(); // Refresh sidebar
        onSelectChat(null); // Deselect the chat
        onClose();
    };
    
    const handleDelete = async () => {
        if (!group) {
            return;
        }
        // FIX: Corrected comparison logic. The original code compared a boolean to a string, causing an error.
        // This now correctly checks if the user's input from the prompt matches the group name before proceeding with deletion.
        const confirmation = prompt(`This action cannot be undone. To delete "${group.name}", please type its name below.`);
        if (confirmation !== group.name) {
            alert("Group name did not match. Deletion cancelled.");
            return;
        }
        await deleteGroup(group.id, currentUser);
        onGroupUpdate(); // Refresh sidebar
        onSelectChat(null); // Deselect the chat
        onClose();
    };

    const members = useMemo(() => {
        if (!group) return [];
        return group.members.map(memberId => 
            allOperatives.find(op => op.id === memberId)
        ).filter((op): op is Operative => op !== undefined);
    }, [group, allOperatives]);

    const isAdmin = group?.admin === currentUser;

    return (
        <>
            {showAddMembers && group && <AddMembersModal group={group} onClose={() => setShowAddMembers(false)} onMembersAdded={fetchGroupData} currentUser={currentUser} />}
            <div className="fixed inset-0 bg-black/30 z-20" onClick={onClose}></div>
            <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 z-30 shadow-2xl flex flex-col animate-slide-in">
                <header className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-bold text-white">Group Info</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                {isLoading || !group ? (
                    <div className="flex items-center justify-center flex-1 text-gray-400">Loading...</div>
                ) : (
                    <>
                        <main className="flex-1 p-6 overflow-y-auto">
                            <div className="flex flex-col items-center">
                                <div className="p-5 bg-gray-800 rounded-lg text-teal-400 mb-4">{React.cloneElement(chatInfo.icon, { className: "h-16 w-16" })}</div>
                                <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                                <p className="text-sm text-gray-400">Created on {new Date(group.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase">{group.members.length} Members</h3>
                                    {isAdmin && <button onClick={() => setShowAddMembers(true)} className="text-xs text-teal-400 hover:underline">Add Member</button>}
                                </div>
                                <ul className="space-y-2">
                                    {members.map(member => (
                                        <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-700/50">
                                            <div>
                                                <p className="font-semibold text-white">{member.name}</p>
                                                {group.admin === member.id && <p className="text-xs text-yellow-400">Admin</p>}
                                            </div>
                                            {isAdmin && member.id !== currentUser && (
                                                <button onClick={() => handleRemoveMember(member.id)} className="p-1 text-gray-500 hover:text-red-400" aria-label={`Remove ${member.name}`}>&times;</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </main>
                        <footer className="p-4 border-t border-gray-800 space-y-2">
                             {isAdmin ? (
                                <button onClick={handleDelete} className="w-full text-center py-2 px-4 rounded-md text-sm font-medium text-red-400 bg-red-900/50 hover:bg-red-900">Delete Group</button>
                             ) : (
                                <button onClick={handleLeave} className="w-full text-center py-2 px-4 rounded-md text-sm font-medium text-red-400 bg-red-900/50 hover:bg-red-900">Leave Group</button>
                             )}
                        </footer>
                    </>
                )}
            </div>
            <style>{`
                @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

export default GroupInfoPanel;
