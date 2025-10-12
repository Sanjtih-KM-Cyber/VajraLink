import React, { useState } from 'react';

const FamilyRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    operativeName: '',
    relationship: '',
    operativeNumber: '',
    rank: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/register-family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration. Please try again later.');
      }

      alert('Your registration request has been sent to HQ for approval.');
      // Reset form or redirect user as needed
      setFormData({
        operativeName: '',
        relationship: '',
        operativeNumber: '',
        rank: '',
      });
    } catch (err) {
        if(err instanceof Error){
            setError(err.message);
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-lg mx-auto p-8 rounded-2xl bg-gray-950 border border-gray-800 shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Family Registration</h2>
        <p className="text-gray-400 text-center mb-8">Please provide your information to request access.</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="operativeName" className="block text-sm font-medium text-gray-300">Who you are related to?</label>
            <input
              type="text"
              name="operativeName"
              id="operativeName"
              value={formData.operativeName}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="relationship" className="block text-sm font-medium text-gray-300">How are you related to them?</label>
            <input
              type="text"
              name="relationship"
              id="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="operativeNumber" className="block text-sm font-medium text-gray-300">The operative's number</label>
            <input
              type="text"
              name="operativeNumber"
              id="operativeNumber"
              value={formData.operativeNumber}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="rank" className="block text-sm font-medium text-gray-300">Rank</label>
            <input
              type="text"
              name="rank"
              id="rank"
              value={formData.rank}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Send to HQ for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FamilyRegistrationForm;