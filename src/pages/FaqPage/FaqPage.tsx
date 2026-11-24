import React, { useEffect } from 'react';
import { FAQ } from '../../components/FAQ/FAQ';
import { BotanicalLeaf } from '../../components/common/BotanicalLeaf';
import { Home, ChevronRight } from 'lucide-react';
import './FaqPage.css';

export const FaqPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const originalTitle = document.title;
    document.title = 'Frequently Asked Questions | Amol Veg Resto Solapur';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <div className="faq-page-wrapper">
      {/* Breadcrumb Navigation Bar */}
      <div className="faq-breadcrumb-bar">
        <div className="container">
          <nav aria-label="Breadcrumb" className="faq-breadcrumb-nav">
            <ol className="faq-breadcrumb-list">
              <li>
                <a href="#/" className="faq-breadcrumb-link">
                  <Home size={14} className="breadcrumb-icon" />
                  <span>Home</span>
                </a>
              </li>
              <li className="faq-breadcrumb-separator" aria-hidden="true">
                <ChevronRight size={13} />
              </li>
              <li aria-current="page" className="faq-breadcrumb-current">
                FAQ
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main FAQ Section Component */}
      <main className="faq-page-main">
        <FAQ />
      </main>

      {/* Decorative Botanical Leaf Accents */}
      <BotanicalLeaf position="bottom-right" width={220} opacity={0.8} />
    </div>
  );
};

export default FaqPage;
