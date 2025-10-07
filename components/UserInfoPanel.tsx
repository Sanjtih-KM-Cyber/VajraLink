
import React from 'react';
import { DmChatInfo } from './Sidebar';

interface UserInfoPanelProps {
  user: DmChatInfo;
  onClose: () => void;
}

const UserInfoPanel: React.FC<UserInfoPanelProps> = ({ user, onClose }) => {
  const statusColor = {
    Online: 'bg-green-500',
    Away: 'bg-yellow-500',
    Offline: 'bg-gray-500',
  }[user.status];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-20"
        onClick={onClose}
      ></div>
      <div className="absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 z-30 shadow-2xl flex flex-col animate-slide-in">
        <header className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Contact Info</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {/* FIX: Pass props as the second argument to React.cloneElement */}
              {React.cloneElement(user.icon, { className: "h-24 w-24 text-5xl" })}
              <span className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full ${statusColor} border-2 border-gray-900`}></span>
            </div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-gray-400">{user.rank}</p>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Status</h3>
              <p className="text-white mt-1">{user.status}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Join Date</h3>
              <p className="text-white mt-1">{new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Security Clearance</h3>
              <p className="text-teal-400 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944a11.954 11.954 0 007.834 3.055a1.96 1.96 0 01-.834 3.922c-.23-.229-.48-.45-.736-.656a9.939 9.939 0 00-2.312-1.428a1 1 0 00-1.12 1.664c.594.396 1.162.81 1.696 1.253a1 1 0 001.275-.21a9.953 9.953 0 012.312-2.312a1 1 0 10-.943-1.748a11.954 11.954 0 00-2.323-.424a1 1 0 10-.33 1.973a9.96 9.96 0 012.008.354A1.96 1.96 0 0110 18.06a1.96 1.96 0 01-8.334-3.922A11.954 11.954 0 0010 18.06a11.954 11.954 0 007.834-3.055a1.96 1.96 0 01-.834-3.922c-.23.229-.48.45-.736.656a9.939 9.939 0 00-2.312 1.428a1 1 0 00-1.12-1.664c.594-.396 1.162-.81 1.696-1.253a1 1 0 001.275.21a9.953 9.953 0 012.312 2.312a1 1 0 10.943 1.748a11.954 11.954 0 002.323.424a1 1 0 10.33-1.973a9.96 9.96 0 01-2.008-.354A1.96 1.96 0 0110 2.06a1.96 1.96 0 018.334 3.922A11.954 11.954 0 0010 2.06a11.954 11.954 0 00-7.834 3.055z" clipRule="evenodd" />
                </svg>
                Level 4 (Top Secret)
              </p>
            </div>
          </div>
        </main>
      </div>
      <style>{`
        @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in {
            animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default UserInfoPanel;
