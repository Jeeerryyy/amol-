import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import { PopularDishes } from './components/PopularDishes/PopularDishes';
import { AboutSection } from './components/About/AboutSection';
import { GallerySection } from './components/Gallery/GallerySection';
import { TestimonialsSection } from './components/Testimonials/TestimonialsSection';
import { FAQ } from './components/FAQ/FAQ';
import { Footer } from './components/Footer/Footer';
import { AboutPage } from './pages/AboutPage/AboutPage';
import { ContactPage } from './pages/ContactPage/ContactPage';
import { GalleryPage } from './pages/GalleryPage/GalleryPage';
import { ReviewPage } from './pages/ReviewPage/ReviewPage';
import { LegalPage } from './pages/LegalPage/LegalPage';
import { AdminApp } from './admin/AdminApp';
import './styles/tokens.css';

export const App: React.FC = () => {
  const [currentHash, setCurrentHash] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname;
  });

  useEffect(() => {
    if (window.location.hash === '#/menu' || window.location.hash === '#menu') {
      window.location.href = '/menu/';
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      if (hash === '#/menu' || hash === '#menu') {
        window.location.href = '/menu/';
        return;
      }
      setCurrentHash(hash);
      setCurrentPath(window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 1. Admin Panel Routing (/admin or #/admin)
  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath.startsWith('/admin/') ||
    currentHash.startsWith('#/admin') ||
    currentHash.startsWith('#admin');

  if (isAdminRoute) {
    return <AdminApp />;
  }

  // 2. Review Page Routing (/review or #/review)
  const isReviewPage =
    currentHash === '#/review' ||
    currentHash === '#review' ||
    currentPath === '/review' ||
    currentPath.startsWith('/review/');

  if (isReviewPage) {
    return <ReviewPage />;
  }

  // 3. Legal Documentation Pages (Privacy Policy & Terms)
  const isPrivacyPolicy =
    currentHash === '#/privacy-policy' ||
    currentHash === '#privacy' ||
    currentHash === '#/privacy' ||
    currentPath === '/privacy-policy';

  if (isPrivacyPolicy) {
    return <LegalPage slug="privacy-policy" />;
  }

  const isTermsAndConditions =
    currentHash === '#/terms-and-conditions' ||
    currentHash === '#terms' ||
    currentHash === '#/terms' ||
    currentPath === '/terms-and-conditions';

  if (isTermsAndConditions) {
    return <LegalPage slug="terms-and-conditions" />;
  }

  // 4. Public Navigation & Main Pages
  const isAboutPage = currentHash === '#/about' || currentHash === '#about-page' || currentPath === '/about' || currentPath === '/about/';
  const isContactPage = currentHash === '#/contact' || currentHash === '#contact-page' || currentPath === '/contact' || currentPath === '/contact/';
  const isGalleryPage = currentHash === '#/gallery' || currentHash === '#gallery' || currentHash === '#gallery-page' || currentPath === '/gallery' || currentPath === '/gallery/';

  let activePage: 'home' | 'about' | 'contact' | 'gallery' = 'home';
  if (isAboutPage) activePage = 'about';
  else if (isContactPage) activePage = 'contact';
  else if (isGalleryPage) activePage = 'gallery';

  return (
    <div className="landing-page-root paper-bg">
      {/* 1. Sticky Navigation Bar */}
      <Navbar activePage={activePage} />

      <main>
        {isAboutPage ? (
          /* About Sub-page */
          <AboutPage />
        ) : isContactPage ? (
          /* Contact Sub-page */
          <ContactPage />
        ) : isGalleryPage ? (
          /* Gallery Sub-page */
          <GalleryPage />
        ) : (
          <>
            {/* 2. Hero Section */}
            <Hero />

            {/* 3. Our Popular Dishes Section */}
            <PopularDishes />

            {/* 4. About / Our Story Section */}
            <AboutSection />

            {/* 5. Gallery Preview Section */}
            <GallerySection />

            {/* 6. What Our Guests Say Section */}
            <TestimonialsSection />

            {/* 7. Frequently Asked Questions (GEO/AEO Accordion) */}
            <FAQ />
          </>
        )}
      </main>

      {/* 7. Footer & Bottom Bar */}
      <Footer />
    </div>
  );
};

export default App;
