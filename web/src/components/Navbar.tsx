'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            INTIMACY
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">About</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</Link>
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">Privacy</Link>
          </div>

          {/* Cart + Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <button className="relative text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#111] border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/about" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Privacy</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
