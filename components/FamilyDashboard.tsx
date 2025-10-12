import React, { useState, useEffect, useRef } from 'react';
import { getFamilyMembers, getFamilyGroups } from '../hq/api';
import ChatScreen from './ChatScreen';
import { useAuth } from '../contexts/AuthContext';

const CreateGroupModal: React.FC<{ onClose: () => void; onCreate: (name: string, members: string[]) => void; familyMembers: any[] }> = ({ onClose, onCreate, familyMembers }) => {
    const [name, setName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const handleToggleMember = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSubmit = () => {
        onCreate(name, selectedMembers);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-white">
                <h2 className="text-xl font-bold mb-4">Create New Group</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Group Name"
                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Select Members</h3>
                    {familyMembers.map(member => (
                        <label key={member.id} className="flex items-center p-2 rounded-md hover:bg-gray-700">
                            <input type="checkbox" checked={selectedMembers.includes(member.id)} onChange={() => handleToggleMember(member.id)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-teal-600 focus:ring-teal-500" />
                            <span className="ml-3">{member.name}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSubmit} disabled={!name.trim() || selectedMembers.length === 0} className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed">Create</button>
                </div>
            </div>
        </div>
    );
};

const FamilyDashboard: React.FC = () => {
  const { userId } = useAuth();
  const currentUserId = userId;
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [familyGroups, setFamilyGroups] = useState<any[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    if (currentUserId) {
        const fetchData = async () => {
            const members = await getFamilyMembers(currentUserId);
            const groups = await getFamilyGroups(currentUserId);
            setFamilyMembers(members);
            setFamilyGroups(groups);
            const profile = members.find(m => m.username === currentUserId);
            setCurrentUserProfile(profile);
        };
        fetchData();

        socketRef.current = new WebSocket(`ws://localhost:3001?userId=${currentUserId}`);

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Handle incoming messages
        };

        return () => {
            socketRef.current?.close();
        };
    }
  }, [currentUserId]);

  const handleCreateGroup = async (name: string, members: string[]) => {
    const response = await fetch('/api/family/groups', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, members: [...members, currentUserId] }),
    });
    if (response.ok) {
        const newGroup = await response.json();
        setFamilyGroups(prev => [...prev, newGroup]);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!currentUserProfile) return;

    const formData = new FormData();
    formData.append('pfp', file);

    const token = localStorage.getItem('vajralink_token');
    const response = await fetch(`/api/family/${currentUserProfile.username}/pfp`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (response.ok) {
        const { pfpUrl } = await response.json();
        setCurrentUserProfile((prev: any) => (prev ? { ...prev, pfp: pfpUrl } : null));
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        {showCreateGroupModal && <CreateGroupModal onClose={() => setShowCreateGroupModal(false)} onCreate={handleCreateGroup} familyMembers={familyMembers} />}
      <div className="w-80 flex-shrink-0 bg-gray-950 p-4">
        <h2 className="text-2xl font-bold mb-4">Family Portal</h2>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Family Members</h3>
          <ul>
            {familyMembers.map(member => (
              <li key={member.id}>
                <button onClick={() => setSelectedChat(member)} className="w-full text-left p-2 rounded-md hover:bg-gray-800">
                  {member.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Groups</h3>
                <button onClick={() => setShowCreateGroupModal(true)} className="text-teal-400 hover:text-teal-300">+</button>
            </div>
          <ul>
            {familyGroups.map(group => (
              <li key={group.id}>
                <button onClick={() => setSelectedChat(group)} className="w-full text-left p-2 rounded-md hover:bg-gray-800">
                  {group.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {selectedChat ? (
          <ChatScreen chatInfo={selectedChat} onHeaderClick={() => {}} onReportFiled={() => {}} socket={socketRef.current} />
        ) : (
          <div className="text-center">
            <h1 className="text-4xl font-bold">Welcome</h1>
            <p className="mt-4 text-lg text-gray-400">Select a family member or group to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;