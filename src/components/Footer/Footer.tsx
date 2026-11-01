import React, { useState, useEffect } from 'react';
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
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const { brand, footer } = siteConfig;
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/public/site')
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((data) => {
        if (data && data.content) {
          setSiteData(data.content);
        }
      })
      .catch((err) => {
        console.warn('[Footer] Using default footer settings:', err);
      });
  }, []);

  const contact = siteData?.contact || {};
  const footerContent = siteData?.footer || {};

  const address = contact.address || footer.visitUs.address;
  const hours = footerContent.opening_hours || footer.visitUs.hours;
  const phone = contact.phone || footer.visitUs.phone;
  const telHref = contact.phone ? `tel:${contact.phone.replace(/\s+/g, '')}` : footer.visitUs.tel;
  const mapsHref = contact.maps_url || footer.visitUs.directionsUrl;

  const instagramHref = contact.instagram || '#';
  const facebookHref = contact.facebook || '#';
  const whatsappHref = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`
    : footer.socials[2]?.url || '#';

  const copyright = footerContent.copyright_text || footer.bottomBar.copyright;
  const fssaiText = footerContent.fssai_license
    ? `FSSAI Lic. No: ${footerContent.fssai_license}`
    : footer.bottomBar.fssai;

  return (
    <footer className="site-footer" id="site-footer">
      {/* Full Footer Scenery Background Layer */}
      <div className="footer-scenery-background" aria-hidden="true">
        <img
          src={footer.illustrationSrc}
          alt={footer.illustrationAlt || ''}
          className="footer-scenery-image"
          loading="lazy"
        />
        <div className="footer-bg-overlay" />
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
          <h3 className="footer-brand-title">{brand.name}</h3>
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
              <a href="#/" className="footer-icon-link">
                <Home size={15} className="link-icon" />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a href="/menu/" className="footer-icon-link">
                <UtensilsCrossed size={15} className="link-icon" />
                <span>Menu</span>
              </a>
            </li>
            <li>
              <a href="#/about" className="footer-icon-link">
                <User size={15} className="link-icon" />
                <span>About</span>
              </a>
            </li>
            <li>
              <a href="#/gallery" className="footer-icon-link">
                <ImageIcon size={15} className="link-icon" />
                <span>Gallery</span>
              </a>
            </li>
            <li>
              <a href="#/contact" className="footer-icon-link">
                <Phone size={15} className="link-icon" />
                <span>Contact</span>
              </a>
            </li>
            <li>
              <a
                href="#/review"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon-link"
              >
                <Star size={15} className="link-icon" />
                <span>Review Us</span>
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
              <span className="visit-address">{address}</span>
            </div>
            <div className="visit-info-row">
              <Clock size={16} className="visit-icon" />
              <span>{hours}</span>
            </div>
            <div className="visit-info-row">
              <Phone size={16} className="visit-icon" />
              <a href={telHref} className="visit-phone-link">
                {phone}
              </a>
            </div>
            <a
              href={mapsHref}
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
          <ul className="footer-links-list footer-social-vertical">
            <li>
              <a href={instagramHref} className="footer-social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <span className="social-icon-btn"><Instagram size={14} /></span>
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a href={facebookHref} className="footer-social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <span className="social-icon-btn"><Facebook size={14} /></span>
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a href={whatsappHref} className="footer-social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <span className="social-icon-btn"><MessageCircle size={14} /></span>
                <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a href="#" className="footer-social-link" aria-label="YouTube">
                <span className="social-icon-btn"><Youtube size={14} /></span>
                <span>YouTube</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 5: Legal */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <div className="footer-title-rule" aria-hidden="true" />
          <ul className="footer-links-list">
            <li>
              <a href="#/privacy-policy" className="footer-icon-link">
                <FileText size={15} className="link-icon" />
                <span>Privacy Policy</span>
              </a>
            </li>
            <li>
              <a href="#/terms-and-conditions" className="footer-icon-link">
                <FileText size={15} className="link-icon" />
                <span>Terms & Conditions</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Full Width Dark Brown */}
      <div className="footer-bottom-bar">
        <div className="container bottom-bar-container">
          <span>{copyright}</span>
          <span className="bottom-bar-sep">|</span>
          <span>{fssaiText}</span>
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
