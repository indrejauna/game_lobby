// src/components/Header.js
import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'games', label: 'Games' },
    { id: 'exchange', label: 'Exchange' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="bg-gray-800/40 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold">
              <span className="text-green-400">Tail</span>
              <span className="text-purple-400"> Hodler</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex space-x-6">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
                    currentPage === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-opacity-80 transition" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;