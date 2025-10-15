import React, { useState } from 'react';

const RoleSelectionScreen = () => {
  const [selection, setSelection] = useState('main'); // 'main', 'user'

  const handleSelectUser = () => {
    setSelection('user');
  };

  const handleSelectFamily = () => {
    window.location.href = '/family.html';
  };

  const handleSelectOperative = () => {
    window.location.href = '/operative.html';
  };

  const handleSelectHq = () => {
    window.location.href = '/hq/';
  };

  const handleBack = () => {
    setSelection('main');
  };

  const Card = ({ title, description, icon, onClick }) => (
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

  const renderMainSelection = () => (
    <div className="space-y-6">
      <Card
        title="User Login"
        description="Access as a family member or operative."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        onClick={handleSelectUser}
      />
      <Card
        title="Command HQ Login"
        description="Access the administrative and monitoring dashboard."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        onClick={handleSelectHq}
      />
    </div>
  );

  const renderUserSelection = () => (
    <div className="space-y-6">
       <button onClick={handleBack} className="flex items-center text-sm text-gray-400 hover:text-white mb-6 group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to main selection
      </button>
      <Card
        title="Family Login"
        description="Access the family portal."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
        onClick={handleSelectFamily}
      />
      <Card
        title="Operative Login"
        description="Access the secure communication messenger."
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        onClick={handleSelectOperative}
      />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-2xl mx-auto text-center p-4">
         <div className="flex flex-col items-center justify-center mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <h1 className="text-3xl font-bold text-gray-200 mt-4">VajraLink Portal</h1>
            <p className="text-gray-400 mt-1">Please select your destination.</p>
        </div>
        {selection === 'main' ? renderMainSelection() : renderUserSelection()}
      </div>
    </div>
  );
};

export default RoleSelectionScreen;
