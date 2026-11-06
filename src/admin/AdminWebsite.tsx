import React, { useState, useEffect } from 'react';
import { adminApi, CloudinaryUploadResult } from './adminApi';

interface PopularDish {
  id: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
  image_public_id?: string;
  is_visible: number;
  sort_order: number;
}

interface GalleryItem {
  id: string;
  url: string;
  public_id?: string;
  alt_text: string;
  caption: string;
  category: string;
  aspect: string;
  is_visible: number;
  sort_order: number;
}

interface SiteContact {
  phone: string;
  alternate_phone: string;
  email: string;
  address: string;
  maps_url: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
}

interface SiteFooter {
  fssai_license: string;
  opening_hours: string;
  copyright_text: string;
  note: string;
}

interface LegalPage {
  id: string;
  title: string;
  content_html: string;
  updated_at: string;
}

interface SeoPage {
  id: string;
  page_name: string;
  title: string;
  meta_description: string;
  og_image_url: string;
  noindex: number;
}

export const AdminWebsite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'popular' | 'gallery' | 'contact' | 'footer' | 'legal' | 'seo'>('popular');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Popular Dishes state
  const [popularDishes, setPopularDishes] = useState<PopularDish[]>([]);
  const [isEditingPop, setIsEditingPop] = useState<PopularDish | null>(null);
  const [menuDishes, setMenuDishes] = useState<any[]>([]);
  const [showDishPicker, setShowDishPicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isEditingGal, setIsEditingGal] = useState<GalleryItem | null>(null);

  // Contact & Footer state
  const [contactData, setContactData] = useState<SiteContact>({
    phone: '',
    alternate_phone: '',
    email: '',
    address: '',
    maps_url: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
  });

  const [footerData, setFooterData] = useState<SiteFooter>({
    fssai_license: '',
    opening_hours: '',
    copyright_text: '',
    note: '',
  });

  // Legal Pages state
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPage | null>(null);

  // SEO state
  const [seoPages, setSeoPages] = useState<SeoPage[]>([]);

  // Confirm delete modal
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

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pops, gals, site, legals, seos, dishes] = await Promise.all([
        adminApi.get<PopularDish[]>('/popular-dishes'),
        adminApi.get<GalleryItem[]>('/gallery'),
        adminApi.get<{ contact?: SiteContact; footer?: SiteFooter }>('/site-content'),
        adminApi.get<LegalPage[]>('/legal-pages'),
        adminApi.get<SeoPage[]>('/seo-pages'),
        adminApi.get<any[]>('/dishes'),
      ]);

      setPopularDishes(pops || []);
      setGalleryItems(gals || []);
      if (site?.contact) setContactData(site.contact);
      if (site?.footer) setFooterData(site.footer);
      setLegalPages(legals || []);
      if (legals && legals.length > 0) setSelectedLegalPage(legals[0]);
      setSeoPages(seos || []);
      setMenuDishes(dishes || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load website content', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ==========================================================================
  // POPULAR DISHES HANDLERS
  // ==========================================================================
  const handleSavePopularDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingPop) return;
    if (!isEditingPop.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      if (isEditingPop.id.startsWith('new_')) {
        if (popularDishes.length >= 12) {
          showToast('Maximum 12 popular dishes allowed', 'error');
          return;
        }
        await adminApi.post('/popular-dishes', {
          ...isEditingPop,
          sort_order: popularDishes.length + 1,
        });
        showToast('Popular dish added successfully');
      } else {
        await adminApi.put(`/popular-dishes/${isEditingPop.id}`, isEditingPop);
        showToast('Popular dish updated');
      }
      setIsEditingPop(null);
      const updated = await adminApi.get<PopularDish[]>('/popular-dishes');
      setPopularDishes(updated || []);
    } catch (err: any) {
      showToast(err.message || 'Error saving popular dish', 'error');
    }
  };

  const handleDeletePopularDish = (pop: PopularDish) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Popular Dish',
      message: `Remove "${pop.title}" from the homepage popular dishes section?`,
      onConfirm: async () => {
        try {
          await adminApi.delete(`/popular-dishes/${pop.id}`);
          showToast('Popular dish removed');
          setPopularDishes((prev) => prev.filter((d) => d.id !== pop.id));
        } catch (err: any) {
          showToast(err.message || 'Failed to delete popular dish', 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handlePickMenuDish = (dish: any) => {
    const coverImage = dish.images && dish.images[0] ? dish.images[0].url : '';
    const coverPubId = dish.images && dish.images[0] ? dish.images[0].public_id : '';
    const priceStr = dish.price_type === 'single' ? `₹${dish.price}` : 'From ₹' + (dish.variants?.[0]?.price || '');

    setIsEditingPop({
      id: `new_${Date.now()}`,
      title: dish.name,
      description: dish.description || '',
      price: priceStr,
      image_url: coverImage,
      image_public_id: coverPubId,
      is_visible: 1,
      sort_order: popularDishes.length + 1,
    });
    setShowDishPicker(false);
  };

  const handleMovePop = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= popularDishes.length) return;

    const newList = [...popularDishes];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    const batch = newList.map((item, idx) => ({ id: item.id, sort_order: idx + 1 }));
    setPopularDishes(newList);

    try {
      await adminApi.put('/popular-dishes/reorder/batch', { items: batch });
    } catch (err: any) {
      showToast('Reorder failed', 'error');
      loadAllData();
    }
  };

  // ==========================================================================
  // GALLERY HANDLERS
  // ==========================================================================
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingGal) return;
    if (!isEditingGal.url) {
      showToast('Image is required', 'error');
      return;
    }
    if (!isEditingGal.alt_text.trim()) {
      showToast('Alt text is strictly required for SEO', 'error');
      return;
    }

    try {
      if (isEditingGal.id.startsWith('new_')) {
        await adminApi.post('/gallery', {
          ...isEditingGal,
          sort_order: galleryItems.length + 1,
        });
        showToast('Gallery image added');
      } else {
        await adminApi.put(`/gallery/${isEditingGal.id}`, isEditingGal);
        showToast('Gallery image updated');
      }
      setIsEditingGal(null);
      const updated = await adminApi.get<GalleryItem[]>('/gallery');
      setGalleryItems(updated || []);
    } catch (err: any) {
      showToast(err.message || 'Error saving gallery item', 'error');
    }
  };

  const handleDeleteGalleryItem = (item: GalleryItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Gallery Image',
      message: `Delete this photo ("${item.alt_text}") from the public gallery?`,
      onConfirm: async () => {
        try {
          await adminApi.delete(`/gallery/${item.id}`);
          showToast('Gallery image deleted');
          setGalleryItems((prev) => prev.filter((g) => g.id !== item.id));
        } catch (err: any) {
          showToast(err.message || 'Failed to delete gallery image', 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleMoveGal = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryItems.length) return;

    const newList = [...galleryItems];
    const [moved] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, moved);

    const batch = newList.map((item, idx) => ({ id: item.id, sort_order: idx + 1 }));
    setGalleryItems(newList);

    try {
      await adminApi.put('/gallery/reorder/batch', { items: batch });
    } catch (err: any) {
      showToast('Reorder failed', 'error');
      loadAllData();
    }
  };

  // Direct Cloudinary Upload for Gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadProgress(10);
      const file = files[0];
      const res: CloudinaryUploadResult = await adminApi.uploadToCloudinary(
        file,
        'restaurant/gallery',
        (p: number) => setUploadProgress(p)
      );
      setUploadProgress(null);

      // Open editor with prefilled upload
      setIsEditingGal({
        id: `new_${Date.now()}`,
        url: res.secure_url,
        public_id: res.public_id,
        alt_text: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: '',
        category: 'food',
        aspect: 'standard',
        is_visible: 1,
        sort_order: galleryItems.length + 1,
      });
    } catch (err: any) {
      setUploadProgress(null);
      showToast(err.message || 'Failed to upload photo', 'error');
    }
  };

  // Direct Cloudinary Upload for Popular Dish
  const handlePopularDishUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !isEditingPop) return;

    try {
      setUploadProgress(10);
      const file = files[0];
      const res: CloudinaryUploadResult = await adminApi.uploadToCloudinary(
        file,
        'restaurant/popular',
        (p: number) => setUploadProgress(p)
      );
      setUploadProgress(null);
      setIsEditingPop({
        ...isEditingPop,
        image_url: res.secure_url,
        image_public_id: res.public_id,
      });
      showToast('Photo uploaded');
    } catch (err: any) {
      setUploadProgress(null);
      showToast(err.message || 'Upload failed', 'error');
    }
  };

  // ==========================================================================
  // CONTACT & FOOTER HANDLERS
  // ==========================================================================
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.put('/site-content/contact', contactData);
      showToast('Contact & Social info saved successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to save contact info', 'error');
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.put('/site-content/footer', footerData);
      showToast('Footer & FSSAI information saved');
    } catch (err: any) {
      showToast(err.message || 'Failed to save footer info', 'error');
    }
  };

  // ==========================================================================
  // LEGAL PAGES HANDLERS
  // ==========================================================================
  const handleSaveLegalPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLegalPage) return;

    try {
      await adminApi.put(`/legal-pages/${selectedLegalPage.id}`, {
        title: selectedLegalPage.title,
        content_html: selectedLegalPage.content_html,
      });
      showToast(`${selectedLegalPage.title} saved and sanitized`);
      const legals = await adminApi.get<LegalPage[]>('/legal-pages');
      setLegalPages(legals || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to save legal page', 'error');
    }
  };

  // ==========================================================================
  // SEO PAGES HANDLERS
  // ==========================================================================
  const handleSaveSeoPage = async (page: SeoPage) => {
    try {
      await adminApi.put(`/seo-pages/${page.id}`, page);
      showToast(`SEO settings for "${page.page_name}" saved`);
    } catch (err: any) {
      showToast(err.message || 'Failed to save SEO settings', 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading-state">
          <div className="admin-spinner" />
          <p>Loading website management...</p>
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
          <h1 className="admin-page-title">Website Content</h1>
          <p className="admin-page-subtitle">
            Manage public website sections, gallery, contact details, legal policies, and SEO metadata.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`admin-tab ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveTab('popular')}
        >
          Popular Dishes ({popularDishes.length}/12)
        </button>
        <button
          className={`admin-tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery ({galleryItems.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact & Social
        </button>
        <button
          className={`admin-tab ${activeTab === 'footer' ? 'active' : ''}`}
          onClick={() => setActiveTab('footer')}
        >
          Footer & FSSAI
        </button>
        <button
          className={`admin-tab ${activeTab === 'legal' ? 'active' : ''}`}
          onClick={() => setActiveTab('legal')}
        >
          Legal Pages
        </button>
        <button
          className={`admin-tab ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          SEO Metadata
        </button>
      </div>

      {/* =====================================================================
          TAB 1: POPULAR DISHES (Max 12)
          ===================================================================== */}
      {activeTab === 'popular' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Feature up to 12 popular dishes directly on the homepage carousel.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="admin-btn admin-btn-outline"
                disabled={popularDishes.length >= 12}
                onClick={() => setShowDishPicker(true)}
              >
                + Add from Menu Dish
              </button>
              <button
                className="admin-btn admin-btn-primary"
                disabled={popularDishes.length >= 12}
                onClick={() =>
                  setIsEditingPop({
                    id: `new_${Date.now()}`,
                    title: '',
                    description: '',
                    price: '',
                    image_url: '',
                    is_visible: 1,
                    sort_order: popularDishes.length + 1,
                  })
                }
              >
                + Custom Dish
              </button>
            </div>
          </div>

          {popularDishes.length === 0 ? (
            <div className="admin-empty-state">
              <p>No popular dishes added yet.</p>
              <button className="admin-btn admin-btn-primary" onClick={() => setShowDishPicker(true)}>
                Pick a Dish from Menu
              </button>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Order</th>
                    <th style={{ width: '80px' }}>Image</th>
                    <th>Title & Description</th>
                    <th>Price</th>
                    <th>Visible</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {popularDishes.map((dish, index) => (
                    <tr key={dish.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            className="admin-btn-icon"
                            disabled={index === 0}
                            onClick={() => handleMovePop(index, 'up')}
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            className="admin-btn-icon"
                            disabled={index === popularDishes.length - 1}
                            onClick={() => handleMovePop(index, 'down')}
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td>
                        {dish.image_url ? (
                          <img
                            src={dish.image_url}
                            alt={dish.title}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        ) : (
                          <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '6px' }} />
                        )}
                      </td>
                      <td>
                        <strong>{dish.title}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>{dish.description}</p>
                      </td>
                      <td>
                        <span style={{ fontWeight: 'bold', color: '#C85A17' }}>{dish.price}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${dish.is_visible ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
                          {dish.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="admin-btn admin-btn-outline" onClick={() => setIsEditingPop(dish)}>
                            Edit
                          </button>
                          <button className="admin-btn admin-btn-danger" onClick={() => handleDeletePopularDish(dish)}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Dish Picker Modal */}
          {showDishPicker && (
            <div className="admin-modal-backdrop">
              <div className="admin-modal" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">Select Dish from Menu</h3>
                  <button className="admin-close-btn" onClick={() => setShowDishPicker(false)}>
                    ✕
                  </button>
                </div>
                <div style={{ padding: '16px 0' }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                    Click any menu dish to feature it on the homepage:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {menuDishes.map((dish) => (
                      <div
                        key={dish.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          border: '1px solid #e0d8cc',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: '#fff',
                        }}
                        onClick={() => handlePickMenuDish(dish)}
                      >
                        {dish.images?.[0]?.url ? (
                          <img
                            src={dish.images[0].url}
                            alt={dish.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', background: '#f0ece1', borderRadius: '4px' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '14px', color: '#3A1E05' }}>{dish.name}</strong>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {dish.price_type === 'single' ? `₹${dish.price}` : 'Variants'}
                          </div>
                        </div>
                        <button className="admin-btn admin-btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Popular Dish Modal */}
          {isEditingPop && (
            <div className="admin-modal-backdrop">
              <div className="admin-modal" style={{ maxWidth: '520px' }}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">
                    {isEditingPop.id.startsWith('new_') ? 'Add Popular Dish' : 'Edit Popular Dish'}
                  </h3>
                  <button className="admin-close-btn" onClick={() => setIsEditingPop(null)}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSavePopularDish} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="admin-form-label">Dish Title *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={isEditingPop.title}
                      onChange={(e) => setIsEditingPop({ ...isEditingPop, title: e.target.value })}
                      placeholder="Enter dish title"
                      required
                    />
                  </div>

                  <div>
                    <label className="admin-form-label">Description / Tagline</label>
                    <textarea
                      className="admin-form-input"
                      rows={2}
                      value={isEditingPop.description}
                      onChange={(e) => setIsEditingPop({ ...isEditingPop, description: e.target.value })}
                      placeholder="Enter description"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="admin-form-label">Display Price *</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="Enter the amount"
                        value={isEditingPop.price}
                        onChange={(e) => setIsEditingPop({ ...isEditingPop, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="admin-form-label">Visibility</label>
                      <select
                        className="admin-form-input"
                        value={isEditingPop.is_visible}
                        onChange={(e) => setIsEditingPop({ ...isEditingPop, is_visible: Number(e.target.value) })}
                      >
                        <option value={1}>Visible</option>
                        <option value={0}>Hidden</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="admin-form-label">Dish Photo</label>
                    {isEditingPop.image_url ? (
                      <div style={{ position: 'relative', width: '100%', height: '140px', marginBottom: '8px' }}>
                        <img
                          src={isEditingPop.image_url}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => setIsEditingPop({ ...isEditingPop, image_url: '', image_public_id: '' })}
                        >
                          Remove Photo
                        </button>
                      </div>
                    ) : null}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePopularDishUpload}
                      style={{ fontSize: '13px' }}
                    />
                    {uploadProgress !== null && (
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#C85A17' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Uploading {uploadProgress}%...</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditingPop(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      Save Popular Dish
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: GALLERY (Multi-upload, required SEO alt text)
          ===================================================================== */}
      {activeTab === 'gallery' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Upload and manage photos for the gallery page. SEO alt text is strictly required for every image.
            </p>
            <label className="admin-btn admin-btn-primary" style={{ cursor: 'pointer', margin: 0 }}>
              + Upload Photo to Gallery
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleGalleryUpload}
              />
            </label>
          </div>

          {uploadProgress !== null && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
              <div style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#C85A17', transition: 'width 0.2s' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'inline-block' }}>
                Uploading image directly to Cloudinary ({uploadProgress}%)...
              </span>
            </div>
          )}

          {galleryItems.length === 0 ? (
            <div className="admin-empty-state">
              <p>No gallery images yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e0d8cc',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img
                      src={item.url}
                      alt={item.alt_text}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.category.toUpperCase()} • {item.aspect}
                    </div>
                  </div>
                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '13px', color: '#3A1E05' }}>{item.caption || item.alt_text}</strong>
                    <span style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                      Alt: <em>{item.alt_text}</em>
                    </span>
                    <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="admin-btn-icon"
                          disabled={index === 0}
                          onClick={() => handleMoveGal(index, 'up')}
                          title="Move left/up"
                        >
                          ◀
                        </button>
                        <button
                          className="admin-btn-icon"
                          disabled={index === galleryItems.length - 1}
                          onClick={() => handleMoveGal(index, 'down')}
                          title="Move right/down"
                        >
                          ▶
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => setIsEditingGal(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => handleDeleteGalleryItem(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Gallery Item Modal */}
          {isEditingGal && (
            <div className="admin-modal-backdrop">
              <div className="admin-modal" style={{ maxWidth: '520px' }}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">
                    {isEditingGal.id.startsWith('new_') ? 'Add Gallery Photo' : 'Edit Gallery Photo'}
                  </h3>
                  <button className="admin-close-btn" onClick={() => setIsEditingGal(null)}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSaveGalleryItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ height: '160px', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={isEditingGal.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div>
                    <label className="admin-form-label">
                      SEO Alt Text * <span style={{ color: '#d9534f' }}>(Required for accessibility & SEO)</span>
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Enter alt text"
                      value={isEditingGal.alt_text}
                      onChange={(e) => setIsEditingGal({ ...isEditingGal, alt_text: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="admin-form-label">Caption (Optional)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Enter caption"
                      value={isEditingGal.caption}
                      onChange={(e) => setIsEditingGal({ ...isEditingGal, caption: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="admin-form-label">Category</label>
                      <select
                        className="admin-form-input"
                        value={isEditingGal.category}
                        onChange={(e) => setIsEditingGal({ ...isEditingGal, category: e.target.value })}
                      >
                        <option value="" disabled hidden>Select category</option>
                        <option value="food">Food</option>
                        <option value="ambiance">Ambiance</option>
                        <option value="events">Events & Catering</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-form-label">Grid Aspect</label>
                      <select
                        className="admin-form-input"
                        value={isEditingGal.aspect}
                        onChange={(e) => setIsEditingGal({ ...isEditingGal, aspect: e.target.value })}
                      >
                        <option value="" disabled hidden>Select aspect ratio</option>
                        <option value="standard">Standard (4:3)</option>
                        <option value="wide">Wide (16:9)</option>
                        <option value="tall">Tall (3:4)</option>
                        <option value="square">Square (1:1)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="admin-form-label">Visibility</label>
                    <select
                      className="admin-form-input"
                      value={isEditingGal.is_visible}
                      onChange={(e) => setIsEditingGal({ ...isEditingGal, is_visible: Number(e.target.value) })}
                    >
                      <option value={1}>Visible on Website</option>
                      <option value={0}>Hidden</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditingGal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      Save Photo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: CONTACT & SOCIAL
          ===================================================================== */}
      {activeTab === 'contact' && (
        <div style={{ maxWidth: '720px' }}>
          <form onSubmit={handleSaveContact} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#3A1E05' }}>Contact Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Primary Phone *</label>
                <input
                  type="tel"
                  className="admin-form-input"
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                />
              </div>
              <div>
                <label className="admin-form-label">Alternate Phone</label>
                <input
                  type="tel"
                  className="admin-form-input"
                  value={contactData.alternate_phone}
                  onChange={(e) => setContactData({ ...contactData, alternate_phone: e.target.value })}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Email Address *</label>
                <input
                  type="email"
                  className="admin-form-input"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="admin-form-label">WhatsApp Number</label>
                <input
                  type="tel"
                  className="admin-form-input"
                  value={contactData.whatsapp}
                  onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className="admin-form-label">Full Address</label>
              <textarea
                className="admin-form-input"
                rows={2}
                value={contactData.address}
                onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>

            <div>
              <label className="admin-form-label">Google Maps Embed URL</label>
              <input
                type="text"
                className="admin-form-input"
                value={contactData.maps_url}
                onChange={(e) => setContactData({ ...contactData, maps_url: e.target.value })}
                placeholder="Enter your website URL"
              />
            </div>

            <h3 style={{ margin: '16px 0 0', fontSize: '18px', color: '#3A1E05' }}>Social Media Profiles</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Instagram Profile URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={contactData.instagram}
                  onChange={(e) => setContactData({ ...contactData, instagram: e.target.value })}
                  placeholder="Enter your website URL"
                />
              </div>
              <div>
                <label className="admin-form-label">Facebook Page URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={contactData.facebook}
                  onChange={(e) => setContactData({ ...contactData, facebook: e.target.value })}
                  placeholder="Enter your website URL"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="admin-btn admin-btn-primary">
                Save Contact & Social Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB 4: FOOTER & FSSAI
          ===================================================================== */}
      {activeTab === 'footer' && (
        <div style={{ maxWidth: '720px' }}>
          <form onSubmit={handleSaveFooter} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#3A1E05' }}>Footer & Compliance Settings</h3>

            <div>
              <label className="admin-form-label">FSSAI License Number</label>
              <input
                type="text"
                className="admin-form-input"
                value={footerData.fssai_license}
                onChange={(e) => setFooterData({ ...footerData, fssai_license: e.target.value })}
                placeholder="Enter license number"
              />
              <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                Displayed prominently in the footer alongside FSSAI certification badge.
              </span>
            </div>

            <div>
              <label className="admin-form-label">Opening Hours</label>
              <input
                type="text"
                className="admin-form-input"
                value={footerData.opening_hours}
                onChange={(e) => setFooterData({ ...footerData, opening_hours: e.target.value })}
                placeholder="Enter opening hours"
              />
            </div>

            <div>
              <label className="admin-form-label">Copyright Notice</label>
              <input
                type="text"
                className="admin-form-input"
                value={footerData.copyright_text}
                onChange={(e) => setFooterData({ ...footerData, copyright_text: e.target.value })}
                placeholder="Enter copyright notice"
              />
            </div>

            <div>
              <label className="admin-form-label">Footer Note / Dietary Statement</label>
              <textarea
                className="admin-form-input"
                rows={2}
                value={footerData.note}
                onChange={(e) => setFooterData({ ...footerData, note: e.target.value })}
                placeholder="Enter dietary statement"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="admin-btn admin-btn-primary">
                Save Footer & Compliance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          TAB 5: LEGAL PAGES
          ===================================================================== */}
      {activeTab === 'legal' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {legalPages.map((page) => (
              <button
                key={page.id}
                className={`admin-btn ${selectedLegalPage?.id === page.id ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                onClick={() => setSelectedLegalPage(page)}
              >
                {page.title}
              </button>
            ))}
          </div>

          {selectedLegalPage && (
            <form onSubmit={handleSaveLegalPage} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#3A1E05' }}>Edit {selectedLegalPage.title}</h3>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  Last updated: {new Date(selectedLegalPage.updated_at).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div>
                <label className="admin-form-label">Page Title</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={selectedLegalPage.title}
                  onChange={(e) => setSelectedLegalPage({ ...selectedLegalPage, title: e.target.value })}
                  placeholder="Enter page title"
                  required
                />
              </div>

              <div>
                <label className="admin-form-label">
                  Content (HTML / Rich Text)
                  <span style={{ fontWeight: 'normal', color: '#888', marginLeft: '6px' }}>
                    (Safe tags &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; allowed; all script tags stripped)
                  </span>
                </label>
                <textarea
                  className="admin-form-input"
                  rows={14}
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                  value={selectedLegalPage.content_html}
                  onChange={(e) => setSelectedLegalPage({ ...selectedLegalPage, content_html: e.target.value })}
                  placeholder="Enter content"
                  required
                />
              </div>

              <div style={{ padding: '12px', background: '#fdfbf7', border: '1px solid #ebd9c4', borderRadius: '6px' }}>
                <strong style={{ fontSize: '12px', color: '#8d4c1b' }}>Live Preview:</strong>
                <div
                  style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: selectedLegalPage.content_html }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save {selectedLegalPage.title}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 6: SEO METADATA
          ===================================================================== */}
      {activeTab === 'seo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Control browser tab titles, Google meta descriptions, social OpenGraph sharing images, and indexing per page.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {seoPages.map((page) => (
              <div key={page.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px', color: '#C85A17' }}>{page.page_name}</strong>
                  <span className={`admin-badge ${page.noindex ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                    {page.noindex ? 'noindex (hidden from Google)' : 'indexed'}
                  </span>
                </div>

                <div>
                  <label className="admin-form-label">Browser & Search Title</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={page.title}
                    onChange={(e) => {
                      const updated = seoPages.map((p) => (p.id === page.id ? { ...p, title: e.target.value } : p));
                      setSeoPages(updated);
                    }}
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <label className="admin-form-label">Meta Description</label>
                  <textarea
                    className="admin-form-input"
                    rows={2}
                    value={page.meta_description}
                    onChange={(e) => {
                      const updated = seoPages.map((p) => (p.id === page.id ? { ...p, meta_description: e.target.value } : p));
                      setSeoPages(updated);
                    }}
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="admin-form-label">Social Share (OG) Image URL</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    placeholder="Enter your website URL"
                    value={page.og_image_url || ''}
                    onChange={(e) => {
                      const updated = seoPages.map((p) => (p.id === page.id ? { ...p, og_image_url: e.target.value } : p));
                      setSeoPages(updated);
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id={`noindex_${page.id}`}
                    checked={page.noindex === 1}
                    onChange={(e) => {
                      const updated = seoPages.map((p) => (p.id === page.id ? { ...p, noindex: e.target.checked ? 1 : 0 } : p));
                      setSeoPages(updated);
                    }}
                  />
                  <label htmlFor={`noindex_${page.id}`} style={{ fontSize: '13px', color: '#3A1E05' }}>
                    Exclude from search engines (noindex)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                    onClick={() => handleSaveSeoPage(page)}
                  >
                    Save {page.page_name} SEO
                  </button>
                </div>
              </div>
            ))}
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
