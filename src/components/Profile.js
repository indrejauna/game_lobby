// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const DEFAULT_AVATARS = [
  '👨‍🚀', '👩‍🚀', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', 
  '🦊', '🐼', '🐯', '🦁', '🐸', '🐉'
];

const Profile = () => {
  const { publicKey } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    avatar: DEFAULT_AVATARS[0],
    gamesPlayed: 0,
    gamesWon: 0,
    totalWinnings: 0,
  });
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [newName, setNewName] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load profile data
  useEffect(() => {
    if (publicKey) {
      const savedProfile = localStorage.getItem(`profile_${publicKey.toString()}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setSelectedAvatar(parsedProfile.avatar);
        setNewName(parsedProfile.name);
      } else {
        const defaultProfile = {
          name: `Player ${publicKey.toString().slice(0, 4)}`,
          avatar: DEFAULT_AVATARS[0],
          gamesPlayed: 0,
          gamesWon: 0,
          totalWinnings: 0,
        };
        setProfile(defaultProfile);
        setNewName(defaultProfile.name);
        localStorage.setItem(`profile_${publicKey.toString()}`, JSON.stringify(defaultProfile));
      }
    }
  }, [publicKey]);

  // Save profile changes
  const handleSaveProfile = () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = {
        ...profile,
        avatar: selectedAvatar,
      };

      setProfile(updatedProfile);
      localStorage.setItem(`profile_${publicKey.toString()}`, JSON.stringify(updatedProfile));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  // Handle name change
  const handleNameChange = () => {
    if (!publicKey || !newName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = {
        ...profile,
        name: newName.trim()
      };

      setProfile(updatedProfile);
      localStorage.setItem(`profile_${publicKey.toString()}`, JSON.stringify(updatedProfile));
      setIsEditingName(false);
    } catch (err) {
      setError('Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-20 text-gray-400">
        Please connect your wallet to view your profile
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        {!isEditing && !isEditingName && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-opacity-80 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div 
              className="text-6xl bg-gray-700/50 rounded-full p-4 cursor-pointer"
              onClick={() => isEditing && setShowAvatarPicker(true)}
            >
              {selectedAvatar}
            </div>
            {isEditing && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setShowAvatarPicker(true)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Change Avatar
                </button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              {isEditingName ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={20}
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                    placeholder="Enter your name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleNameChange}
                      disabled={loading || !newName.trim()}
                      className="px-4 py-1 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? 'Saving...' : 'Save Name'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(profile.name);
                      }}
                      className="px-4 py-1 bg-gray-700 rounded-lg hover:bg-opacity-80 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Change Name
                  </button>
                </>
              )}
            </div>
            
            <div className="text-sm text-gray-400">
              Wallet: {`${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-purple-400">{profile.gamesPlayed}</div>
          <div className="text-gray-400">Games Played</div>
        </div>
        
        <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-green-400">{profile.gamesWon}</div>
          <div className="text-gray-400">Games Won</div>
        </div>
        
        <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-purple-400">{profile.totalWinnings}</div>
          <div className="text-gray-400">Total GT Won</div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl border border-white/10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Choose Avatar</h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {DEFAULT_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setShowAvatarPicker(false);
                  }}
                  className={`text-4xl p-4 rounded-lg transition ${
                    avatar === selectedAvatar
                      ? 'bg-purple-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-4">
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedAvatar(profile.avatar);
            }}
            className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-opacity-80 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;