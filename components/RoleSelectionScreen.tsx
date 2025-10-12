import React from 'react';

interface RoleSelectionScreenProps {
  onSelectUser: () => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectUser }) => {

  const handleSelectHq = () => {
    window.location.href = '/hq/';
  };

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <h1 className="text-3xl font-bold text-gray-200 mt-4">Secure Connection Established</h1>
            <p className="text-gray-400 mt-1">Please select your destination portal.</p>
        </div>
        <div className="space-y-6">
            <Card 
                title="User Login"
                description="Access the secure communication messenger for operatives and family."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M12 14a4 4 0 100-8 4 4 0 000 8zm0 0c1.657 0 3 2.686 3 6H9c0-3.314 1.343-6 3-6z"></path></svg>}
                onClick={onSelectUser}
            />
            <Card 
                title="HQ Command Login"
                description="Access the administrative and monitoring dashboard."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                onClick={handleSelectHq}
            />
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;