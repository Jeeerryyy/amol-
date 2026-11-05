import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi';

interface ReviewOption {
  id: string;
  label: string;
  positive_only: number;
  ai_hint: string;
  is_visible: number;
  sort_order: number;
}

interface ReviewStats {
  started: number;
  submitted: number;
  conversionPercent: number;
  averageStars: string;
  starDistribution: Record<string, number>;
  optionSelectionCounts: Record<string, number>;
  dailyTrend: Array<{ day: string; count: number }>;
  notice: string;
}

export const AdminReviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'options' | 'link' | 'stats'>('options');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Google Link State
  const [googleUrl, setGoogleUrl] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);

  // Review Options State
  const [options, setOptions] = useState<ReviewOption[]>([]);
  const [isEditingOption, setIsEditingOption] = useState<ReviewOption | null>(null);

  // Review Stats State
  const [stats, setStats] = useState<ReviewStats | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [configRes, statsRes] = await Promise.all([
        adminApi.get<{ googleReviewUrl: string; options: ReviewOption[] }>('/reviews/config'),
        adminApi.get<ReviewStats>('/reviews/stats'),
      ]);

      if (configRes) {
        setGoogleUrl(configRes.googleReviewUrl || '');
        setOptions(configRes.options || []);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load review data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Google Review Link
  const handleSaveGoogleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkSaving(true);
    try {
      const res = await adminApi.put<{ success: boolean; message: string }>('/reviews/google-link', {
        url: googleUrl,
      });
      showToast(res.message || 'Google Review URL updated successfully');
    } catch (err: any) {
      showToast(err.message || 'Invalid Google URL', 'error');
    } finally {
      setLinkSaving(false);
    }
  };

  // Test Link
  const handleTestLink = () => {
    if (!googleUrl) {
      showToast('Enter a URL first', 'error');
      return;
    }
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
  };

  // Save Option (Add / Edit)
  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingOption) return;

    if (!isEditingOption.label.trim()) {
      showToast('Option label is required', 'error');
      return;
    }
    if (isEditingOption.label.trim().length > 30) {
      showToast('Label must be at most 30 characters', 'error');
      return;
    }

    try {
      if (isEditingOption.id.startsWith('new_')) {
        await adminApi.post('/reviews/options', {
          label: isEditingOption.label,
          positive_only: isEditingOption.positive_only,
          ai_hint: isEditingOption.ai_hint,
        });
        showToast('Review option added');
      } else {
        await adminApi.put(`/reviews/options/${isEditingOption.id}`, isEditingOption);
        showToast('Review option updated');
      }
      setIsEditingOption(null);
      const updated = await adminApi.get<ReviewOption[]>('/reviews/options');
      setOptions(updated || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to save review option', 'error');
    }
  };

  // Delete Option (with 3-option minimum guardrail)
  const handleDeleteOption = (opt: ReviewOption) => {
    const visibleCount = options.filter((o) => o.is_visible === 1).length;
    if (opt.is_visible === 1 && visibleCount <= 3) {
      showToast('Cannot delete: Minimum 3 visible review options must remain.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Review Option',
      message: `Delete "${opt.label}"? Customers will no longer see this tag when writing reviews.`,
      onConfirm: async () => {
        try {
          await adminApi.delete(`/reviews/options/${opt.id}`);
          showToast('Option removed');
          setOptions((prev) => prev.filter((o) => o.id !== opt.id));
        } catch (err: any) {
          showToast(err.message || 'Failed to delete option', 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // Move Option
  const handleMoveOption = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= options.length) return;

    const newList = [...options];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    const batch = newList.map((item, idx) => ({ id: item.id, sort_order: idx + 1 }));
    setOptions(newList);

    try {
      await adminApi.put('/reviews/options/reorder/batch', { items: batch });
    } catch (err: any) {
      showToast('Reorder failed', 'error');
      loadData();
    }
  };

  // Toggle Visibility (with 3 to 14 guardrails)
  const handleToggleVisibility = async (opt: ReviewOption) => {
    const visibleCount = options.filter((o) => o.is_visible === 1).length;
    const nextVal = opt.is_visible === 1 ? 0 : 1;

    if (nextVal === 0 && visibleCount <= 3) {
      showToast('At least 3 visible review options are required.', 'error');
      return;
    }
    if (nextVal === 1 && visibleCount >= 14) {
      showToast('Maximum 14 visible review options allowed.', 'error');
      return;
    }

    try {
      await adminApi.put(`/reviews/options/${opt.id}`, {
        ...opt,
        is_visible: nextVal,
      });
      setOptions((prev) => prev.map((o) => (o.id === opt.id ? { ...o, is_visible: nextVal } : o)));
      showToast(`Option ${nextVal ? 'enabled' : 'hidden'}`);
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const visibleCount = options.filter((o) => o.is_visible === 1).length;

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading-state">
          <div className="admin-spinner" />
          <p>Loading review system controls...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="admin-page-title">Review System Controls</h1>
          <p className="admin-page-subtitle">
            Configure review tags, manage your verified Google Review destination, and analyze customer sentiment.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`admin-tab ${activeTab === 'options' ? 'active' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          Review Options ({visibleCount}/14 visible)
        </button>
        <button
          className={`admin-tab ${activeTab === 'link' ? 'active' : ''}`}
          onClick={() => setActiveTab('link')}
        >
          Google Review Link
        </button>
        <button
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Review Stats & Analytics
        </button>
      </div>

      {/* =====================================================================
          TAB 1: REVIEW OPTIONS (3-14 Guardrails)
          ===================================================================== */}
      {activeTab === 'options' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Quick tags that diners can select to generate their review draft. Keep between 3 and 14 tags active.
              </p>
              <span style={{ fontSize: '12px', color: visibleCount < 3 ? '#d9534f' : '#888' }}>
                Currently <strong>{visibleCount}</strong> visible out of maximum 14 allowed.
              </span>
            </div>
            <button
              className="admin-btn admin-btn-primary"
              disabled={visibleCount >= 14}
              onClick={() =>
                setIsEditingOption({
                  id: `new_${Date.now()}`,
                  label: '',
                  positive_only: 0,
                  ai_hint: '',
                  is_visible: 1,
                  sort_order: options.length + 1,
                })
              }
            >
              + Add Review Option
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Order</th>
                  <th>Option Label</th>
                  <th>Audience</th>
                  <th>AI Prompt Hint</th>
                  <th>Visible</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {options.map((opt, index) => (
                  <tr key={opt.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          className="admin-btn-icon"
                          disabled={index === 0}
                          onClick={() => handleMoveOption(index, 'up')}
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          className="admin-btn-icon"
                          disabled={index === options.length - 1}
                          onClick={() => handleMoveOption(index, 'down')}
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '14px', color: '#3A1E05' }}>{opt.label}</strong>
                    </td>
                    <td>
                      <span className={`admin-badge ${opt.positive_only ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
                        {opt.positive_only ? '4★ & 5★ Only' : 'All Ratings (1★-5★)'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#777' }}>
                        {opt.ai_hint || 'Standard sentiment line'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`admin-badge ${opt.is_visible ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => handleToggleVisibility(opt)}
                      >
                        {opt.is_visible ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="admin-btn admin-btn-outline" onClick={() => setIsEditingOption(opt)}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteOption(opt)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit/Add Option Modal */}
          {isEditingOption && (
            <div className="admin-modal-backdrop">
              <div className="admin-modal" style={{ maxWidth: '480px' }}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">
                    {isEditingOption.id.startsWith('new_') ? 'Add Review Option' : 'Edit Review Option'}
                  </h3>
                  <button className="admin-close-btn" onClick={() => setIsEditingOption(null)}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSaveOption} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="admin-form-label">
                      Option Label * <span style={{ color: '#888' }}>(Max 30 characters)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="admin-form-input"
                      placeholder="Enter option label"
                      value={isEditingOption.label}
                      onChange={(e) => setIsEditingOption({ ...isEditingOption, label: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="admin-form-label">Rating Visibility</label>
                    <select
                      className="admin-form-input"
                      value={isEditingOption.positive_only}
                      onChange={(e) => setIsEditingOption({ ...isEditingOption, positive_only: Number(e.target.value) })}
                    >
                      <option value={0}>Show on all ratings (1 to 5 stars)</option>
                      <option value={1}>Show on positive ratings only (4 and 5 stars)</option>
                    </select>
                  </div>

                  <div>
                    <label className="admin-form-label">AI Prompt Hint (Optional, max 80 chars)</label>
                    <input
                      type="text"
                      maxLength={80}
                      className="admin-form-input"
                      placeholder="Enter prompt hint"
                      value={isEditingOption.ai_hint || ''}
                      onChange={(e) => setIsEditingOption({ ...isEditingOption, ai_hint: e.target.value })}
                    />
                    <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                      Guides Gemini when writing reviews if the customer selects this option.
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditingOption(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      Save Option
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: GOOGLE REVIEW LINK
          ===================================================================== */}
      {activeTab === 'link' && (
        <div style={{ maxWidth: '640px' }}>
          <form onSubmit={handleSaveGoogleLink} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#3A1E05' }}>Google Review Link Configuration</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
              When customers finish drafting their review, clicking "Post on Google" will open this exact URL.
              Ensure this link is direct to your Google Business Profile review dialog.
            </p>

            <div>
              <label className="admin-form-label">Direct Google Review URL *</label>
              <input
                type="url"
                className="admin-form-input"
                placeholder="Enter your website URL"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                required
              />
              <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                Accepted domains: <code>search.google.com</code>, <code>g.page</code>, <code>maps.app.goo.gl</code>, <code>goo.gl</code>.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={handleTestLink}
                disabled={!googleUrl}
              >
                ↗ Test Link in New Tab
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={linkSaving || !googleUrl}
              >
                {linkSaving ? 'Saving...' : 'Save Google Review Link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB 3: REVIEW STATS & ANALYTICS
          ===================================================================== */}
      {activeTab === 'stats' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Notice alert */}
          <div style={{ padding: '12px 16px', background: '#fdfbf7', border: '1px solid #ebd9c4', borderRadius: '8px', color: '#8d4c1b', fontSize: '13px' }}>
            ℹ️ <strong>Privacy Notice:</strong> {stats.notice}
          </div>

          {/* KPI Cards */}
          <div className="admin-kpi-grid">
            <div className="admin-card">
              <span className="admin-kpi-label">Drafts Started</span>
              <span className="admin-kpi-value">{stats.started}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>Customer selected stars</span>
            </div>

            <div className="admin-card">
              <span className="admin-kpi-label">Opened Google Review</span>
              <span className="admin-kpi-value" style={{ color: '#C85A17' }}>{stats.submitted}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>Clicked "Post to Google"</span>
            </div>

            <div className="admin-card">
              <span className="admin-kpi-label">Completion Rate</span>
              <span className="admin-kpi-value" style={{ color: '#27ae60' }}>{stats.conversionPercent}%</span>
              <span style={{ fontSize: '12px', color: '#888' }}>Conversion from start</span>
            </div>

            <div className="admin-card">
              <span className="admin-kpi-label">Average Rating Selected</span>
              <span className="admin-kpi-value">★ {stats.averageStars}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>Out of 5.0 stars</span>
            </div>
          </div>

          {/* Breakdown: Star Distribution & Most Selected Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Star Distribution */}
            <div className="admin-card">
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#3A1E05' }}>Star Rating Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.starDistribution[star] || 0;
                  const total = stats.submitted || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '40px', fontSize: '13px', fontWeight: 'bold' }}>{star} ★</span>
                      <div style={{ flex: 1, height: '14px', background: '#f0ece1', borderRadius: '7px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: star >= 4 ? '#27ae60' : star === 3 ? '#e67e22' : '#d9534f',
                          }}
                        />
                      </div>
                      <span style={{ width: '45px', textAlign: 'right', fontSize: '12px', color: '#666' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Selected Options */}
            <div className="admin-card">
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#3A1E05' }}>Customer Favorite Highlights</h3>
              {Object.keys(stats.optionSelectionCounts).length === 0 ? (
                <p style={{ color: '#888', fontSize: '13px' }}>No options selected yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(stats.optionSelectionCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 7)
                    .map(([optId, count]) => {
                      const optObj = options.find((o) => o.id === optId);
                      const label = optObj?.label || optId;
                      return (
                        <div key={optId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece1' }}>
                          <span style={{ fontSize: '13px', color: '#3A1E05' }}>{label}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#C85A17' }}>{count} times</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend (Last 14 Days) */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#3A1E05' }}>Daily Submissions (Last 14 Days)</h3>
            {stats.dailyTrend.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px' }}>No submissions recorded in this period.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '12px', paddingTop: '20px' }}>
                {stats.dailyTrend.map((item) => {
                  const maxVal = Math.max(...stats.dailyTrend.map((d) => d.count), 1);
                  const heightPct = Math.round((item.count / maxVal) * 100);
                  return (
                    <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <span style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{item.count}</span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '24px',
                          height: `${Math.max(heightPct, 6)}%`,
                          background: '#C85A17',
                          borderRadius: '4px 4px 0 0',
                          marginTop: 'auto',
                        }}
                      />
                      <span style={{ fontSize: '10px', color: '#777', marginTop: '6px', whiteSpace: 'nowrap' }}>
                        {item.day.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: '420px' }}>
            <h3 className="admin-modal-title">{confirmDialog.title}</h3>
            <p style={{ margin: '12px 0 20px', fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-btn admin-btn-outline" onClick={() => setConfirmDialog(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" onClick={confirmDialog.onConfirm}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

