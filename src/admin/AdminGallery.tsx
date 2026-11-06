import React, { useState, useEffect, useMemo } from 'react';
import { adminApi, CloudinaryUploadResult } from './adminApi';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export interface GalleryItem {
  id: string;
  url: string;
  public_id: string | null;
  alt_text: string;
  caption: string;
  category: string;
  aspect: string;
  is_visible: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export const AdminGallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formState, setFormState] = useState<{
    url: string;
    public_id: string | null;
    alt_text: string;
    caption: string;
    category: string;
    aspect: string;
    is_visible: number;
  }>({
    url: '',
    public_id: null,
    alt_text: '',
    caption: '',
    category: 'food',
    aspect: 'standard',
    is_visible: 1,
  });

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [imagePreviewError, setImagePreviewError] = useState<boolean>(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load gallery items from server
  const loadGallery = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<GalleryItem[]>('/gallery');
      if (Array.isArray(res)) {
        setItems(res);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load gallery items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // Filtered gallery items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === 'all' ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.alt_text && item.alt_text.toLowerCase().includes(q)) ||
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [items, categoryFilter, searchQuery]);

  // Open modal to Add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormState({
      url: '',
      public_id: null,
      alt_text: '',
      caption: '',
      category: 'food',
      aspect: 'standard',
      is_visible: 1,
    });
    setImagePreviewError(false);
    setIsModalOpen(true);
  };

  // Open modal to Edit
  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormState({
      url: item.url || '',
      public_id: item.public_id || null,
      alt_text: item.alt_text || '',
      caption: item.caption || '',
      category: item.category || 'food',
      aspect: item.aspect || 'standard',
      is_visible: item.is_visible ?? 1,
    });
    setImagePreviewError(false);
    setIsModalOpen(true);
  };

  // Direct Cloudinary Upload inside modal or toolbar
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      setUploadProgress(10);
      const res: CloudinaryUploadResult = await adminApi.uploadToCloudinary(
        file,
        'restaurant/gallery',
        (p: number) => setUploadProgress(p)
      );
      setUploadProgress(null);

      setFormState((prev) => ({
        ...prev,
        url: res.secure_url || res.url,
        public_id: res.public_id,
        alt_text: prev.alt_text || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
      setImagePreviewError(false);
      showToast('Image uploaded successfully');
    } catch (err: any) {
      setUploadProgress(null);
      showToast(err.message || 'Image upload failed', 'error');
    }
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.url.trim()) {
      showToast('Please provide an image URL or upload an image file.', 'error');
      return;
    }
    if (!formState.alt_text.trim()) {
      showToast('SEO Alt text is strictly required.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      if (editingItem) {
        // Update existing item
        await adminApi.put(`/gallery/${editingItem.id}`, {
          ...formState,
          sort_order: editingItem.sort_order,
        });
        showToast('Gallery photo updated successfully');
      } else {
        // Create new item
        await adminApi.post('/gallery', {
          ...formState,
          sort_order: items.length + 1,
        });
        showToast('Gallery photo added to website');
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await loadGallery();
    } catch (err: any) {
      showToast(err.message || 'Failed to save gallery item', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await adminApi.delete(`/gallery/${deleteTarget.id}`);
      showToast('Gallery photo deleted successfully');
      setDeleteTarget(null);
      await loadGallery();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete photo', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick toggle visibility
  const handleToggleVisibility = async (item: GalleryItem) => {
    const nextVis = item.is_visible === 1 ? 0 : 1;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_visible: nextVis } : i))
    );
    try {
      await adminApi.put(`/gallery/${item.id}`, {
        ...item,
        is_visible: nextVis,
      });
      showToast(nextVis === 1 ? 'Photo is now visible on website' : 'Photo hidden from website');
    } catch (err: any) {
      showToast(err.message || 'Failed to update visibility', 'error');
      loadGallery();
    }
  };

  // Reorder up/down
  const handleMove = async (indexInFiltered: number, direction: 'left' | 'right') => {
    const itemToMove = filteredItems[indexInFiltered];
    const currentIndexInAll = items.findIndex((i) => i.id === itemToMove.id);
    if (currentIndexInAll === -1) return;

    const targetIndexInAll = direction === 'left' ? currentIndexInAll - 1 : currentIndexInAll + 1;
    if (targetIndexInAll < 0 || targetIndexInAll >= items.length) return;

    const newList = [...items];
    const [moved] = newList.splice(currentIndexInAll, 1);
    newList.splice(targetIndexInAll, 0, moved);

    const batch = newList.map((item, idx) => ({ id: item.id, sort_order: idx + 1 }));
    setItems(newList);

    try {
      await adminApi.put('/gallery/reorder/batch', { items: batch });
    } catch (err: any) {
      showToast('Failed to save photo order', 'error');
      loadGallery();
    }
  };

  const visibleCount = items.filter((i) => i.is_visible === 1).length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'error' ? '#FF3D00' : '#15191E',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            fontSize: '13px',
            fontWeight: 500,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} color="#FF5900" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--admin-text-main)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Gallery Management
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--admin-text-secondary)',
              margin: 0,
            }}
          >
            Add, edit, reorder, or delete photos for the public website gallery. All edits sync live to the website.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn-outline"
            style={{ fontSize: '13px', gap: '6px', height: '38px', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            <span>View Public Gallery</span>
          </a>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="admin-btn admin-btn-primary"
            style={{ fontSize: '13px', gap: '6px', height: '38px', padding: '0 16px' }}
          >
            <Plus size={16} />
            <span>Add Gallery Photo</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR: SEARCH & CATEGORY FILTERS */}
      <div
        className="admin-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-muted)',
            }}
          />
          <input
            type="text"
            className="admin-form-input"
            style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
            placeholder="Search photos by title or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'food', label: 'Food & Delicacies' },
            { id: 'ambiance', label: 'Dining Hall' },
            { id: 'kitchen', label: 'Kitchen & Hygiene' },
            { id: 'events', label: 'Events & Catering' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: categoryFilter === cat.id ? 'var(--admin-primary-action)' : 'var(--admin-border)',
                background: categoryFilter === cat.id ? 'var(--admin-primary-action)' : '#FFFFFF',
                color: categoryFilter === cat.id ? '#FFFFFF' : 'var(--admin-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Counter Badge */}
        <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)', fontWeight: 500 }}>
          Showing <strong>{filteredItems.length}</strong> photos ({visibleCount} active on website)
        </div>
      </div>

      {/* GALLERY GRID */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="admin-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>Loading gallery photos...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <ImageIcon size={48} color="var(--admin-text-dim)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-text-main)', margin: '0 0 6px 0' }}>
            No gallery photos found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '0 0 16px 0' }}>
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search query or category filter.'
              : 'Start showcasing your food and dining atmosphere by adding your first photo.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="admin-btn admin-btn-primary"
            style={{ margin: '0 auto', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>Add Gallery Photo</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredItems.length - 1;

            return (
              <div
                key={item.id}
                className="admin-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--admin-border)',
                  boxShadow: 'var(--admin-shadow-sm)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  opacity: item.is_visible === 1 ? 1 : 0.65,
                }}
              >
                {/* Media Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '190px',
                    backgroundColor: '#F5F5F7',
                    overflow: 'hidden',
                  }}
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.alt_text}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--admin-text-dim)',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <ImageIcon size={32} />
                      <span style={{ fontSize: '12px' }}>No Image URL</span>
                    </div>
                  )}

                  {/* Category & Aspect Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      display: 'flex',
                      gap: '6px',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(21, 25, 30, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.category}
                    </span>
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: 'var(--admin-text-main)',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.aspect === 'wide'
                        ? '16:9'
                        : item.aspect === 'tall'
                        ? '3:4'
                        : item.aspect === 'square'
                        ? '1:1'
                        : '4:3'}
                    </span>
                  </div>

                  {/* Visibility Quick Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(item)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: item.is_visible === 1 ? '#00C853' : '#60646C',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 2,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                    title="Click to toggle visible on public website"
                  >
                    {item.is_visible === 1 ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{item.is_visible === 1 ? 'Live' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Details */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--admin-text-main)',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.caption || item.alt_text}
                    </div>
                    {item.caption && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--admin-text-dim)',
                          marginTop: '4px',
                          lineHeight: 1.4,
                        }}
                      >
                        Alt: <span style={{ color: 'var(--admin-text-secondary)' }}>{item.alt_text}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--admin-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    {/* Reordering */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="admin-btn-icon"
                        disabled={isFirst}
                        onClick={() => handleMove(index, 'left')}
                        title="Move Earlier in Gallery"
                        style={{ width: '30px', height: '30px' }}
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon"
                        disabled={isLast}
                        onClick={() => handleMove(index, 'right')}
                        title="Move Later in Gallery"
                        style={{ width: '30px', height: '30px' }}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-outline"
                        style={{ padding: '4px 10px', fontSize: '12px', height: '30px', gap: '4px' }}
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '4px 10px', fontSize: '12px', height: '30px', gap: '4px' }}
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          ADD / EDIT GALLERY PHOTO MODAL
          ===================================================================== */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" style={{ zIndex: 10000 }}>
          <div className="admin-modal" style={{ maxWidth: '580px', width: '90%' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingItem ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}
              </h3>
              <button
                type="button"
                className="admin-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Image Preview Box */}
              <div
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#F0EBE1',
                  border: '1px solid var(--admin-border)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {formState.url && !imagePreviewError ? (
                  <img
                    src={formState.url}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--admin-text-dim)' }}>
                    <ImageIcon size={40} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <span style={{ fontSize: '12px' }}>
                      {imagePreviewError ? 'Unable to load preview from URL' : 'Image preview will appear here'}
                    </span>
                  </div>
                )}

                {uploadProgress !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      gap: '8px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ width: '80%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#FF5900', transition: 'width 0.2s' }} />
                    </div>
                    <span style={{ fontSize: '12px' }}>Uploading to Cloudinary ({uploadProgress}%)...</span>
                  </div>
                )}
              </div>

              {/* Image Input Options: Direct URL or Upload File */}
              <div>
                <label className="admin-form-label">
                  Image URL or Upload *
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <LinkIcon
                      size={15}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--admin-text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Enter photo URL (e.g. https://... or /images/...)"
                      value={formState.url}
                      onChange={(e) => {
                        setFormState({ ...formState, url: e.target.value });
                        setImagePreviewError(false);
                      }}
                      style={{ paddingLeft: '36px' }}
                      required
                    />
                  </div>

                  <label
                    className="admin-btn admin-btn-outline"
                    style={{
                      cursor: 'pointer',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      height: '38px',
                      fontSize: '12px',
                      gap: '6px',
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--admin-text-dim)', marginTop: '4px', display: 'block' }}>
                  Paste a direct CDN/Unsplash link, or upload an image file from your computer.
                </span>
              </div>

              {/* SEO Alt Text */}
              <div>
                <label className="admin-form-label">
                  SEO Alt Text * <span style={{ color: '#FF3D00' }}>(Required for SEO & Google Image Search)</span>
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Enter descriptive alt text (e.g. Crisp Golden Masala Dosa with Chutneys)"
                  value={formState.alt_text}
                  onChange={(e) => setFormState({ ...formState, alt_text: e.target.value })}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--admin-text-dim)', marginTop: '4px', display: 'block' }}>
                  Accurately describe the dish or room. This improves ranking on Google Search.
                </span>
              </div>

              {/* Caption */}
              <div>
                <label className="admin-form-label">Caption / Description (Optional)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Enter caption shown to visitors on the website"
                  value={formState.caption}
                  onChange={(e) => setFormState({ ...formState, caption: e.target.value })}
                />
              </div>

              {/* Category & Aspect Ratio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="admin-form-label">Category</label>
                  <select
                    className="admin-form-input"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  >
                    <option value="food">Food & Delicacies</option>
                    <option value="ambiance">Dining Hall & Ambiance</option>
                    <option value="kitchen">Kitchen & Preparation</option>
                    <option value="events">Events & Catering</option>
                  </select>
                </div>

                <div>
                  <label className="admin-form-label">Aspect Ratio</label>
                  <select
                    className="admin-form-input"
                    value={formState.aspect}
                    onChange={(e) => setFormState({ ...formState, aspect: e.target.value })}
                  >
                    <option value="standard">Standard (4:3)</option>
                    <option value="wide">Wide Landscape (16:9)</option>
                    <option value="tall">Tall Portrait (3:4)</option>
                    <option value="square">Square (1:1)</option>
                  </select>
                </div>
              </div>

              {/* Visibility Setting */}
              <div>
                <label className="admin-form-label">Website Visibility</label>
                <select
                  className="admin-form-input"
                  value={formState.is_visible}
                  onChange={(e) => setFormState({ ...formState, is_visible: Number(e.target.value) })}
                >
                  <option value={1}>Visible on Public Website</option>
                  <option value={0}>Hidden / Draft</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--admin-border)',
                }}
              >
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                  style={{ minWidth: '120px' }}
                >
                  {isSaving ? 'Saving...' : editingItem ? 'Update Photo' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          DELETE CONFIRMATION MODAL
          ===================================================================== */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" style={{ zIndex: 10001 }}>
          <div className="admin-modal" style={{ maxWidth: '440px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" style={{ color: '#FF3D00' }}>
                Delete Gallery Photo
              </h3>
              <button
                type="button"
                className="admin-close-btn"
                onClick={() => setDeleteTarget(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 0', fontSize: '13px', color: 'var(--admin-text-secondary)', lineHeight: 1.5 }}>
              Are you sure you want to remove this photo ("<strong>{deleteTarget.caption || deleteTarget.alt_text}</strong>")?
              This will immediately remove it from the public website gallery.
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--admin-border)',
              }}
            >
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{ minWidth: '100px' }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;

