'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, cart } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    // Logout will be handled by useApp context
    window.location.href = '/';
  };

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
            <Link href="/products" className="text-gray-300 hover:text-white transition-colors text-sm">Products</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">About</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#111] rounded-lg shadow-lg border border-white/10 py-2">
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Addresses
                    </Link>
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                Sign In
              </Link>
            )}

            {/* Mobile Toggle */}
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
            <Link href="/products" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link href="/about" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Contact</Link>
            {user ? (
              <>
                <hr className="border-white/10 my-2" />
                <Link href="/orders" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <Link href="/account/addresses" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Addresses</Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left text-red-400 hover:text-red-300 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <hr className="border-white/10 my-2" />
                <Link href="/auth/login" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/auth/register" className="block text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileOpen(false)}>Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
