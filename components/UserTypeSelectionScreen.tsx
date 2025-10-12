import React from 'react';

interface UserTypeSelectionScreenProps {
  onSelectOperative: () => void;
  onSelectFamily: () => void;
}

const UserTypeSelectionScreen: React.FC<UserTypeSelectionScreenProps> = ({ onSelectOperative, onSelectFamily }) => {

  const Card: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void}> = ({ title, description, icon, onClick }) => (
    <button
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-8 w-full text-left hover:bg-gray-800 hover:border-teal-500 transition-all duration-300 group"
    >
      <div className="flex items-center">
        <div className="p-4 bg-gray-950 rounded-lg mr-6 text-teal-400 group-hover:text-white">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-1">{description}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-auto text-gray-600 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  );


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-2xl mx-auto text-center p-4">
         <div className="flex flex-col items-center justify-center mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 10-2 0v2a1 1 0 102 0v-2zm1-1a1 1 0 00-1-1H9a1 1 0 100 2h1a1 1 0 001-1zm-1-3a1 1 0 10-2 0v2a1 1 0 102 0V9z" clip-rule="evenodd"></path></svg>
            <h1 className="text-3xl font-bold text-gray-200 mt-4">Select User Type</h1>
            <p className="text-gray-400 mt-1">Please specify your role to continue.</p>
        </div>
        <div className="space-y-6">
            <Card
                title="Operative"
                description="Login for authorized field operatives."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                onClick={onSelectOperative}
            />
            <Card
                title="Family"
                description="Login for family members of operatives."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path></svg>}
                onClick={onSelectFamily}
            />
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelectionScreen;