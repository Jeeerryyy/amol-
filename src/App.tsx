import React, { useState, useEffect, Suspense } from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import { PopularDishes } from './components/PopularDishes/PopularDishes';
import { AboutSection } from './components/About/AboutSection';
import { GallerySection } from './components/Gallery/GallerySection';
import { TestimonialsSection } from './components/Testimonials/TestimonialsSection';
import { FAQ } from './components/FAQ/FAQ';
import { Footer } from './components/Footer/Footer';
import './styles/tokens.css';

// Code-split subpages and admin app with React.lazy for optimized bundle size & faster LCP
const AdminApp = React.lazy(() => import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })));
const ReviewPage = React.lazy(() => import('./pages/ReviewPage/ReviewPage').then((m) => ({ default: m.ReviewPage })));
const LegalPage = React.lazy(() => import('./pages/LegalPage/LegalPage').then((m) => ({ default: m.LegalPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage/ContactPage').then((m) => ({ default: m.ContactPage })));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage/GalleryPage').then((m) => ({ default: m.GalleryPage })));

const FallbackLoader: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => (
  <div
    style={{
      minHeight: fullScreen ? '100vh' : '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAF4EC',
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        border: '3px solid #E8DACB',
        borderTopColor: '#C85A17',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

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
    return (
      <Suspense fallback={<FallbackLoader fullScreen />}>
        <AdminApp />
      </Suspense>
    );
  }

  // 2. Review Page Routing (/review or #/review)
  const isReviewPage =
    currentHash === '#/review' ||
    currentHash === '#review' ||
    currentPath === '/review' ||
    currentPath.startsWith('/review/');

  if (isReviewPage) {
    return (
      <Suspense fallback={<FallbackLoader fullScreen />}>
        <ReviewPage />
      </Suspense>
    );
  }

  // 3. Legal Documentation Pages (Privacy Policy & Terms)
  const isPrivacyPolicy =
    currentHash === '#/privacy-policy' ||
    currentHash === '#privacy' ||
    currentHash === '#/privacy' ||
    currentPath === '/privacy-policy';

  if (isPrivacyPolicy) {
    return (
      <Suspense fallback={<FallbackLoader fullScreen />}>
        <LegalPage slug="privacy-policy" />
      </Suspense>
    );
  }

  const isTermsAndConditions =
    currentHash === '#/terms-and-conditions' ||
    currentHash === '#terms' ||
    currentHash === '#/terms' ||
    currentPath === '/terms-and-conditions';

  if (isTermsAndConditions) {
    return (
      <Suspense fallback={<FallbackLoader fullScreen />}>
        <LegalPage slug="terms-and-conditions" />
      </Suspense>
    );
  }

  // 4. Public Navigation & Main Pages
  const isAboutPage =
    currentHash === '#/about' || currentHash === '#about-page' || currentPath === '/about' || currentPath === '/about/';
  const isContactPage =
    currentHash === '#/contact' || currentHash === '#contact-page' || currentPath === '/contact' || currentPath === '/contact/';
  const isGalleryPage =
    currentHash === '#/gallery' || currentHash === '#gallery' || currentHash === '#gallery-page' || currentPath === '/gallery' || currentPath === '/gallery/';

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
          <Suspense fallback={<FallbackLoader />}>
            <AboutPage />
          </Suspense>
        ) : isContactPage ? (
          <Suspense fallback={<FallbackLoader />}>
            <ContactPage />
          </Suspense>
        ) : isGalleryPage ? (
          <Suspense fallback={<FallbackLoader />}>
            <GalleryPage />
          </Suspense>
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
