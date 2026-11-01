import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import './LegalPage.css';

interface LegalPageProps {
  slug: 'privacy-policy' | 'terms-and-conditions';
}

export const LegalPage: React.FC<LegalPageProps> = ({ slug }) => {
  const [data, setData] = useState<{ title: string; content_html: string; updated_at?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/public/legal/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('[Legal] Falling back to bundled text:', err);
        // Bundled fallback
        if (slug === 'privacy-policy') {
          setData({
            title: 'Privacy Policy',
            content_html: `
              <h2>Privacy Policy</h2>
              <p><em>Last updated: November 2026</em></p>
              <p><strong>TODO: replace with reviewed legal text.</strong></p>
              <p>Amol Veg Resto ("we", "our", or "us") values your privacy. This policy outlines how information is handled when you browse our website, view our digital menu, or share reviews.</p>
              <h3>Information We Collect</h3>
              <p>We do not collect personal identifiers from website visitors unless voluntarily provided. When accessing our digital menu via QR codes, anonymous device and browser type may be logged for service analytics.</p>
              <h3>Third-Party Services</h3>
              <p>Our review system enables visitors to post ratings directly to Google Reviews. We do not store your private Google credentials or review contents on our servers.</p>
            `,
          });
        } else {
          setData({
            title: 'Terms and Conditions',
            content_html: `
              <h2>Terms and Conditions</h2>
              <p><em>Last updated: November 2026</em></p>
              <p><strong>TODO: replace with reviewed legal text.</strong></p>
              <p>Welcome to Amol Veg Resto. By accessing our website, viewing our digital menus, or dining with us, you agree to comply with and be bound by the following terms.</p>
              <h3>Menu Pricing and Availability</h3>
              <p>Dishes, prices, and special offers listed on our digital menus are subject to daily kitchen availability and seasonal ingredient changes. Taxes are applicable as per local regulations.</p>
              <h3>Restaurant Hygiene & Dining</h3>
              <p>We take pride in maintaining 100% pure vegetarian preparation standards. Please inform our service team in advance regarding any special dietary or Jain requirements.</p>
            `,
          });
        }
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="legal-page-root paper-bg">
      <div className="legal-container">
        <div className="legal-back-nav">
          <a href="#/" className="legal-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </a>
        </div>

        <article className="legal-card">
          <div className="legal-header">
            <div className="legal-icon-wrap">
              {slug === 'privacy-policy' ? <ShieldCheck size={28} /> : <FileText size={28} />}
            </div>
            <h1 className="legal-title">{data?.title || (slug === 'privacy-policy' ? 'Privacy Policy' : 'Terms and Conditions')}</h1>
            {data?.updated_at && (
              <p className="legal-date">Last Updated: {new Date(data.updated_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </div>

          <div className="legal-divider" />

          {loading ? (
            <div className="legal-loading">Loading legal documentation...</div>
          ) : (
            <div
              className="legal-content-body"
              dangerouslySetInnerHTML={{ __html: data?.content_html || '' }}
            />
          )}
        </article>
      </div>
    </div>
  );
};
