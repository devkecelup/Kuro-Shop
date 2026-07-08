"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { data: session } = useSession();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // check on mount

    // Check theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isTransparent = isHomePage && !isScrolled;

  return (
    <nav className="navbar" style={{
      backgroundColor: isTransparent ? 'transparent' : 'var(--bg-dark)',
      borderBottom: isTransparent ? '1px solid transparent' : '1px solid var(--border-color)',
      padding: '1rem 0',
      position: isHomePage ? 'fixed' : 'sticky',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 50,
      transition: 'all 0.3s ease'
    }}>
      <div className="container navbar-container">
        {/* Logo and Mascot */}
        <Link href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="https://i.postimg.cc/HkqPVjpH/Untitled-05-Juli-2026-pukul-22-44-39.png" 
            alt="Mascot Logo" 
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: isTransparent ? '#ffffff' : 'var(--primary-color)',
            transition: 'color 0.3s ease'
          }}>
            KuroShop
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link href="/" style={{ color: isTransparent ? '#ffffff' : 'var(--text-white)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Home</Link>
          <Link href="/#games" style={{ color: isTransparent ? '#ffffff' : 'var(--text-white)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Top Up</Link>
          <Link href="/cek-pesanan" style={{ color: isTransparent ? '#ffffff' : 'var(--text-white)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Cek Pesanan</Link>
          {session?.user && (
            <Link href="/user/history" style={{ color: isTransparent ? '#ffffff' : 'var(--text-white)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Riwayat</Link>
          )}
        </div>

        {/* User / Login Section with SVG Icon */}
        <div className="nav-login" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={toggleTheme} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: isTransparent ? '#ffffff' : 'var(--text-white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} title="Toggle Theme">
            {theme === 'dark' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          {session?.user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                color: isTransparent ? '#ffffff' : 'var(--text-white)', 
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                Halo, {session.user.name?.split(' ')[0]}
              </span>
              <button 
                onClick={() => signOut()}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--primary-color)',
                  border: '1px solid var(--primary-color)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 500,
              transition: 'background-color 0.3s ease'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </Link>
        <Link href="/#games">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          Games
        </Link>
        <Link href="/cek-pesanan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Pesanan
        </Link>
        <Link href="/login">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Account
        </Link>
      </div>
    </nav>
  );
}
