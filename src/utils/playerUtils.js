// src/utils/playerUtils.js
import React from 'react';
import profileService from '../services/profileService';

export const renderPlayer = (playerAddress) => {
  const avatar = profileService.getPlayerAvatar(playerAddress);
  const name = profileService.getPlayerName(playerAddress);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">{avatar}</span>
      <span>{name}</span>
    </div>
  );
};