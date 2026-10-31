import React from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import { PopularDishes } from './components/PopularDishes/PopularDishes';
import { AboutSection } from './components/About/AboutSection';
import { GallerySection } from './components/Gallery/GallerySection';
import { TestimonialsSection } from './components/Testimonials/TestimonialsSection';
import { Footer } from './components/Footer/Footer';
import './styles/tokens.css';

export const App: React.FC = () => {
  return (
    <div className="landing-page-root paper-bg">
      {/* 1. Sticky Navigation Bar */}
      <Navbar />

      <main>
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
      </main>

      {/* 7. Footer & Bottom Bar */}
      <Footer />
    </div>
  );
};

export default App;
