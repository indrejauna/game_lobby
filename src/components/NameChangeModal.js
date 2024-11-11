// src/components/NameChangeModal.js
import React, { useState } from 'react';
import profileService from '../services/profileService';

const NameChangeModal = ({ isOpen, onClose, walletAddress, onNameChanged }) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updatedProfile = await profileService.changeName(walletAddress, newName);
      onNameChanged(updatedProfile.name);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl border border-white/10 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Change Name</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              placeholder="Enter new name"
              maxLength={20}
            />
            <p className="mt-1 text-sm text-gray-400">
              {20 - newName.length} characters remaining
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Name'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-opacity-80 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameChangeModal;