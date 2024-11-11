// src/services/profileService.js
class ProfileService {
    constructor() {
      this.profiles = new Map();
      this.defaultAvatars = ['👨‍🚀', '👩‍🚀', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🦊', '🐼', '🐯', '🦁', '🐸', '🐉'];
    }
  
    initializeProfile(walletAddress) {
      const defaultProfile = {
        name: `Player ${walletAddress.slice(0, 4)}`,
        avatar: this.defaultAvatars[0],
        gamesPlayed: 0,
        gamesWon: 0,
        totalWinnings: 0,
        createdAt: new Date().toISOString()
      };
      this.saveProfile(walletAddress, defaultProfile);
      return defaultProfile;
    }
  
    getProfile(walletAddress) {
      const savedProfile = localStorage.getItem(`profile_${walletAddress}`);
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
      return this.initializeProfile(walletAddress);
    }
  
    saveProfile(walletAddress, profileData) {
      localStorage.setItem(`profile_${walletAddress}`, JSON.stringify(profileData));
      this.profiles.set(walletAddress, profileData);
    }
  
    updateProfile(walletAddress, updates) {
      const currentProfile = this.getProfile(walletAddress);
      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveProfile(walletAddress, updatedProfile);
      return updatedProfile;
    }
  
    changeName(walletAddress, newName) {
      if (!newName.trim()) {
        throw new Error('Name cannot be empty');
      }
      if (newName.length > 20) {
        throw new Error('Name must be 20 characters or less');
      }
      return this.updateProfile(walletAddress, { name: newName.trim() });
    }
  
    getPlayerName(walletAddress) {
      const profile = this.getProfile(walletAddress);
      return profile.name;
    }
  
    getPlayerAvatar(walletAddress) {
      const profile = this.getProfile(walletAddress);
      return profile.avatar;
    }
  }
  
  const profileService = new ProfileService();
  export default profileService;