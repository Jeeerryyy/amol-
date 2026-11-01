import React from 'react';
import { siteConfig } from '../../siteConfig';
import { Phone } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  activePage?: 'home' | 'about' | 'contact' | 'gallery';
  isAboutPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage = 'home', isAboutPage }) => {
  const current = isAboutPage ? 'about' : activePage;
  const { brand, navbar } = siteConfig;

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
    <header className="site-navbar" id="site-navbar">
      <div className="container navbar-container">
        {/* Brand Group */}
        <a href="#/" className="navbar-brand" aria-label={brand.name}>
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

        {/* Navigation Links (Centered) */}
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
        </div>
      </div>
    </header>
  );
};

