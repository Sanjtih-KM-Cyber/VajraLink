import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar, { ChatInfo } from './Sidebar';
import ChatScreen from './ChatScreen';
import { getGroupsForUser, addFamilyGroup } from '../hq/api';
import { Group }from '../common/types';
import { useAuth } from '../contexts/AuthContext';

interface FamilyDashboardProps {
  onLogout: () => void;
}

const groupToChatInfo = (group: Group): ChatInfo => ({
    id: group.id,
    name: group.name,
    type: 'Family Channel',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.52 1.857a3 3 0 00-5.356-1.857m0 0A3 3 0 017 16.143m5.657 1.857l-2.829-5.657a3 3 0 015.657 0l-2.829 5.657z" /></svg>,
});

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({ onLogout }) => {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);
  const { userId } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  const loadInitialData = useCallback(async () => {
      if (userId) {
          const userGroups = await getGroupsForUser(userId);
          const groupChats = userGroups.map(groupToChatInfo);
          setChats(groupChats);
          if (!selectedChat && groupChats.length > 0) {
              setSelectedChat(groupChats[0]);
          }
      }
  }, [userId, selectedChat]);

  useEffect(() => {
    loadInitialData();
    if (userId) {
        socketRef.current = new WebSocket(`ws://localhost:3001?userId=${userId}`);
    }
    return () => {
        socketRef.current?.close();
    };
  }, [userId, loadInitialData]);

  const handleAddGroup = async (name: string, members: string[]) => {
      if (userId) {
        const newGroup = await addFamilyGroup(name, userId, members);
        const newChat = groupToChatInfo(newGroup);
        setChats(prevChats => [...prevChats, newChat]);
        setSelectedChat(newChat);
      }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        chats={chats}
        dms={[]}
        familyChats={[]}
        onChatSelect={setSelectedChat}
        onAddGroup={() => {
            const groupName = prompt("Enter group name:");
            if (groupName) {
                const members = prompt("Enter member usernames (comma-separated):");
                if (members) {
                    handleAddGroup(groupName, members.split(',').map(m => m.trim()));
                }
            }
        }}
        isCollapsed={false}
        onToggle={() => {}}
        onToggleSettings={() => {}}
        activeChatId={selectedChat?.id || ''}
        currentUserProfile={{id: userId, name: userId, rank: 'Family', status: 'Online', clearance: 0, joinDate: '', isStatusVisible: true}}
        onStatusChange={() => {}}
        onProfilePictureUpload={() => {}}
      />
      <div className="flex-1 flex flex-col">
        {selectedChat && socketRef.current ? (
          <ChatScreen
            key={selectedChat.id}
            chatInfo={selectedChat}
            onHeaderClick={() => {}}
            onReportFiled={() => {}}
            socket={socketRef.current}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;