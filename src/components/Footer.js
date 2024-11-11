// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black/40 backdrop-blur-sm border-t border-white/10 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <span className="text-sm text-gray-400">
              Built with 💜 on Solana
            </span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;