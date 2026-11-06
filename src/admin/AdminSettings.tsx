import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi';

interface PricingSettings {
  special_markup_percent: number;
  rounding_step: number;
}

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'account' | 'pricing' | 'export'>('account');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Account State
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountSaving, setAccountSaving] = useState(false);

  // Pricing State
  const [pricing, setPricing] = useState<PricingSettings>({
    special_markup_percent: 10,
    rounding_step: 1,
  });
  const [pricingSaving, setPricingSaving] = useState(false);

  // Export State
  const [scanFromDate, setScanFromDate] = useState('');
  const [scanToDate, setScanToDate] = useState('');
  const [reviewFromDate, setReviewFromDate] = useState('');
  const [reviewToDate, setReviewToDate] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadSettings = async () => {
    try {
      const [userRes, priceRes] = await Promise.all([
        adminApi.get<{ email: string }>('/auth/me'),
        adminApi.get<PricingSettings>('/settings'),
      ]);
      if (userRes?.email) setEmail(userRes.email);
      if (priceRes) setPricing(priceRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load settings', 'error');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Update Account
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Current password is required to verify changes', 'error');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setAccountSaving(true);
    try {
      await adminApi.put('/auth/credentials', {
        email,
        current_password: currentPassword,
        new_password: newPassword || undefined,
      });
      showToast('Account credentials updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update credentials', 'error');
    } finally {
      setAccountSaving(false);
    }
  };

  // Update Pricing
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSaving(true);
    try {
      const res = await adminApi.put<{ success: boolean; message: string }>('/settings', pricing);
      showToast(res.message || 'Pricing settings updated and dishes recalculated');
    } catch (err: any) {
      showToast(err.message || 'Failed to update pricing settings', 'error');
    } finally {
      setPricingSaving(false);
    }
  };

  // Download CSV / JSON helpers
  const handleDownloadFile = (endpoint: string) => {
    const url = `/api/admin${endpoint}`;
    window.open(url, '_blank');
  };

  return (
    <div className="admin-page-container">
      {notification && (
        <div className={`admin-toast admin-toast-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Settings & Configuration</h1>
          <p className="admin-page-subtitle">
            Manage owner login credentials, special menu markup & rounding rules, and backup data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`admin-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account & Security
        </button>
        <button
          className={`admin-tab ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing & Markup Rules
        </button>
        <button
          className={`admin-tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Data Export & Backups
        </button>
      </div>

      {/* =====================================================================
          TAB 1: ACCOUNT & SECURITY
          ===================================================================== */}
      {activeTab === 'account' && (
        <div style={{ maxWidth: '580px' }}>
          <form onSubmit={handleSaveAccount} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: 'var(--admin-text-heading)' }}>Owner Credentials</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
              Change your owner email or password. Password changes require confirming your current password.
            </p>

            <div>
              <label className="admin-form-label">Owner Email *</label>
              <input
                type="email"
                className="admin-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="admin-form-label">Current Password * <span style={{ color: '#d9534f' }}>(Required to save changes)</span></label>
              <input
                type="password"
                className="admin-form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border-subtle)', margin: '8px 0' }} />

            <div>
              <label className="admin-form-label">New Password (leave blank to keep current)</label>
              <input
                type="password"
                className="admin-form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div>
              <label className="admin-form-label">Confirm New Password</label>
              <input
                type="password"
                className="admin-form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={accountSaving}
              >
                {accountSaving ? 'Updating...' : 'Save Account Changes'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '20px', padding: '14px', background: 'var(--admin-surface-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-sm)', fontSize: '13px', color: 'var(--admin-text-secondary)', boxShadow: 'var(--admin-shadow-sm)' }}>
            <strong>💡 CLI Emergency Reset:</strong> If you are locked out or forget your password, you can run from the server terminal:
            <pre style={{ margin: '6px 0 0', padding: '8px', background: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)', borderRadius: '4px', overflowX: 'auto' }}>
              node scripts/reset-password.js newPasswordHere
            </pre>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PRICING & MARKUP RULES
          ===================================================================== */}
      {activeTab === 'pricing' && (
        <div style={{ maxWidth: '640px' }}>
          <form onSubmit={handleSavePricing} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: 'var(--admin-text-heading)' }}>Special Menu Auto-Pricing Engine</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
              Dishes marked for "Both menus" automatically calculate their Special Menu price based on the base price plus this markup percentage, rounded to the selected step. Dishes with a manual override will never be modified.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Global Markup (%) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className="admin-form-input"
                    value={pricing.special_markup_percent}
                    onChange={(e) => setPricing({ ...pricing, special_markup_percent: Number(e.target.value) })}
                    placeholder="Enter the amount"
                    required
                  />
                  <span style={{ fontWeight: 'bold', color: 'var(--admin-primary-action)' }}>%</span>
                </div>
                <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                  Default is 10% markup applied to base pricing.
                </span>
              </div>

              <div>
                <label className="admin-form-label">Rounding Step *</label>
                <select
                  className="admin-form-input"
                  value={pricing.rounding_step}
                  onChange={(e) => setPricing({ ...pricing, rounding_step: Number(e.target.value) })}
                >
                  <option value={1}>₹1 (Exact rupee)</option>
                  <option value={5}>₹5 (Nearest ₹5)</option>
                  <option value={10}>₹10 (Nearest ₹10)</option>
                </select>
                <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                  Applied after calculating the percentage markup.
                </span>
              </div>
            </div>

            {/* Live Calculation Preview Box */}
            <div style={{ padding: '16px', background: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-sm)' }}>
              <strong style={{ fontSize: '13px', color: 'var(--admin-text-main)' }}>Formula Live Demonstration:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px', textAlign: 'center' }}>
                {[100, 110, 120, 150].map((base) => {
                  const marked = base * (1 + pricing.special_markup_percent / 100);
                  const step = pricing.rounding_step || 1;
                  const special = Math.round(marked / step) * step;
                  return (
                    <div key={base} style={{ background: 'var(--admin-surface-card)', padding: '10px', borderRadius: 'var(--admin-radius-sm)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-sm)' }}>
                      <div style={{ fontSize: '12px', color: '#888' }}>Base ₹{base}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--admin-primary-action)', marginTop: '2px' }}>
                        ₹{special}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={pricingSaving}
              >
                {pricingSaving ? 'Calculating...' : 'Save & Recalculate Special Prices'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB 3: DATA EXPORT & BACKUPS
          ===================================================================== */}
      {activeTab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
          {/* Card 1: Content Backup */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: 'var(--admin-text-heading)' }}>Full Website & Menu Backup (JSON)</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
              Export all restaurant dishes, categories, gallery items, popular dishes, contact info, review options, and SEO metadata in a single structured JSON file.
            </p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => handleDownloadFile('/export/content')}
            >
              📥 Download Full Content JSON
            </button>
          </div>

          {/* Card 2: QR Scan Analytics CSV */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: 'var(--admin-text-heading)' }}>QR Scan Logs (CSV)</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
              Export raw scan activity logs (QR type, device, operating system, browser, and IST timestamp) formatted for Excel or Google Sheets.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label className="admin-form-label">From Date</label>
                <input
                  type="date"
                  className="admin-form-input"
                  value={scanFromDate}
                  onChange={(e) => setScanFromDate(e.target.value)}
                  aria-label="Select a date"
                />
              </div>
              <div>
                <label className="admin-form-label">To Date</label>
                <input
                  type="date"
                  className="admin-form-input"
                  value={scanToDate}
                  onChange={(e) => setScanToDate(e.target.value)}
                  aria-label="Select a date"
                />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  className="admin-btn admin-btn-outline"
                  onClick={() => {
                    const query = new URLSearchParams();
                    if (scanFromDate) query.append('from', scanFromDate);
                    if (scanToDate) query.append('to', scanToDate);
                    handleDownloadFile(`/export/scans?${query.toString()}`);
                  }}
                >
                  📊 Download Scans CSV
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Review Events CSV */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: 'var(--admin-text-heading)' }}>Review Activity Logs (CSV)</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
              Export customer review interactions (started vs submitted, selected star ratings, and chosen highlight tags).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <label className="admin-form-label">From Date</label>
                <input
                  type="date"
                  className="admin-form-input"
                  value={reviewFromDate}
                  onChange={(e) => setReviewFromDate(e.target.value)}
                  aria-label="Select a date"
                />
              </div>
              <div>
                <label className="admin-form-label">To Date</label>
                <input
                  type="date"
                  className="admin-form-input"
                  value={reviewToDate}
                  onChange={(e) => setReviewToDate(e.target.value)}
                  aria-label="Select a date"
                />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  className="admin-btn admin-btn-outline"
                  onClick={() => {
                    const query = new URLSearchParams();
                    if (reviewFromDate) query.append('from', reviewFromDate);
                    if (reviewToDate) query.append('to', reviewToDate);
                    handleDownloadFile(`/export/reviews?${query.toString()}`);
                  }}
                >
                  ⭐ Download Reviews CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
