import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi';
import { AdminLogin } from './AdminLogin';
import { AdminLayout, AdminSection } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminQRCodes } from './AdminQRCodes';
import { AdminMenus } from './AdminMenus';
import { AdminWebsite } from './AdminWebsite';
import { AdminReviews } from './AdminReviews';
import { AdminSettings } from './AdminSettings';
import './Admin.css';

export const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('owner@amolvegresto.in');
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  // Enforce mobile-responsive viewport for admin panel
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    const originalContent = meta ? meta.getAttribute('content') : '';

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');

    // Add robots noindex tag for admin
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (originalContent) {
        meta.setAttribute('content', originalContent);
      }
    };
  }, []);

  // Listen to hash changes for sub-navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/admin', '').replace('#admin', '');
      const parts = hash.split('/').filter(Boolean);
      const section = parts[0] as AdminSection;
      const validSections: AdminSection[] = ['dashboard', 'qrcodes', 'menus', 'website', 'reviews', 'settings'];
      if (validSections.includes(section)) {
        setActiveSection(section);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Check auth status on load
  const checkAuth = async () => {
    try {
      const res = await adminApi.get<{ authenticated: boolean; user?: { email: string } }>('/auth/me');
      if (res && res.authenticated) {
        setIsAuthenticated(true);
        if (res.user?.email) setUserEmail(res.user.email);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSelectSection = (section: AdminSection) => {
    setActiveSection(section);
    window.location.hash = `#/admin/${section}`;
  };

  const handleLogout = async () => {
    try {
      await adminApi.post('/auth/logout', {});
    } catch {
      // Ignore
    }
    adminApi.clearToken();
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#6B5545', fontWeight: 600 }}>Verifying admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={(email) => {
          setIsAuthenticated(true);
          setUserEmail(email);
          checkAuth();
        }}
      />
    );
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      onLogout={handleLogout}
      userEmail={userEmail}
    >
      {activeSection === 'dashboard' && <AdminDashboard onNavigate={(sec) => handleSelectSection(sec as AdminSection)} />}
      {activeSection === 'qrcodes' && <AdminQRCodes />}
      {activeSection === 'menus' && <AdminMenus />}
      {activeSection === 'website' && <AdminWebsite />}
      {activeSection === 'reviews' && <AdminReviews />}
      {activeSection === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
};
