import React from 'react';
import { siteConfig } from '../../siteConfig';
import { Phone } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { brand, navbar } = siteConfig;

  return (
    <header className="site-navbar" id="site-navbar">
      <div className="container navbar-container">
        {/* Brand Group */}
        <a href="#" className="navbar-brand" aria-label={brand.name}>
          <img
            src={brand.logoPath}
            alt={brand.name}
            className="navbar-logo"
            width="72"
            height="72"
          />
          <div className="navbar-brand-text">
            <span className="navbar-title">{brand.name}</span>
            <span className="navbar-tagline">{brand.taglineNavbar}</span>
          </div>
        </a>

        {/* Navigation & Action Container */}
        <div className="navbar-right">
          {/* Navigation Links */}
          <nav className="navbar-nav" aria-label="Main Navigation">
            <ul className="nav-list">
              {navbar.links.map((link) => (
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

          {/* Vertical Separator */}
          <div className="navbar-divider" aria-hidden="true" />

          {/* Call CTA Group */}
          <a
            href={navbar.callAction.tel}
            className="navbar-call-cta"
            aria-label={`Call us now at ${navbar.callAction.phone}`}
          >
            <div className="call-icon-circle">
              <Phone size={16} strokeWidth={2.2} color="#ffffff" />
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

