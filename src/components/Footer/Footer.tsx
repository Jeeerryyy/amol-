import React from 'react';
import { siteConfig } from '../../siteConfig';
import {
  Home,
  User,
  Image as ImageIcon,
  Phone,
  MapPin,
  Clock,
  FileText,
  ExternalLink,
  Instagram,
  Facebook,
  MessageCircle,
  Youtube,
} from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const { brand, footer } = siteConfig;

  return (
    <footer className="site-footer" id="site-footer">
      {/* Decorative Scenery Illustration Placeholder Backdrop */}
      <div className="footer-scenery-backdrop" aria-hidden="true">
        <div className="scenery-placeholder-banner">
          <div className="scenery-inner-text">
            <span>[Footer Scenery Illustration Placeholder: Solapur Landmarks, Gopuram, Palms, Dosa & Fort]</span>
          </div>
        </div>
      </div>

      <div className="container footer-content-container">
        {/* Column 1: Brand & Logo */}
        <div className="footer-col footer-col-brand">
          <a href="#" className="footer-logo-link" aria-label={brand.name}>
            <img
              src={brand.logoPath}
              alt={brand.name}
              className="footer-logo"
              width="110"
              height="110"
            />
          </a>
          <p className="footer-tagline">{footer.tagline}</p>
          <div className="footer-flourish" aria-hidden="true">
            <svg width="48" height="12" viewBox="0 0 48 12" fill="none" stroke="var(--color-border)">
              <path d="M2 6 Q 14 0, 24 6 T 46 6" />
            </svg>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <div className="footer-title-rule" aria-hidden="true" />
          <ul className="footer-links-list">
            <li>
              <a href="#" className="footer-icon-link">
                <Home size={15} className="link-icon" />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a href="#about" className="footer-icon-link">
                <User size={15} className="link-icon" />
                <span>About</span>
              </a>
            </li>
            <li>
              <a href="#gallery" className="footer-icon-link">
                <ImageIcon size={15} className="link-icon" />
                <span>Gallery</span>
              </a>
            </li>
            <li>
              <a href="#contact" className="footer-icon-link">
                <Phone size={15} className="link-icon" />
                <span>Contact</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Visit Us */}
        <div className="footer-col footer-col-visit">
          <h4 className="footer-col-title">Visit Us</h4>
          <div className="footer-title-rule" aria-hidden="true" />
          <div className="visit-info-group">
            <div className="visit-info-row">
              <MapPin size={16} className="visit-icon" />
              <span className="visit-address">{footer.visitUs.address}</span>
            </div>
            <div className="visit-info-row">
              <Clock size={16} className="visit-icon" />
              <span>{footer.visitUs.hours}</span>
            </div>
            <div className="visit-info-row">
              <Phone size={16} className="visit-icon" />
              <a href={footer.visitUs.tel} className="visit-phone-link">
                {footer.visitUs.phone}
              </a>
            </div>
            <a
              href={footer.visitUs.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-directions-btn"
            >
              <MapPin size={14} />
              <span>Get Directions</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Column 4: Follow Us */}
        <div className="footer-col">
          <h4 className="footer-col-title">Follow Us</h4>
          <div className="footer-title-rule" aria-hidden="true" />
          <div className="footer-social-icons">
            <a href="#" className="social-icon-btn" aria-label="Instagram">
              <Instagram size={15} />
            </a>
            <a href="#" className="social-icon-btn" aria-label="Facebook">
              <Facebook size={15} />
            </a>
            <a href={footer.socials[2]?.url || '#'} className="social-icon-btn" aria-label="WhatsApp">
              <MessageCircle size={15} />
            </a>
            <a href="#" className="social-icon-btn" aria-label="YouTube">
              <Youtube size={15} />
            </a>
          </div>
        </div>

        {/* Column 5: Legal */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <div className="footer-title-rule" aria-hidden="true" />
          <ul className="footer-links-list">
            {footer.legal.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="footer-icon-link">
                  <FileText size={15} className="link-icon" />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Full Width Dark Brown */}
      <div className="footer-bottom-bar">
        <div className="container bottom-bar-container">
          <span>{footer.bottomBar.copyright}</span>
          <span className="bottom-bar-sep">|</span>
          <span>{footer.bottomBar.fssai}</span>
          <span className="bottom-bar-sep">|</span>
          <a
            href={footer.bottomBar.agencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="agency-credit-link"
          >
            <span>{footer.bottomBar.agencyName}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
};
