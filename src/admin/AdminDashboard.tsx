import React, { useState, useEffect } from 'react';
import { adminFetch } from './adminApi';
import {
  QrCode,
  TrendingUp,
  Star,
  UtensilsCrossed,
  Smartphone,
  Plus,
  Download,
  EyeOff,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const AdminDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [range, setRange] = useState<string>('7D');
  const [peakFilter, setPeakFilter] = useState<'all' | 'main' | 'special'>('all');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    adminFetch(`/api/admin/dashboard?range=${range}`)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[Dashboard] Error:', err);
        setLoading(false);
      });
  }, [range]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
        Loading dashboard analytics...
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const menuHealth = data?.menuHealth || {};
  const reviews = data?.reviews || {};
  const peakHours = data?.peakHours || [];
  const daysOfWeek = data?.daysOfWeek || [];
  const devices = data?.devices || { Android: 0, iOS: 0, Desktop: 0, Other: 0 };
  const totalDeviceScans = Object.values(devices).reduce((a: any, b: any) => a + b, 0) as number;

  const maxHourCount = Math.max(1, ...peakHours.map((h: any) => (peakFilter === 'main' ? h.main : peakFilter === 'special' ? h.special : h.total)));
  const maxDayCount = Math.max(1, ...daysOfWeek.map((d: any) => (peakFilter === 'main' ? d.main : peakFilter === 'special' ? d.special : d.total)));

  return (
    <div>
      {/* Top Controls & Title */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="admin-page-subtitle">Real-time scan metrics, menu status & guest engagement</p>
        </div>

        {/* Date Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--admin-surface-card)', padding: '4px', borderRadius: 'var(--admin-radius-sm)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-sm)' }}>
          {['Today', '7D', '30D', '90D', 'All'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: range === r ? 'var(--admin-primary-action)' : 'transparent',
                color: range === r ? '#FFFFFF' : 'var(--admin-text-secondary)',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('menus')}
          className="admin-btn admin-btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
        >
          <Plus size={16} color="var(--admin-accent)" />
          <span>Add New Dish</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('website')}
          className="admin-btn admin-btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
        >
          <Plus size={16} color="var(--admin-accent)" />
          <span>Add Gallery Photo</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('menus')}
          className="admin-btn admin-btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
        >
          <EyeOff size={16} color="var(--admin-text-dim)" />
          <span>Dish Availability</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('qr')}
          className="admin-btn admin-btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
        >
          <Download size={16} color="var(--admin-accent)" />
          <span>Download QRs</span>
        </button>
      </div>

      {/* 4 SCAN KPIS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Today */}
        <div className="admin-card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Today's Scans</span>
            <QrCode size={18} color="var(--admin-accent)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
            {kpis.today?.total || 0}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--admin-text-dim)', marginTop: '6px', display: 'flex', gap: '10px' }}>
            <span>Main: <strong>{kpis.today?.main || 0}</strong></span>
            <span>·</span>
            <span>Special: <strong>{kpis.today?.special || 0}</strong></span>
          </div>
        </div>

        {/* 7 Days */}
        <div className="admin-card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Last 7 Days</span>
            <TrendingUp size={18} color="var(--admin-success)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
            {kpis.last7Days?.total || 0}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--admin-text-dim)', marginTop: '6px', display: 'flex', gap: '10px' }}>
            <span>Main: <strong>{kpis.last7Days?.main || 0}</strong></span>
            <span>·</span>
            <span>Special: <strong>{kpis.last7Days?.special || 0}</strong></span>
          </div>
        </div>

        {/* 30 Days */}
        <div className="admin-card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Last 30 Days</span>
            <Calendar size={18} color="var(--admin-text-dim)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
            {kpis.last30Days?.total || 0}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--admin-text-dim)', marginTop: '6px', display: 'flex', gap: '10px' }}>
            <span>Main: <strong>{kpis.last30Days?.main || 0}</strong></span>
            <span>·</span>
            <span>Special: <strong>{kpis.last30Days?.special || 0}</strong></span>
          </div>
        </div>

        {/* All-Time */}
        <div className="admin-card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>All-Time Scans</span>
            <QrCode size={18} color="var(--admin-text-main)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
            {kpis.allTime?.total || 0}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--admin-text-dim)', marginTop: '6px', display: 'flex', gap: '10px' }}>
            <span>Main: <strong>{kpis.allTime?.main || 0}</strong></span>
            <span>·</span>
            <span>Special: <strong>{kpis.allTime?.special || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* PEAK HOURS & DAYS OF WEEK CHARTS (0-23 in IST) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Hourly Distribution */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Peak Dining Hours (IST)</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--admin-text-dim)' }}>
                Hour 00 to 23 Indian Standard Time
              </p>
            </div>
            {/* Filter toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all', 'main', 'special'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPeakFilter(f)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    border: '1px solid var(--admin-border)',
                    background: peakFilter === f ? 'var(--admin-primary-action)' : 'var(--admin-surface-card)',
                    color: peakFilter === f ? '#FFFFFF' : 'var(--admin-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart by Hour */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '24px', position: 'relative' }}>
            {peakHours.map((h: any) => {
              const count = peakFilter === 'main' ? h.main : peakFilter === 'special' ? h.special : h.total;
              const barHeight = Math.round((count / maxHourCount) * 140);
              return (
                <div
                  key={h.hour}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                  title={`${h.hour}:00 IST: ${count} scan(s)`}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(barHeight, count > 0 ? 4 : 1)}px`,
                      backgroundColor: count > 0 ? 'var(--admin-primary-action)' : 'var(--admin-surface-subtle)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.2s ease',
                    }}
                  />
                  {h.hour % 3 === 0 && (
                    <span style={{ position: 'absolute', bottom: '-20px', fontSize: '10px', color: 'var(--admin-text-dim)' }}>
                      {h.hour}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day of Week */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Busiest Days of Week</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--admin-text-dim)' }}>
                Weekly guest traffic patterns
              </p>
            </div>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '24px', position: 'relative' }}>
            {daysOfWeek.map((d: any) => {
              const count = peakFilter === 'main' ? d.main : peakFilter === 'special' ? d.special : d.total;
              const barHeight = Math.round((count / maxDayCount) * 140);
              return (
                <div
                  key={d.day}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                  title={`${d.day}: ${count} scan(s)`}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${Math.max(barHeight, count > 0 ? 6 : 2)}px`,
                      backgroundColor: count > 0 ? 'var(--admin-brand-black)' : 'var(--admin-surface-subtle)',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <span style={{ position: 'absolute', bottom: '-22px', fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOWER ROW: DEVICES BREAKDOWN + MENU HEALTH + REVIEWS CARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Device Breakdown */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Customer Devices</h3>
            <Smartphone size={18} color="var(--admin-accent)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            {/* Visual Bar Distribution */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(['Android', 'iOS', 'Desktop', 'Other'] as const).map((dev) => {
                const count = (devices as any)[dev] || 0;
                const pct = totalDeviceScans > 0 ? Math.round((count / totalDeviceScans) * 100) : 0;
                const colors: any = { Android: 'var(--admin-success)', iOS: 'var(--admin-primary-action)', Desktop: 'var(--admin-brand-black)', Other: 'var(--admin-text-secondary)' };
                return (
                  <div key={dev}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600 }}>{dev}</span>
                      <span style={{ color: 'var(--admin-text-dim)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '7px', background: 'var(--admin-surface-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[dev] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Health */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Menu Health</h3>
            <UtensilsCrossed size={18} color="var(--admin-accent)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--admin-surface-subtle)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Total Active Dishes</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-text-main)' }}>{menuHealth.totalDishes || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: menuHealth.soldOut > 0 ? 'var(--admin-danger-soft)' : 'var(--admin-surface-subtle)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: menuHealth.soldOut > 0 ? 'var(--admin-danger)' : 'var(--admin-text-main)' }}>Sold Out Dishes</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: menuHealth.soldOut > 0 ? 'var(--admin-danger)' : 'var(--admin-text-main)' }}>{menuHealth.soldOut || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--admin-surface-subtle)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Hidden Dishes</span>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{menuHealth.hidden || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--admin-text-dim)', paddingTop: '4px' }}>
              <span>Main Menu: <strong>{menuHealth.mainMenuCount || 0}</strong></span>
              <span>Special Menu: <strong>{menuHealth.specialMenuCount || 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Review Engagement */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Reviews Analytics</h3>
            <Star size={18} color="var(--admin-warning)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                {reviews.averageStars || '5.0'} ★
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-accent)', textTransform: 'uppercase' }}>Average Rating</div>
                <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)' }}>Across all submissions</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '8px 10px', background: 'var(--admin-surface-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--admin-text-dim)' }}>Started Reviews</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{reviews.started || 0}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--admin-surface-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--admin-text-dim)' }}>Submitted to Google</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-success)' }}>{reviews.submitted || 0}</div>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--admin-text-muted)' }}>
              Conversion Rate: <strong>{reviews.conversionPercent || 0}%</strong>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('reviews')}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ width: '100%', marginTop: '4px' }}
            >
              View Full Review Stats →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
