import React, { useState, useEffect } from 'react';
import { adminFetch } from './adminApi';
import { Download, Check, Copy, Edit3 } from 'lucide-react';

export const AdminQRCodes: React.FC = () => {
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; destination: string; is_enabled: boolean }>({
    label: '',
    destination: '',
    is_enabled: true,
  });
  const [saveSuccess, setSaveSuccess] = useState<string>('');

  const loadQrs = () => {
    setLoading(true);
    adminFetch('/api/admin/qr-codes')
      .then((data) => {
        setQrs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQrs();
  }, []);

  const handleEditClick = (qr: any) => {
    setEditingId(qr.id);
    setEditForm({
      label: qr.label,
      destination: qr.destination,
      is_enabled: Boolean(qr.is_enabled),
    });
  };

  const handleSave = async (id: string) => {
    try {
      await adminFetch(`/api/admin/qr-codes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      setSaveSuccess(`Updated ${editForm.label} successfully.`);
      setTimeout(() => setSaveSuccess(''), 3000);
      setEditingId(null);
      loadQrs();
    } catch (err: any) {
      alert(err.message || 'Failed to update QR Code');
    }
  };

  const handleDownload = (id: string, format: 'png' | 'svg' | 'pdf') => {
    window.open(`/api/admin/qr-codes/${id}/download?format=${format}`, '_blank');
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Copied link to clipboard: ' + url);
  };

  const siteUrl = window.location.origin;

  if (loading && qrs.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading QR codes...</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title admin-heading-serif">Dynamic QR Codes</h1>
          <p className="admin-page-subtitle">
            Update menu destinations anytime without re-printing table tents. Download print-ready A5 stands.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--admin-success-soft)',
            color: 'var(--admin-success)',
            borderRadius: 'var(--admin-radius-md)',
            marginBottom: '20px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={18} />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '24px',
        }}
      >
        {qrs.map((qr) => {
          const isEditing = editingId === qr.id;
          const encodedScanUrl = `${siteUrl}/q/${qr.id}`;

          return (
            <div key={qr.id} className="admin-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <span className="admin-badge admin-badge-neutral" style={{ textTransform: 'uppercase', marginBottom: '6px' }}>
                    Code Slug: {qr.id}
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0 0 0', color: 'var(--admin-text-main)' }}>
                    {qr.label}
                  </h2>
                </div>

                <span className={`admin-badge ${qr.is_enabled ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                  {qr.is_enabled ? 'Active / Online' : 'Disabled (Offline)'}
                </span>
              </div>

              {/* QR Preview & Info */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                {/* Visual QR Image Preview */}
                <div
                  style={{
                    width: '140px',
                    height: '140px',
                    backgroundColor: '#FAF4EC',
                    border: '1.5px solid var(--admin-border)',
                    borderRadius: '12px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={`/api/admin/qr-codes/${qr.id}/download?format=png`}
                    alt={qr.label}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)', marginBottom: '2px' }}>Encoded Scan URL:</div>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: 'var(--admin-accent)',
                      wordBreak: 'break-all',
                      marginBottom: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => copyUrl(encodedScanUrl)}
                    title="Click to copy"
                  >
                    {encodedScanUrl} <Copy size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)', marginBottom: '2px' }}>Current Destination:</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text-main)', marginBottom: '12px' }}>
                    {qr.destination}
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                    Total Scans Logged: <strong>{qr.scanCount || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Edit Mode vs Standard Details */}
              {isEditing ? (
                <div style={{ background: 'var(--admin-surface-subtle)', padding: '16px', borderRadius: 'var(--admin-radius-md)', marginBottom: '20px' }}>
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
                    <label className="admin-label">Redirect Destination (URL or Path)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.destination}
                      onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                      placeholder="Enter destination URL"
                    />
                    <div className="admin-hint">Changing this updates where customers land immediately without reprint.</div>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={editForm.is_enabled}
                        onChange={(e) => setEditForm({ ...editForm, is_enabled: e.target.checked })}
                      />
                      <span>QR Active (Uncheck to temporarily show 'Unavailable' page)</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                    <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleSave(qr.id)}>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => handleEditClick(qr)}
                    style={{ width: '100%' }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Destination & Label</span>
                  </button>
                </div>
              )}

              {/* DOWNLOAD OPTIONS */}
              <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Download Assets
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => handleDownload(qr.id, 'png')}
                    title="1024px PNG image"
                  >
                    <Download size={13} />
                    <span>PNG</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => handleDownload(qr.id, 'svg')}
                    title="Vector SVG"
                  >
                    <Download size={13} />
                    <span>SVG</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => handleDownload(qr.id, 'pdf')}
                    title="Print-ready A5 Table Tent Stand PDF"
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
