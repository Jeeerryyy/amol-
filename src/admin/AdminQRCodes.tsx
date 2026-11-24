import React, { useState, useEffect } from 'react';
import { adminFetch } from './adminApi';
import {
  Download,
  Check,
  Copy,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  BarChart2,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';

interface QRCodeItem {
  id: string;
  slug?: string;
  label: string;
  destination: string;
  is_enabled: number | boolean;
  scanCount?: number;
  created_at?: string;
  updated_at?: string;
}

export const AdminQRCodes: React.FC = () => {
  const [qrs, setQrs] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    label: string;
    slug: string;
    destination: string;
    is_enabled: boolean;
  }>({
    label: '',
    slug: '',
    destination: '',
    is_enabled: true,
  });

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<{
    label: string;
    slug: string;
    destination: string;
    is_enabled: boolean;
  }>({
    label: '',
    slug: '',
    destination: '/menu/',
    is_enabled: true,
  });

  const [saveSuccess, setSaveSuccess] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadQrs = () => {
    setLoading(true);
    adminFetch('/api/admin/qr-codes')
      .then((data: QRCodeItem[]) => {
        setQrs(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setErrorMessage(err.message || 'Failed to load QR codes');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQrs();
  }, []);

  const handleEditClick = (qr: QRCodeItem) => {
    setEditingId(qr.id);
    setEditForm({
      label: qr.label,
      slug: qr.slug || qr.id,
      destination: qr.destination,
      is_enabled: Boolean(qr.is_enabled),
    });
  };

  const handleToggleStatus = async (qr: QRCodeItem) => {
    try {
      const nextStatus = !qr.is_enabled;
      await adminFetch(`/api/admin/qr-codes/${qr.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          label: qr.label,
          slug: qr.slug || qr.id,
          destination: qr.destination,
          is_enabled: nextStatus,
        }),
      });
      setSaveSuccess(`${qr.label} is now ${nextStatus ? 'Active' : 'Paused'}.`);
      setTimeout(() => setSaveSuccess(''), 3000);
      loadQrs();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleSave = async (id: string) => {
    try {
      setErrorMessage('');
      await adminFetch(`/api/admin/qr-codes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setSaveSuccess(`Updated "${editForm.label}" successfully.`);
      setTimeout(() => setSaveSuccess(''), 3000);
      setEditingId(null);
      loadQrs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update QR Code');
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      if (!createForm.label.trim()) {
        setErrorMessage('Please enter a descriptive label.');
        return;
      }
      await adminFetch('/api/admin/qr-codes', {
        method: 'POST',
        body: JSON.stringify(createForm),
      });
      setSaveSuccess(`Created new dynamic QR "${createForm.label}" successfully.`);
      setTimeout(() => setSaveSuccess(''), 3000);
      setIsCreating(false);
      setCreateForm({
        label: '',
        slug: '',
        destination: '/menu/',
        is_enabled: true,
      });
      loadQrs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create QR Code');
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Are you sure you want to delete "${label}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminFetch(`/api/admin/qr-codes/${id}`, {
        method: 'DELETE',
      });
      setSaveSuccess(`Deleted "${label}".`);
      setTimeout(() => setSaveSuccess(''), 3000);
      loadQrs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete QR code');
    }
  };

  const handleDownload = (id: string, format: 'png' | 'svg' | 'pdf') => {
    window.open(`/api/admin/qr-codes/${id}/download?format=${format}`, '_blank');
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSaveSuccess('Copied link: ' + url);
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const siteUrl = window.location.origin;

  const destinationPresets = [
    { label: 'Main Menu', value: '/menu/' },
    { label: 'Special Menu', value: '/special-menu/' },
    { label: 'Review Page', value: '/review' },
    { label: 'Homepage', value: '/' },
  ];

  if (loading && qrs.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--admin-text-dim)' }}>
        <RefreshCw size={24} className="spin-icon" style={{ marginBottom: '12px' }} />
        <div>Loading dynamic QR codes...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dynamic QR Codes</h1>
          <p className="admin-page-subtitle">
            All QR codes encode permanent short redirect URLs (/qr/:slug). Edit destinations anytime without re-printing table stands.
          </p>
        </div>
        <div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setIsCreating(!isCreating)}
          >
            <Plus size={16} />
            <span>{isCreating ? 'Close New QR Form' : 'Add New Dynamic QR'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--admin-success-soft)',
            color: 'var(--admin-success)',
            borderRadius: 'var(--admin-radius-md)',
            marginBottom: '20px',
            fontWeight: 650,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={18} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--admin-danger-soft, #FEE2E2)',
            color: 'var(--admin-danger, #DC2626)',
            borderRadius: 'var(--admin-radius-md)',
            marginBottom: '20px',
            fontWeight: 650,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Create New QR Code Modal / Drawer */}
      {isCreating && (
        <div className="admin-card" style={{ padding: '24px', marginBottom: '28px', border: '1.5px solid var(--admin-accent)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--admin-text-main)' }}>
            Create New Dynamic QR Code
          </h2>
          <form onSubmit={handleCreateNew}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Stand Label *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={createForm.label}
                  onChange={(e) => setCreateForm({ ...createForm, label: e.target.value })}
                  placeholder="e.g. VIP Lounge Stand, Counter Stand"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Permanent Slug * (/qr/:slug)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  placeholder="e.g. vip-lounge (letters, numbers, dashes)"
                />
                <div className="admin-hint">This permanent URL is printed on the physical stand.</div>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Destination Link (Editable Anytime)</label>
              <input
                type="text"
                className="admin-input"
                value={createForm.destination}
                onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                placeholder="/menu/, /review, or https://..."
                required
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--admin-text-dim)', alignSelf: 'center' }}>Quick Presets:</span>
                {destinationPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className="admin-badge admin-badge-neutral"
                    style={{ cursor: 'pointer', border: '1px solid var(--admin-border)' }}
                    onClick={() => setCreateForm({ ...createForm, destination: preset.value })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={createForm.is_enabled}
                  onChange={(e) => setCreateForm({ ...createForm, is_enabled: e.target.checked })}
                />
                <span>Active immediately upon creation</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
              >
                Create Dynamic QR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic QRs Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '24px',
        }}
      >
        {qrs.map((qr) => {
          const isEditing = editingId === qr.id;
          const slug = qr.slug || qr.id;
          const encodedScanUrl = `${siteUrl}/qr/${slug}`;
          const isCore = ['menu', 'special', 'review'].includes(qr.id);

          return (
            <div key={qr.id} className="admin-card" style={{ padding: '26px' }}>
              {/* Header with Title and Status Switch */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="admin-badge admin-badge-neutral" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                      Slug: /qr/{slug}
                    </span>
                    {isCore && (
                      <span className="admin-badge" style={{ backgroundColor: 'var(--admin-surface-subtle)', color: 'var(--admin-text-dim)', fontSize: '11px' }}>
                        Core QR
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '19px', fontWeight: 750, margin: '2px 0 0 0', color: 'var(--admin-text-main)' }}>
                    {qr.label}
                  </h2>
                </div>

                {/* 1-Click Active / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(qr)}
                  className={`admin-badge ${qr.is_enabled ? 'admin-badge-success' : 'admin-badge-danger'}`}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                  title="Click to toggle Active / Paused status"
                >
                  {qr.is_enabled ? (
                    <>
                      <Play size={11} fill="currentColor" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <Pause size={11} fill="currentColor" />
                      <span>Paused</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Preview & Details Box */}
              <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap' }}>
                {/* Visual QR Image Preview */}
                <div
                  style={{
                    width: '135px',
                    height: '135px',
                    backgroundColor: 'var(--admin-surface-subtle)',
                    border: '1.5px solid var(--admin-border)',
                    borderRadius: '12px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={`/api/admin/qr-codes/${qr.id}/download?format=png`}
                    alt={qr.label}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--admin-text-dim)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Permanent Stand URL:
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 650,
                      color: 'var(--admin-accent)',
                      wordBreak: 'break-all',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => copyUrl(encodedScanUrl)}
                    title="Click to copy permanent link"
                  >
                    <span>{encodedScanUrl}</span>
                    <Copy size={13} />
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--admin-text-dim)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Current Destination:
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 650,
                      color: 'var(--admin-text-main)',
                      marginBottom: '10px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {qr.destination || <em style={{ color: 'var(--admin-danger)' }}>Not set (shows fallback page)</em>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                    <BarChart2 size={15} color="var(--admin-accent)" />
                    <span>Total Scans Logged:</span>
                    <strong style={{ color: 'var(--admin-text-main)', fontSize: '14px' }}>{qr.scanCount || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Edit Mode vs Action Buttons */}
              {isEditing ? (
                <div style={{ background: 'var(--admin-surface-subtle)', padding: '16px', borderRadius: 'var(--admin-radius-md)', marginBottom: '18px' }}>
                  <div className="admin-form-group">
                    <label className="admin-label">Label</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      placeholder="Enter label"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Slug (/qr/:slug)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      placeholder="Slug e.g. review, menu, special"
                    />
                    <div className="admin-hint">Unique short slug printed on the stand.</div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Redirect Destination (URL or Path)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.destination}
                      onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                      placeholder="e.g. /menu/, /review, or https://..."
                    />
                    {/* Quick Preset Buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--admin-text-dim)', alignSelf: 'center' }}>Presets:</span>
                      {destinationPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          className="admin-badge admin-badge-neutral"
                          style={{ cursor: 'pointer', fontSize: '11px' }}
                          onClick={() => setEditForm({ ...editForm, destination: preset.value })}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={editForm.is_enabled}
                        onChange={(e) => setEditForm({ ...editForm, is_enabled: e.target.checked })}
                      />
                      <span>Active (Uncheck to pause and show fallback page)</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={() => handleSave(qr.id)}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => handleEditClick(qr)}
                    style={{ flex: 1 }}
                  >
                    <Edit3 size={14} />
                    <span>Edit Destination & Slug</span>
                  </button>

                  <a
                    href={`/qr/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    title="Test redirect in new tab"
                  >
                    <ExternalLink size={14} />
                    <span>Test</span>
                  </a>

                  {!isCore && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ color: 'var(--admin-danger)' }}
                      onClick={() => handleDelete(qr.id, qr.label)}
                      title="Delete custom QR"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Downloadable Print-Ready Formats */}
              <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Download Print Assets
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => handleDownload(qr.id, 'png')}
                    title="1024px High-Resolution PNG"
                  >
                    <Download size={13} />
                    <span>PNG</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => handleDownload(qr.id, 'svg')}
                    title="Scalable Vector SVG for Print"
                  >
                    <Download size={13} />
                    <span>SVG</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => handleDownload(qr.id, 'pdf')}
                    title="Print-Ready A5 Table Tent Stand PDF"
                  >
                    <Download size={13} />
                    <span>A5 PDF</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
