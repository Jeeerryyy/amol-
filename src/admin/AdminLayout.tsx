import React from 'react';
import {
  LayoutDashboard,
  QrCode,
  UtensilsCrossed,
  Image as ImageIcon,
  Globe,
  Star,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';

export type AdminSection = 'dashboard' | 'qrcodes' | 'menus' | 'gallery' | 'website' | 'reviews' | 'settings';

interface AdminLayoutProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onLogout: () => void;
  userEmail: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeSection,
  onSelectSection,
  onLogout,
  userEmail,
  children,
}) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'qrcodes' as const, label: 'QR Codes', icon: QrCode },
    { id: 'menus' as const, label: 'Menus', icon: UtensilsCrossed },
    { id: 'gallery' as const, label: 'Gallery', icon: ImageIcon },
    { id: 'website' as const, label: 'Website', icon: Globe },
    { id: 'reviews' as const, label: 'Reviews', icon: Star },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-root">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <img
            src="/logo.png"
            alt="Amol Veg Resto"
            className="admin-header-logo"
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="admin-header-title">Amol Veg Restaurant</span>
              <span className="admin-header-badge">Admin</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginTop: '1px' }}>
              {userEmail}
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline"
            style={{
              fontSize: '13px',
              gap: '6px',
              textDecoration: 'none',
              height: '36px',
            }}
          >
            <span className="admin-header-btn-text">View Public Site</span>
            <ExternalLink size={14} />
          </a>

          <button
            onClick={onLogout}
            className="admin-btn admin-btn-outline"
            style={{
              fontSize: '13px',
              color: 'var(--admin-text-secondary)',
              gap: '6px',
              height: '36px',
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Body Layout: Sidebar + Viewport */}
      <div className="admin-body-layout">
        {/* Desktop Sidebar */}
        <aside className="admin-sidebar">
          <nav>
            <ul className="admin-nav-list">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`admin-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => onSelectSection(item.id)}
                    >
                      <IconComponent size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '20px',
              borderTop: '1px solid var(--admin-border)',
              fontSize: '12px',
              color: 'var(--admin-text-tertiary)',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 500, color: 'var(--admin-text-secondary)' }}>Amol Veg Resto</div>
            <div>Timezone: Asia/Kolkata (IST)</div>
            <div>Currency: INR (₹)</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-viewport">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on < 860px) */}
      <nav className="admin-mobile-nav" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              className={`admin-mobile-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSection(item.id)}
            >
              <IconComponent size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;
