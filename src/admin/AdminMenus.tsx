import React, { useState, useEffect } from 'react';
import { adminFetch, uploadToCloudinary } from './adminApi';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Video,
  Upload,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';

export const AdminMenus: React.FC = () => {
  const [activeMenuTab, setActiveMenuTab] = useState<'dishes' | 'categories' | 'video'>('dishes');
  const [menuScopeFilter, setMenuScopeFilter] = useState<'all' | 'main' | 'special'>('all');

  // Categories & Dishes state
  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [pricingSettings, setPricingSettings] = useState<{ markup: number; rounding: number }>({ markup: 10, rounding: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [availFilter, setAvailFilter] = useState<string>('');
  const [visFilter, setVisFilter] = useState<string>('');

  // Selected dishes for bulk actions
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);

  // Dish Editor Drawer
  const [isDishDrawerOpen, setIsDishDrawerOpen] = useState<boolean>(false);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [dishForm, setDishForm] = useState<any>({
    name: '',
    description: '',
    category_id: '',
    serving_note: '',
    price_type: 'single',
    base_price: '' as any,
    special_price_override: null,
    variants: [],
    images: [],
    tags: ['veg'],
    spice_level: 'none',
    badges: [],
    is_available: 1,
    is_visible: 1,
    scope: 'both',
  });
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Category Editor Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [catForm, setCatForm] = useState<{ id?: string; name: string; description: string; visible: boolean }>({
    name: '',
    description: '',
    visible: true,
  });

  // Category Delete with Choice Modal
  const [deleteCatChoice, setDeleteCatChoice] = useState<{ catId: string; dishCount: number } | null>(null);
  const [reassignTargetCat, setReassignTargetCat] = useState<string>('');

  // Video Management State
  const [menuData, setMenuData] = useState<any[]>([]);
  const [selectedMenuForVideo, setSelectedMenuForVideo] = useState<'main' | 'special'>('main');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, dishList, pSettings, menus] = await Promise.all([
        adminFetch('/api/admin/categories'),
        adminFetch('/api/admin/dishes'),
        adminFetch('/api/admin/settings'),
        adminFetch('/api/admin/menus'),
      ]);
      setCategories(cats);
      setDishes(dishList);
      setPricingSettings({
        markup: pSettings.special_markup_percent,
        rounding: pSettings.rounding_step,
      });
      setMenuData(menus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Filtered dishes
  const filteredDishes = dishes.filter((d) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = d.name?.toLowerCase().includes(q);
      const matchDesc = d.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (categoryFilter && d.category_id !== categoryFilter) return false;
    if (menuScopeFilter === 'main' && d.scope === 'special_only') return false;
    if (menuScopeFilter === 'special' && d.scope !== 'both' && d.scope !== 'special_only') return false;
    if (availFilter !== '' && String(d.is_available) !== availFilter) return false;
    if (visFilter !== '' && String(d.is_visible) !== visFilter) return false;
    return true;
  });

  // Open Dish Drawer for Create
  const handleOpenCreateDish = () => {
    setEditingDish(null);
    setDishForm({
      name: '',
      description: '',
      category_id: '',
      serving_note: '',
      price_type: 'single',
      base_price: '' as any,
      special_price_override: null,
      variants: [],
      images: [],
      tags: ['veg'],
      spice_level: 'none',
      badges: [],
      is_available: 1,
      is_visible: 1,
      scope: 'both',
    });
    setIsDishDrawerOpen(true);
  };

  // Open Dish Drawer for Edit
  const handleOpenEditDish = (dish: any) => {
    setEditingDish(dish);
    setDishForm({
      ...dish,
      variants: dish.variants?.length ? dish.variants : [],
      images: dish.images || [],
    });
    setIsDishDrawerOpen(true);
  };

  // Save Dish
  const handleSaveDish = async () => {
    if (!dishForm.name.trim()) return alert('Dish name is required');
    if (!dishForm.category_id) return alert('Category is required');

    if (dishForm.price_type === 'single') {
      if (isNaN(Number(dishForm.base_price)) || Number(dishForm.base_price) <= 0) {
        return alert('Dish price must be a positive number greater than 0');
      }
    } else if (dishForm.price_type === 'variants') {
      if (!dishForm.variants || dishForm.variants.length === 0) {
        return alert('At least one variant is required');
      }
      for (const v of dishForm.variants) {
        if (isNaN(Number(v.base_price)) || Number(v.base_price) <= 0) {
          return alert(`Price for variant "${v.label}" must be greater than 0`);
        }
      }
    }

    try {
      if (editingDish) {
        await adminFetch(`/api/admin/dishes/${editingDish.id}`, {
          method: 'PUT',
          body: JSON.stringify(dishForm),
        });
        showToast(`Updated "${dishForm.name}"`);
      } else {
        await adminFetch('/api/admin/dishes', {
          method: 'POST',
          body: JSON.stringify(dishForm),
        });
        showToast(`Created dish "${dishForm.name}"`);
      }
      setIsDishDrawerOpen(false);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to save dish');
    }
  };

  // Duplicate Dish
  const handleDuplicateDish = async (dishId: string) => {
    try {
      await adminFetch(`/api/admin/dishes/${dishId}/duplicate`, { method: 'POST' });
      showToast('Dish duplicated successfully');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Duplicate failed');
    }
  };

  // Delete Dish
  const handleDeleteDish = async (dishId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await adminFetch(`/api/admin/dishes/${dishId}`, { method: 'DELETE' });
      showToast(`Deleted "${name}"`);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // Toggle Availability
  const handleToggleAvailable = async (dish: any) => {
    const updated = dish.is_available === 1 ? 0 : 1;
    try {
      await adminFetch(`/api/admin/dishes/${dish.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...dish, is_available: updated }),
      });
      showToast(`Marked "${dish.name}" ${updated ? 'Available' : 'Sold Out'}`);
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle Visibility
  const handleToggleVisible = async (dish: any) => {
    const updated = dish.is_visible === 1 ? 0 : 1;
    try {
      await adminFetch(`/api/admin/dishes/${dish.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...dish, is_visible: updated }),
      });
      showToast(`Marked "${dish.name}" ${updated ? 'Visible' : 'Hidden'}`);
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Dish Image Upload via Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (dishForm.images.length >= 5) {
      return alert('Maximum 5 images allowed per dish.');
    }

    setUploadingImage(true);
    setUploadProgress(10);

    try {
      const file = files[0];
      const uploaded = await uploadToCloudinary({
        file,
        folder: 'restaurant/dishes',
        resourceType: 'image',
        onProgress: (pct: number) => setUploadProgress(pct),
      });

      const newImages = [...dishForm.images, { url: uploaded.url, public_id: uploaded.public_id }];
      setDishForm({ ...dishForm, images: newImages });
      showToast('Image uploaded successfully.');
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Remove Dish Image
  const handleRemoveImage = (idx: number) => {
    const updated = dishForm.images.filter((_: any, i: number) => i !== idx);
    setDishForm({ ...dishForm, images: updated });
  };

  // Bulk Actions
  const handleBulkAction = async (action: string, value?: any) => {
    if (selectedDishIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selectedDishIds.length} dishes?`)) return;

    try {
      await adminFetch('/api/admin/dishes/bulk', {
        method: 'POST',
        body: JSON.stringify({ action, dishIds: selectedDishIds, value }),
      });
      showToast(`Bulk action applied to ${selectedDishIds.length} items`);
      setSelectedDishIds([]);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Bulk action failed');
    }
  };

  // Reorder dishes up/down
  const handleMoveDishOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredDishes.length) return;

    const current = filteredDishes[index];
    const target = filteredDishes[targetIndex];

    const items = [
      { id: current.id, sort_order: target.sort_order || targetIndex },
      { id: target.id, sort_order: current.sort_order || index },
    ];

    try {
      await adminFetch('/api/admin/dishes/reorder/batch', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Categories CRUD
  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return alert('Category name is required');
    try {
      if (catForm.id) {
        await adminFetch(`/api/admin/categories/${catForm.id}`, {
          method: 'PUT',
          body: JSON.stringify(catForm),
        });
        showToast(`Updated category "${catForm.name}"`);
      } else {
        await adminFetch('/api/admin/categories', {
          method: 'POST',
          body: JSON.stringify(catForm),
        });
        showToast(`Added category "${catForm.name}"`);
      }
      setIsCatModalOpen(false);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    try {
      const res = await adminFetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
      if (res.success) {
        showToast(`Category "${cat.name}" deleted.`);
        loadAll();
      }
    } catch (err: any) {
      // If category has dishes, server returns 400 requiring choice
      const count = dishes.filter((d) => d.category_id === cat.id).length;
      setDeleteCatChoice({ catId: cat.id, dishCount: count });
      setReassignTargetCat(categories.find((c) => c.id !== cat.id)?.id || '');
    }
  };

  const handleConfirmCategoryChoice = async (deleteDishesToo: boolean) => {
    if (!deleteCatChoice) return;
    try {
      const url = deleteDishesToo
        ? `/api/admin/categories/${deleteCatChoice.catId}?deleteDishes=true`
        : `/api/admin/categories/${deleteCatChoice.catId}?reassignToCategoryId=${reassignTargetCat}`;

      await adminFetch(url, { method: 'DELETE' });
      showToast('Category and dishes processed.');
      setDeleteCatChoice(null);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // Reorder Categories
  const handleMoveCategoryOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    const items = [
      { id: current.id, sort_order: target.sort_order || targetIndex },
      { id: target.id, sort_order: current.sort_order || index },
    ];

    try {
      await adminFetch('/api/admin/categories/reorder/batch', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Video Management Update
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubtitle, setVideoSubtitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPublicId, setVideoPublicId] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [posterPublicId, setPosterPublicId] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    const m = menuData.find((item) => item.id === selectedMenuForVideo);
    if (m) {
      setVideoTitle(m.title || '');
      setVideoSubtitle(m.subtitle || '');
      setVideoUrl(m.video_url || '');
      setVideoPublicId(m.video_public_id || '');
      setPosterUrl(m.poster_url || '');
      setPosterPublicId(m.poster_public_id || '');
    }
  }, [selectedMenuForVideo, menuData]);

  const handleSaveMenuVideo = async () => {
    try {
      await adminFetch(`/api/admin/menus/${selectedMenuForVideo}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: videoTitle,
          subtitle: videoSubtitle,
          video_url: videoUrl,
          video_public_id: videoPublicId,
          poster_url: posterUrl,
          poster_public_id: posterPublicId,
        }),
      });
      showToast('Menu video & titles updated.');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to update menu video');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingVideo(true);

    try {
      const res = await uploadToCloudinary({
        file: files[0],
        folder: 'restaurant/menu',
        resourceType: 'video',
      });
      setVideoUrl(res.url);
      setVideoPublicId(res.public_id);
      showToast('Video uploaded. Remember to click Save.');
    } catch (err: any) {
      alert(err.message || 'Video upload failed');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Special Price Preview Helper
  const previewSpecialPrice =
    dishForm.scope === 'special_only'
      ? Number(dishForm.base_price) || 0
      : dishForm.special_price_override !== null && dishForm.special_price_override !== ''
      ? Number(dishForm.special_price_override)
      : Math.round(
          (Number(dishForm.base_price) * (1 + pricingSettings.markup / 100)) / pricingSettings.rounding
        ) * pricingSettings.rounding;

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1 className="admin-page-title">Menus Management</h1>
          <p className="admin-page-subtitle">
            Manage Dishes, Shared Categories & Hero Video for Main & Special Menus
          </p>
        </div>

        <div className="admin-page-header-actions">
          {activeMenuTab === 'dishes' && (
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenCreateDish}>
              <Plus size={16} />
              <span>Create Dish</span>
            </button>
          )}
          {activeMenuTab === 'categories' && (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => {
                setCatForm({ name: '', description: '', visible: true });
                setIsCatModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--admin-success-soft)',
            color: 'var(--admin-success)',
            borderRadius: 'var(--admin-radius-md)',
            marginBottom: '18px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP TABS: DISHES | CATEGORIES | MENU VIDEO */}
      <div className="admin-tabs-row">
        <button
          type="button"
          className={`admin-tab-btn ${activeMenuTab === 'dishes' ? 'active' : ''}`}
          onClick={() => setActiveMenuTab('dishes')}
        >
          <UtensilsCrossed size={16} />
          <span>Dishes List ({dishes.length})</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeMenuTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveMenuTab('categories')}
        >
          <Layers size={16} />
          <span>Shared Categories ({categories.length})</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeMenuTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveMenuTab('video')}
        >
          <Video size={16} />
          <span>Menu Video & Headers</span>
        </button>
      </div>

      {/* TAB 1: DISHES */}
      {activeMenuTab === 'dishes' && (
        <div>
          {/* Filters & Search Toolbar */}
          <div
            className="admin-card"
            style={{ padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}
          >
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '38px', minHeight: '38px' }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--admin-text-dim)',
                }}
              />
            </div>

            {/* Scope Filter */}
            <select
              value={menuScopeFilter}
              onChange={(e: any) => setMenuScopeFilter(e.target.value)}
              className="admin-select"
              style={{ flex: '0 1 130px', minWidth: '115px', minHeight: '38px', fontSize: '13px' }}
            >
              <option value="all">All Menus</option>
              <option value="main">Main Menu Only</option>
              <option value="special">Special Menu Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-select"
              style={{ flex: '0 1 150px', minWidth: '125px', minHeight: '38px', fontSize: '13px' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value)}
              className="admin-select"
              style={{ flex: '0 1 130px', minWidth: '115px', minHeight: '38px', fontSize: '13px' }}
            >
              <option value="">All Availability</option>
              <option value="1">Available</option>
              <option value="0">Sold Out</option>
            </select>

            {/* Visibility Filter */}
            <select
              value={visFilter}
              onChange={(e) => setVisFilter(e.target.value)}
              className="admin-select"
              style={{ flex: '0 1 120px', minWidth: '110px', minHeight: '38px', fontSize: '13px' }}
            >
              <option value="">All Visibility</option>
              <option value="1">Visible</option>
              <option value="0">Hidden</option>
            </select>
          </div>

          {loading && dishes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
              <p>Loading dishes...</p>
            </div>
          )}

          {/* Bulk Actions Bar if items selected */}
          {selectedDishIds.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--admin-text-main)',
                color: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: 'var(--admin-radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                {selectedDishIds.length} dish(es) selected
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => handleBulkAction('set_available', true)}
                >
                  Mark Available
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => handleBulkAction('set_available', false)}
                >
                  Mark Sold Out
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => handleBulkAction('set_visible', true)}
                >
                  Show
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => handleBulkAction('set_visible', false)}
                >
                  Hide
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete Selected
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  style={{ color: '#FFFFFF' }}
                  onClick={() => setSelectedDishIds([])}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Dishes Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedDishIds.length === filteredDishes.length && filteredDishes.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDishIds(filteredDishes.map((d) => d.id));
                        else setSelectedDishIds([]);
                      }}
                    />
                  </th>
                  <th style={{ width: '56px' }}>Photo</th>
                  <th>Name & Badges</th>
                  <th>Category</th>
                  <th>Main Price</th>
                  <th>Special Price</th>
                  <th>Scope</th>
                  <th style={{ textAlign: 'center' }}>Available</th>
                  <th style={{ textAlign: 'center' }}>Visible</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDishes.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                      No dishes match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredDishes.map((dish, idx) => {
                    const catName = categories.find((c) => c.id === dish.category_id)?.name || dish.category_id;
                    const imgUrl = dish.images?.[0]?.url || '/logo.png';
                    const isSelected = selectedDishIds.includes(dish.id);

                    return (
                      <tr key={dish.id} style={{ opacity: dish.is_visible ? 1 : 0.6 }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDishIds([...selectedDishIds, dish.id]);
                              else setSelectedDishIds(selectedDishIds.filter((id) => id !== dish.id));
                            }}
                          />
                        </td>
                        <td>
                          <img
                            src={imgUrl}
                            alt=""
                            style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                            onError={(e: any) => (e.target.src = '/logo.png')}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 650, color: 'var(--admin-text-main)' }}>
                            {dish.name}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                            {dish.badges?.map((b: string) => (
                              <span key={b} className="admin-badge admin-badge-success" style={{ fontSize: '10.5px' }}>
                                {b}
                              </span>
                            ))}
                            {dish.tags?.includes('jain') && (
                              <span className="admin-badge admin-badge-neutral" style={{ fontSize: '10.5px', color: '#2E7D32' }}>
                                Jain
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>{catName}</td>
                        <td style={{ fontWeight: 600 }}>
                          {dish.scope === 'special_only' ? (
                            <span style={{ color: 'var(--admin-text-dim)' }}>—</span>
                          ) : (
                            `₹ ${dish.base_price}`
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>
                          ₹ {dish.special_price}
                          {dish.special_price_override !== null && (
                            <span style={{ fontSize: '11px', color: 'var(--admin-text-dim)', marginLeft: '4px' }}>
                              (Manual)
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${dish.scope === 'special_only' ? 'admin-badge-neutral' : 'admin-badge-success'}`}
                            style={{ fontSize: '11px' }}
                          >
                            {dish.scope === 'both' ? 'Both' : 'Special Only'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailable(dish)}
                            className={`admin-badge ${dish.is_available ? 'admin-badge-success' : 'admin-badge-danger'}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title="Click to toggle Available / Sold Out"
                          >
                            {dish.is_available ? 'Available' : 'Sold Out'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleVisible(dish)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: dish.is_visible ? 'var(--admin-success)' : 'var(--admin-text-dim)' }}
                            title="Click to toggle Visible / Hidden"
                          >
                            {dish.is_visible ? <Eye size={17} /> : <EyeOff size={17} />}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => handleMoveDishOrder(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => handleMoveDishOrder(idx, 'down')}
                              disabled={idx === filteredDishes.length - 1}
                              title="Move Down"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => handleDuplicateDish(dish.id)}
                              title="Duplicate Dish"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => handleOpenEditDish(dish)}
                              title="Edit Dish"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              style={{ color: 'var(--admin-danger)' }}
                              onClick={() => handleDeleteDish(dish.id, dish.name)}
                              title="Delete Dish"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SHARED CATEGORIES */}
      {activeMenuTab === 'categories' && (
        <div style={{ maxWidth: '800px' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Shared Categories ({categories.length})</h3>
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => {
                  setCatForm({ name: '', description: '', visible: true });
                  setIsCatModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Dishes Count</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Reorder & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => {
                    const count = dishes.filter((d) => d.category_id === cat.id).length;
                    return (
                      <tr key={cat.id}>
                        <td>
                          <div style={{ fontWeight: 650 }}>{cat.name}</div>
                          {cat.description && <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)' }}>{cat.description}</div>}
                        </td>
                        <td>{count} dishes</td>
                        <td>
                          <span className={`admin-badge ${cat.visible ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
                            {cat.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => handleMoveCategoryOrder(idx, 'up')}
                            disabled={idx === 0}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => handleMoveCategoryOrder(idx, 'down')}
                            disabled={idx === categories.length - 1}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => {
                              setCatForm({ id: cat.id, name: cat.name, description: cat.description || '', visible: Boolean(cat.visible) });
                              setIsCatModalOpen(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            style={{ color: 'var(--admin-danger)' }}
                            onClick={() => handleDeleteCategory(cat)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MENU VIDEO & TITLES */}
      {activeMenuTab === 'video' && (
        <div style={{ maxWidth: '800px' }}>
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Menu Hero Video & Headers</h3>
              {/* Menu Switcher */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`admin-btn admin-btn-sm ${selectedMenuForVideo === 'main' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  onClick={() => setSelectedMenuForVideo('main')}
                >
                  Main Menu
                </button>
                <button
                  type="button"
                  className={`admin-btn admin-btn-sm ${selectedMenuForVideo === 'special' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  onClick={() => setSelectedMenuForVideo('special')}
                >
                  Special Menu
                </button>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Menu Title</label>
              <input
                type="text"
                className="admin-input"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter menu title"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Menu Subtitle</label>
              <input
                type="text"
                className="admin-input"
                value={videoSubtitle}
                onChange={(e) => setVideoSubtitle(e.target.value)}
                placeholder="Enter menu subtitle"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Hero Video URL (MP4/WebM up to 100MB)</label>
              <input
                type="text"
                className="admin-input"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter video URL"
              />
            </div>

            {/* Video File Upload */}
            <div style={{ marginBottom: '18px' }}>
              <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} />
                <span>{uploadingVideo ? 'Uploading Video to Cloudinary...' : 'Upload Video File'}</span>
                <input type="file" accept="video/mp4,video/webm" style={{ display: 'none' }} onChange={handleVideoUpload} />
              </label>
              {videoUrl && (
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  style={{ color: 'var(--admin-danger)', marginLeft: '8px' }}
                  onClick={() => {
                    setVideoUrl('');
                    setVideoPublicId('');
                  }}
                >
                  Remove Video
                </button>
              )}
            </div>

            {/* Live Video Preview */}
            {videoUrl && (
              <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', background: '#000', maxHeight: '320px' }}>
                <video src={videoUrl} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <button type="button" className="admin-btn admin-btn-primary" onClick={handleSaveMenuVideo}>
              Save Menu Video & Headers
            </button>
          </div>
        </div>
      )}

      {/* DISH CREATE / EDIT DRAWER */}
      {isDishDrawerOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsDishDrawerOpen(false)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                {editingDish ? `Edit "${editingDish.name}"` : 'Create New Dish'}
              </h2>
              <button
                type="button"
                onClick={() => setIsDishDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-drawer-body">
              {/* Dish Name */}
              <div className="admin-form-group">
                <label className="admin-label">Dish Name *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="Enter dish name"
                />
              </div>

              {/* Category & Scope */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Category *</label>
                  <select
                    className="admin-select"
                    value={dishForm.category_id}
                    onChange={(e) => setDishForm({ ...dishForm, category_id: e.target.value })}
                  >
                    <option value="" disabled hidden>Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Menu Scope</label>
                  <select
                    className="admin-select"
                    value={dishForm.scope}
                    onChange={(e) => setDishForm({ ...dishForm, scope: e.target.value })}
                  >
                    <option value="both">Both Menus</option>
                    <option value="special_only">Special Menu Only</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-textarea"
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>

              {/* Serving Note & Spice Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Serving Note</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={dishForm.serving_note || ''}
                    onChange={(e) => setDishForm({ ...dishForm, serving_note: e.target.value })}
                    placeholder="Enter serving note"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Spice Level</label>
                  <select
                    className="admin-select"
                    value={dishForm.spice_level}
                    onChange={(e) => setDishForm({ ...dishForm, spice_level: e.target.value })}
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="spicy">Spicy</option>
                    <option value="extra_spicy">Extra Spicy</option>
                  </select>
                </div>
              </div>

              {/* Price Type (Single vs Variants) */}
              <div className="admin-form-group">
                <label className="admin-label">Pricing Type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="price_type"
                      checked={dishForm.price_type === 'single'}
                      onChange={() => setDishForm({ ...dishForm, price_type: 'single' })}
                    />
                    <span>Single Price</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="price_type"
                      checked={dishForm.price_type === 'variants'}
                      onChange={() => setDishForm({ ...dishForm, price_type: 'variants' })}
                    />
                    <span>Variants (multiple sizes/portions)</span>
                  </label>
                </div>
              </div>

              {/* SINGLE PRICING FIELDS */}
              {dishForm.price_type === 'single' ? (
                <div style={{ background: 'var(--admin-surface-subtle)', padding: '16px', borderRadius: '12px', marginBottom: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="admin-label">
                        {dishForm.scope === 'special_only' ? 'Special Price (₹)' : 'Base Price (₹)'}
                      </label>
                      <input
                        type="number"
                        className="admin-input"
                        value={dishForm.base_price ?? ''}
                        onChange={(e) => setDishForm({ ...dishForm, base_price: e.target.value === '' ? '' : Number(e.target.value) })}
                        placeholder="Enter the amount"
                      />
                    </div>

                    {dishForm.scope !== 'special_only' && (
                      <div>
                        <label className="admin-label">
                          Special Menu Price (₹)
                          {dishForm.special_price_override !== null && (
                            <button
                              type="button"
                              onClick={() => setDishForm({ ...dishForm, special_price_override: null })}
                              style={{ background: 'none', border: 'none', color: 'var(--admin-accent)', fontSize: '11px', cursor: 'pointer', marginLeft: '6px' }}
                            >
                              Reset to auto
                            </button>
                          )}
                        </label>
                        <input
                          type="number"
                          className="admin-input"
                          value={
                            dishForm.special_price_override !== null
                              ? dishForm.special_price_override
                              : previewSpecialPrice
                          }
                          onChange={(e) =>
                            setDishForm({
                              ...dishForm,
                              special_price_override: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          placeholder="Enter the amount"
                        />
                      </div>
                    )}
                  </div>
                  {dishForm.scope !== 'special_only' && (
                    <div className="admin-hint">
                      Auto calculated with +{pricingSettings.markup}% markup & step ₹{pricingSettings.rounding}.
                    </div>
                  )}
                </div>
              ) : (
                /* VARIANTS PRICING FIELDS */
                <div style={{ background: 'var(--admin-surface-subtle)', padding: '16px', borderRadius: '12px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Variants Configuration</span>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() =>
                        setDishForm({
                          ...dishForm,
                          variants: [...dishForm.variants, { label: '', base_price: '' as any, special_price_override: null }],
                        })
                      }
                    >
                      + Add Variant
                    </button>
                  </div>

                  {dishForm.variants?.map((v: any, vIdx: number) => (
                    <div key={vIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Enter variant label"
                        value={v.label}
                        onChange={(e) => {
                          const updated = [...dishForm.variants];
                          updated[vIdx].label = e.target.value;
                          setDishForm({ ...dishForm, variants: updated });
                        }}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="Enter the amount"
                        value={v.base_price ?? ''}
                        onChange={(e) => {
                          const updated = [...dishForm.variants];
                          updated[vIdx].base_price = e.target.value === '' ? '' : Number(e.target.value);
                          setDishForm({ ...dishForm, variants: updated });
                        }}
                        style={{ width: '100px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = dishForm.variants.filter((_: any, i: number) => i !== vIdx);
                          setDishForm({ ...dishForm, variants: updated });
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* IMAGES UPLOAD (UP TO 5) */}
              <div className="admin-form-group">
                <label className="admin-label">Dish Images ({dishForm.images.length}/5)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {dishForm.images.map((img: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        position: 'relative',
                        width: '74px',
                        height: '74px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: i === 0 ? '2px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                      }}
                    >
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'var(--admin-accent)',
                            color: '#fff',
                            fontSize: '9px',
                            textAlign: 'center',
                            fontWeight: 700,
                          }}
                        >
                          COVER
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {dishForm.images.length < 5 && (
                    <label
                      style={{
                        width: '74px',
                        height: '74px',
                        border: '1.5px dashed var(--admin-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--admin-text-dim)',
                        fontSize: '11px',
                      }}
                    >
                      <Upload size={18} />
                      <span>{uploadingImage ? `${uploadProgress}%` : 'Upload'}</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFileChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* TAGS & BADGES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Dietary Tags</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '6px' }}>
                    <input
                      type="checkbox"
                      checked={dishForm.tags?.includes('veg')}
                      onChange={(e) => {
                        const tags = e.target.checked
                          ? [...(dishForm.tags || []), 'veg']
                          : (dishForm.tags || []).filter((t: string) => t !== 'veg');
                        setDishForm({ ...dishForm, tags });
                      }}
                    />
                    <span>100% Pure Veg</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={dishForm.tags?.includes('jain')}
                      onChange={(e) => {
                        const tags = e.target.checked
                          ? [...(dishForm.tags || []), 'jain']
                          : (dishForm.tags || []).filter((t: string) => t !== 'jain');
                        setDishForm({ ...dishForm, tags });
                      }}
                    />
                    <span>Jain Available</span>
                  </label>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Badges</label>
                  {["Chef's Special", "Best Seller", "New"].map((badge) => (
                    <label key={badge} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={dishForm.badges?.includes(badge)}
                        onChange={(e) => {
                          const badges = e.target.checked
                            ? [...(dishForm.badges || []), badge]
                            : (dishForm.badges || []).filter((b: string) => b !== badge);
                          setDishForm({ ...dishForm, badges });
                        }}
                      />
                      <span>{badge}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LIVE CARD PREVIEW IN DRAWER */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-text-dim)', textTransform: 'uppercase' }}>
                  Live Card Preview (Main vs Special)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  {/* Main Preview */}
                  <div style={{ background: 'var(--admin-surface-subtle)', padding: '12px', borderRadius: 'var(--admin-radius-sm)', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>MAIN MENU</div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{dishForm.name || 'Dish Name'}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--admin-text-main)', marginTop: '2px' }}>
                      {dishForm.scope === 'special_only' ? 'Not in Main' : `₹ ${dishForm.base_price}`}
                    </div>
                  </div>

                  {/* Special Preview */}
                  <div style={{ background: 'var(--admin-surface-subtle)', padding: '12px', borderRadius: 'var(--admin-radius-sm)', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-accent)', marginBottom: '4px' }}>SPECIAL MENU</div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{dishForm.name || 'Dish Name'}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--admin-accent)', fontWeight: 700, marginTop: '2px' }}>
                      ₹ {previewSpecialPrice}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-drawer-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsDishDrawerOpen(false)}>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleSaveDish}>
                {editingDish ? 'Save Changes' : 'Create Dish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY ADD/EDIT MODAL */}
      {isCatModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCatModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: 0 }}>
              {catForm.id ? 'Edit Category' : 'Add Shared Category'}
            </h2>

            <div className="admin-form-group">
              <label className="admin-label">Category Name *</label>
              <input
                type="text"
                className="admin-input"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Description (Optional)</label>
              <input
                type="text"
                className="admin-input"
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>

            <div className="admin-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={catForm.visible}
                  onChange={(e) => setCatForm({ ...catForm, visible: e.target.checked })}
                />
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Visible in Menus</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsCatModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleSaveCategory}>
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY DELETE CHOICE MODAL */}
      {deleteCatChoice && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-content">
            <h2 style={{ color: 'var(--admin-danger)', marginTop: 0 }}>Category Has Active Dishes</h2>
            <p style={{ color: 'var(--admin-text-muted)', lineHeight: 1.5 }}>
              This category currently contains <strong>{deleteCatChoice.dishCount}</strong> dishes. How would you like to handle them?
            </p>

            <div className="admin-form-group">
              <label className="admin-label">Option A: Reassign dishes to another category:</label>
              <select
                className="admin-select"
                value={reassignTargetCat}
                onChange={(e) => setReassignTargetCat(e.target.value)}
              >
                <option value="" disabled hidden>Select category</option>
                {categories
                  .filter((c) => c.id !== deleteCatChoice.catId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                style={{ marginTop: '10px' }}
                onClick={() => handleConfirmCategoryChoice(false)}
              >
                Reassign Dishes & Delete Category
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px', marginTop: '16px' }}>
              <label className="admin-label" style={{ color: 'var(--admin-danger)' }}>
                Option B: Delete category and all its dishes:
              </label>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => handleConfirmCategoryChoice(true)}
              >
                Delete Category AND All Dishes
              </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setDeleteCatChoice(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
