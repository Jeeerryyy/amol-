import React from 'react';

export type AdminSection = 'dashboard' | 'qrcodes' | 'menus' | 'website' | 'reviews' | 'settings';

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
  const navItems: Array<{ id: AdminSection; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'qrcodes', label: 'QR Codes', icon: '📱' },
    { id: 'menus', label: 'Menus', icon: '🍽️' },
    { id: 'website', label: 'Website', icon: '🌐' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="admin-root">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#C85A17',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            A
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="admin-header-title">Amol Veg Restaurant</span>
              <span className="admin-header-badge">Admin</span>
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>{userEmail}</div>
          </div>
        </div>

        <div className="admin-header-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              minHeight: '38px',
            }}
          >
            <span>View Public Site</span>
            <span>↗</span>
          </a>

          <button
            onClick={onLogout}
            className="admin-btn admin-btn-outline"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              color: '#C62828',
              borderColor: '#E8DACB',
              minHeight: '38px',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Body Layout: Sidebar + Viewport */}
      <div className="admin-body-layout">
        {/* Desktop Sidebar */}
        <aside className="admin-sidebar">
          <nav>
            <ul className="admin-nav-list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => onSelectSection(item.id)}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #E8DACB', fontSize: '12px', color: '#9C8575' }}>
            <div>Amol Pure Veg Admin</div>
            <div>Timezone: Asia/Kolkata (IST)</div>
            <div>Currency: INR (₹)</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-viewport">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on < 860px) */}
      <nav className="admin-mobile-nav" aria-label="Mobile Navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`admin-mobile-nav-btn ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSelectSection(item.id)}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
