import React, { useState, useEffect } from 'react';
import { siteConfig } from '../../siteConfig';
import { Phone, Menu as MenuIcon, X as CloseIcon, Star } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  activePage?: 'home' | 'about' | 'contact' | 'gallery';
  isAboutPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage = 'home', isAboutPage }) => {
  const current = isAboutPage ? 'about' : activePage;
  const { brand, navbar } = siteConfig;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route/hash changes
  useEffect(() => {
    const handleClose = () => setMobileMenuOpen(false);
    window.addEventListener('hashchange', handleClose);
    return () => window.removeEventListener('hashchange', handleClose);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const links = navbar.links.map((link) => {
    if (link.label === 'About') {
      return {
        ...link,
        href: '#/about',
        isActive: current === 'about',
      };
    }
    if (link.label === 'Gallery') {
      return {
        ...link,
        href: '#/gallery',
        isActive: current === 'gallery',
      };
    }
    if (link.label === 'Contact') {
      return {
        ...link,
        href: '#/contact',
        isActive: current === 'contact',
      };
    }
    if (link.label === 'Home') {
      return {
        ...link,
        href: '#/',
        isActive: current === 'home',
      };
    }
    return {
      ...link,
      href: current !== 'home' ? `#/${link.href}` : link.href,
      isActive: false,
    };
  });

  return (
    <>
      <header className="site-navbar" id="site-navbar">
        <div className="container navbar-container">
          {/* Brand Group */}
          <a href="#/" className="navbar-brand" aria-label={brand.name} onClick={() => setMobileMenuOpen(false)}>
            <img
              src={brand.logoPath}
              alt={brand.name}
              className="navbar-logo"
              width="48"
              height="48"
            />
            <div className="navbar-brand-text">
              <span className="navbar-title">{brand.name}</span>
              <span className="navbar-tagline">{brand.taglineNavbar}</span>
            </div>
          </a>

          {/* Navigation Links (Centered on Desktop) */}
          <nav className="navbar-nav" aria-label="Main Navigation">
            <ul className="nav-list">
              {links.map((link) => (
                <li key={link.label} className="nav-item">
                  <a
                    href={link.href}
                    className={`nav-link ${link.isActive ? 'active' : ''}`}
                  >
                    {link.label}
                    {link.isActive && <span className="active-indicator" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Action Container */}
          <div className="navbar-actions">
            {/* Desktop Call CTA (Untouched on Desktop) */}
            <a
              href={navbar.callAction.tel}
              className="navbar-call-cta"
              aria-label={`Call us now at ${navbar.callAction.phone}`}
            >
              <div className="call-icon-circle">
                <Phone size={14} strokeWidth={2.2} color="#ffffff" />
              </div>
              <div className="call-text-group">
                <span className="call-label">{navbar.callAction.label}</span>
                <span className="call-separator">|</span>
                <span className="call-number">{navbar.callAction.phone}</span>
              </div>
            </a>

            {/* Mobile Call Icon Button */}
            <a
              href={navbar.callAction.tel}
              className="navbar-mobile-call-btn"
              aria-label={`Call ${navbar.callAction.phone}`}
              title="Call Restaurant"
            >
              <Phone size={18} strokeWidth={2.2} />
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className="navbar-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <CloseIcon size={24} strokeWidth={2.4} />
              ) : (
                <MenuIcon size={24} strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="navbar-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div className={`navbar-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img src={brand.logoPath} alt="" className="mobile-drawer-logo" width="36" height="36" />
            <div className="mobile-drawer-brand-text">
              <span className="mobile-drawer-title">{brand.name}</span>
              <span className="mobile-drawer-tagline">Pure Veg Dining • Solapur</span>
            </div>
          </div>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            <CloseIcon size={22} strokeWidth={2.4} />
          </button>
        </div>

        <nav className="mobile-drawer-nav">
          <ul className="mobile-nav-list">
            {links.map((link) => (
              <li key={link.label} className="mobile-nav-item">
                <a
                  href={link.href}
                  className={`mobile-nav-link ${link.isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-label">{link.label}</span>
                  {link.label === 'Menu' && (
                    <span className="mobile-menu-badge">280 Dishes</span>
                  )}
                  {link.isActive && <span className="mobile-active-dot" />}
                </a>
              </li>
            ))}
            <li className="mobile-nav-item">
              <a
                href="#popular-dishes"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-nav-label">Popular Dishes</span>
              </a>
            </li>
            <li className="mobile-nav-item">
              <a
                href="#testimonials"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mobile-nav-label">Guest Reviews</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Drawer Action Cards */}
        <div className="mobile-drawer-footer">
          <a
            href="#/review"
            className="mobile-drawer-review-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Star size={16} fill="#FFB800" color="#FFB800" />
            <span>Rate & Review Us</span>
          </a>

          <a
            href={navbar.callAction.tel}
            className="mobile-drawer-call-btn"
          >
            <Phone size={16} />
            <span>Call {navbar.callAction.phone}</span>
          </a>

          <div className="mobile-drawer-info">
            <div>Old Pune Naka, Solapur</div>
            <div className="mobile-drawer-hours">Open Daily: 11:00 AM – 11:00 PM</div>
          </div>
        </div>
      </div>
    </>
  );
};
