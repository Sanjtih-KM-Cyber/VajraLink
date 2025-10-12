import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FamilyLoginFormProps {
  onSwitchToRegister: () => void;
}

const FamilyLoginForm: React.FC<FamilyLoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/family/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const { token, userId } = await response.json();
        localStorage.setItem('vajralink_token', token);
        login(userId);
        window.location.href = `/family.html`;
    } else {
        const { error } = await response.json();
        setError(error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-gray-950 border border-gray-800 shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Family Portal Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
            New family member? <button onClick={onSwitchToRegister} className="font-medium text-teal-500 hover:text-teal-400">Request access</button>
        </div>
      </div>
    </div>
  );
};

export default FamilyLoginForm;