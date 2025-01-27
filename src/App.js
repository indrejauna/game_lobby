// src/App.js
import React, { useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

// Components
import Header from './components/Header';
import GameList from './components/GameList';
import Exchange from './components/Exchange';
import Profile from './components/Profile';
import Footer from './components/Footer';

// Constants
export const TAIL_TOKEN_MINT = new PublicKey('CrbhNV4SUon8QVgCyQg7Khgy6GgcEy8ACDjkKvPrpump');

const endpoint = "https://thrumming-tiniest-valley.solana-mainnet.quiknode.pro/c478cb8b71e3f0b3d9c66b1c4fbbf882e377ad5f/";

function App() {
  const [currentPage, setCurrentPage] = useState('games');

  // Initialize wallet adapter
  const wallets = React.useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'exchange':
        return <Exchange />;
      case 'games':
        return <GameList />;
      case 'profile':
        return <Profile />;
      default:
        return <GameList />;
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="container mx-auto px-4 py-8">
              {renderPage()}
            </main>
            <Footer />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;