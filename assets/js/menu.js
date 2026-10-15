/**
 * Amol Veg Restro - Premium Editorial Digital Paper Menu Logic
 * 100% Pure Vegetarian Restaurant · Solapur
 * Strictly display-only: replaces physical paper menu.
 * Features:
 * - Instant debounced search (dishes, ingredients, categories)
 * - Curated primary category navigation with clean icons
 * - Live dish count toolbar with sorting dropdown (price, popularity, A-Z)
 * - Dynamic secondary category filter chips with accurate counts
 * - Pure veg dish cards with high-res photography and dietary indicators
 * - Dish preview lightbox modal
 */

(function () {
  'use strict';

  // State
  const menuData = window.AMOL_MENU_DATA || { categories: [] };
  let currentCategory = 'all';       // Secondary category id ('all' or 'cat_X')
  let activePrimaryFilter = 'all';   // Primary filter ('all', 'bestseller', 'spicy', 'paneer', 'starters', 'main', 'fastfood', 'drinks')
  let searchQuery = '';
  let currentSort = 'default';

  // DOM Elements
  const primaryCatButtons = document.querySelectorAll('.primary-cat-btn');
  const secondaryChipsContainer = document.getElementById('secondary-category-chips');
  const menuContainer = document.getElementById('menu-container');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const dishCountNum = document.getElementById('dish-count-num');
  const menuSortSelect = document.getElementById('menu-sort-select');
  const backToTopBtn = document.getElementById('back-to-top-btn');

  // Dish Preview Lightbox Elements (Multi-Media)
  const dishModalBackdrop = document.getElementById('dish-modal-backdrop');
  const dishModalClose = document.getElementById('dish-modal-close');
  const dishModalImg = document.getElementById('modal-dish-img');
  const dishModalVideo = document.getElementById('modal-dish-video');
  const modalVideoSource = document.getElementById('modal-video-source');
  const modalMediaCounter = document.getElementById('modal-media-counter');
  const modalMediaTypeBadge = document.getElementById('modal-media-type-badge');
  const modalMediaPrev = document.getElementById('modal-media-prev');
  const modalMediaNext = document.getElementById('modal-media-next');
  const modalGalleryThumbs = document.getElementById('modal-gallery-thumbs');
  const dishModalTitle = document.getElementById('modal-dish-title');
  const dishModalPrice = document.getElementById('modal-dish-price');
  const dishModalCategory = document.getElementById('modal-dish-category');
  const dishModalDesc = document.getElementById('modal-dish-desc');
  const dishModalBadges = document.getElementById('modal-dish-badges');

  // Multi-media gallery state
  let currentModalMediaList = [];
  let currentModalMediaIndex = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll a chip/button horizontally inside its own scroller ONLY.
  // Never touches vertical page scroll (unlike scrollIntoView, which
  // browsers may apply to every scrollable ancestor and fight the user).
  function scrollChipIntoView(container, el) {
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const delta = (eRect.left + eRect.width / 2) - (cRect.left + cRect.width / 2);
    if (Math.abs(delta) > 4) {
      container.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  // Initialize
  function init() {
    // Check URL parameters for direct deep-linking
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      searchQuery = searchParam;
      if (searchInput) searchInput.value = searchParam;
      if (searchClearBtn) searchClearBtn.style.display = 'flex';
    }

    const catParam = urlParams.get('cat');
    if (catParam) {
      currentCategory = catParam;
    }

    const filterParam = urlParams.get('filter');
    if (filterParam) {
      activePrimaryFilter = filterParam;
      primaryCatButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-primary-filter') === filterParam);
      });
    }

    renderSecondaryChips();
    renderMenu();
    bindEvents();
    initScrollSpy();
    ensurePageScrollable();
    window.addEventListener('pageshow', ensurePageScrollable);

    // Scroll to first dish if search parameter was supplied
    if (searchParam) {
      setTimeout(() => {
        const firstCard = document.querySelector('.dish-card');
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }

  // Check if an item matches the current search and primary filter
  function itemMatchesFilter(item, cat) {
    const query = searchQuery.trim().toLowerCase();

    // 1. Text search matching
    if (query) {
      const nameMatch = item.name.toLowerCase().includes(query);
      const catMatch = cat.name.toLowerCase().includes(query);
      const descMatch = item.description && item.description.toLowerCase().includes(query);
      if (!nameMatch && !catMatch && !descMatch) return false;
    }

    // 2. Primary category filter matching
    if (activePrimaryFilter === 'bestseller') return !!item.isBestseller;
    if (activePrimaryFilter === 'spicy') return !!item.isSpicy;
    if (activePrimaryFilter === 'paneer') {
      return item.name.toLowerCase().includes('paneer') || cat.name.toLowerCase().includes('paneer');
    }
    if (activePrimaryFilter === 'starters') {
      return cat.name.toLowerCase().includes('starter') || cat.name.toLowerCase().includes('soup');
    }
    if (activePrimaryFilter === 'main') {
      return cat.name.toLowerCase().includes('main') || 
             cat.name.toLowerCase().includes('punjabi') || 
             cat.name.toLowerCase().includes('kaju') ||
             cat.name.toLowerCase().includes('roti') ||
             cat.name.toLowerCase().includes('rice');
    }
    if (activePrimaryFilter === 'fastfood') {
      return cat.name.toLowerCase().includes('sandwich') || 
             cat.name.toLowerCase().includes('pizza') || 
             cat.name.toLowerCase().includes('burger') ||
             cat.name.toLowerCase().includes('french fries');
    }
    if (activePrimaryFilter === 'drinks') {
      return cat.name.toLowerCase().includes('coffee') || 
             cat.name.toLowerCase().includes('shake') || 
             cat.name.toLowerCase().includes('ice cream') ||
             cat.name.toLowerCase().includes('drink') ||
             cat.name.toLowerCase().includes('brownie');
    }

    return true; // 'all'
  }

  // Sort items according to active sort option
  function sortItems(items) {
    const sorted = [...items];
    switch (currentSort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popular':
        return sorted.sort((a, b) => {
          if (b.isBestseller && !a.isBestseller) return 1;
          if (a.isBestseller && !b.isBestseller) return -1;
          return parseFloat(b.rating || '4.5') - parseFloat(a.rating || '4.5');
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted; // preserve original catalog order
    }
  }

  // Render Secondary Category Filter Chips with actual dynamic counts
  function renderSecondaryChips() {
    if (!secondaryChipsContainer) return;

    // Calculate total count across all categories matching current query + primary filter
    let totalAllCount = 0;
    const catCounts = [];

    menuData.categories.forEach(cat => {
      const matchingCount = cat.items.filter(item => itemMatchesFilter(item, cat)).length;
      totalAllCount += matchingCount;
      catCounts.push({ id: cat.id, name: cat.name, count: matchingCount });
    });

    let html = `
      <button class="secondary-filter-chip ${currentCategory === 'all' ? 'active' : ''}" data-cat-id="all" type="button">
        <span>All Categories</span>
        <span class="chip-count-badge">${totalAllCount}</span>
      </button>
    `;

    catCounts.forEach(cat => {
      // Only show chip if it has items, or if currently active
      if (cat.count > 0 || currentCategory === cat.id) {
        const isActive = currentCategory === cat.id;
        html += `
          <button class="secondary-filter-chip ${isActive ? 'active' : ''}" data-cat-id="${cat.id}" type="button">
            <span>${cat.name}</span>
            <span class="chip-count-badge">${cat.count}</span>
          </button>
        `;
      }
    });

    secondaryChipsContainer.innerHTML = html;

    // Attach click handlers to secondary chips
    secondaryChipsContainer.querySelectorAll('.secondary-filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-cat-id');
        currentCategory = catId;

        // Update active class
        secondaryChipsContainer.querySelectorAll('.secondary-filter-chip').forEach(b => {
          b.classList.toggle('active', b === btn);
        });

        // Smooth scroll to category section or top without removing other categories from DOM
        if (catId === 'all') {
          const menuSection = document.getElementById('menu-container');
          if (menuSection) {
            const yOffset = -130;
            const y = menuSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          }
        } else {
          const section = document.getElementById(`section-${catId}`);
          if (section) {
            const yOffset = -130;
            const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          }
        }
      });
    });
  }

  // Filter and Render Menu Items
  function renderMenu() {
    if (!menuContainer) return;

    let totalVisible = 0;
    let html = '';

    // Always keep all matching categories in DOM so user can scroll down through all menus continuously!
    const categoriesToRender = menuData.categories;

    categoriesToRender.forEach(cat => {
      const visibleItems = cat.items.filter(item => itemMatchesFilter(item, cat));

      if (visibleItems.length === 0) return;
      totalVisible += visibleItems.length;

      const sortedItems = sortItems(visibleItems);

      html += `
        <section id="section-${cat.id}" class="category-block" style="margin-bottom: 3rem;">
          <div class="category-section-title-wrap">
            <h2 class="category-section-title">${cat.name}</h2>
            <span class="category-items-count-badge">${visibleItems.length} dishes</span>
          </div>
          <div class="menu-grid">
            ${sortedItems.map(item => createDishCardHTML(item)).join('')}
          </div>
        </section>
      `;
    });

    if (totalVisible === 0) {
      html = `
        <div style="text-align: center; padding: 4.5rem 1rem; color: #746D66;">
          <div style="font-size: 2.4rem; margin-bottom: 0.75rem;">🌿</div>
          <h3 class="font-serif" style="font-size: 1.5rem; color: #2B1B13; font-weight: 600;">No dishes found</h3>
          <p style="margin-top: 0.4rem; font-size: 0.95rem; color: #746D66; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
            We couldn't find any dishes matching "${searchQuery || 'your filters'}". Try searching for Paneer, Naan, Sandwich, or Biryani.
          </p>
          <button id="reset-filters-btn" class="btn-primary" style="margin-top: 1.4rem; cursor: pointer; border-radius: 4px; padding: 9px 20px;">
            Show All 279 Dishes
          </button>
        </div>
      `;
    }

    menuContainer.innerHTML = html;

    // Update real dish count in toolbar
    if (dishCountNum) {
      dishCountNum.textContent = totalVisible;
    }

    // Attach card click handlers for Dish Preview Lightbox
    menuContainer.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', () => {
        const itemId = card.getAttribute('data-item-id');
        const dish = findDishById(itemId);
        if (dish) {
          openDishPreviewModal(dish);
        }
      });

      // Keyboard accessibility (Enter or Space to open modal)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const itemId = card.getAttribute('data-item-id');
          const dish = findDishById(itemId);
          if (dish) {
            openDishPreviewModal(dish);
          }
        }
      });
    });

    // Reset button in empty state
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        activePrimaryFilter = 'all';
        currentCategory = 'all';
        currentSort = 'default';
        if (menuSortSelect) menuSortSelect.value = 'default';
        if (searchClearBtn) searchClearBtn.style.display = 'none';

        primaryCatButtons.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-primary-filter') === 'all');
        });

        renderSecondaryChips();
        renderMenu();
      });
    }

    // Subtle GSAP entrance if available
    if (window.gsap) {
      window.gsap.fromTo('.dish-card',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.24, stagger: 0.012, ease: 'power2.out' }
      );
    }
  }

  // Create HTML for a single dish card (Clean Minimal Editorial Style)
  function createDishCardHTML(item) {
    const fallbackImage = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
    const imgSrc = item.image || fallbackImage;

    return `
      <div class="dish-card" data-item-id="${item.id}" role="button" tabindex="0" aria-label="${item.name}, ₹${item.price}">
        <div class="dish-thumb-box">
          <img src="${imgSrc}" alt="${item.name}" class="dish-thumb-img" loading="lazy" onerror="this.src='${fallbackImage}'">
          <div class="dish-badge-top-left">
            <span class="veg-indicator" title="100% Pure Vegetarian">
              <span class="veg-indicator-dot"></span>
            </span>
          </div>
          ${item.isBestseller ? `
            <div class="dish-badge-top-right">
              <span class="badge-tag badge-bestseller">Popular</span>
            </div>
          ` : item.isSpicy ? `
            <div class="dish-badge-top-right">
              <span class="badge-tag badge-spicy">Spicy 🌶️</span>
            </div>
          ` : ''}
        </div>
        <div class="dish-card-body">
          <h3 class="dish-card-title">${item.name}</h3>
          <div class="dish-card-price-row">
            <span class="dish-card-price">₹${item.price}</span>
            <span class="dish-view-hint">
              <span>View</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </span>
          </div>
        </div>
      </div>
    `;
  }

  // Find dish by ID
  function findDishById(id) {
    for (const cat of menuData.categories) {
      const found = cat.items.find(i => i.id === id);
      if (found) {
        return { ...found, categoryName: cat.name };
      }
    }
    return null;
  }

  // Helper to generate multiple high-resolution dish images & video placeholder
  function getDishMediaList(dish) {
    const mainImg = dish.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80';
    
    // Curated high quality secondary & tertiary food photography by food family
    let secondaryImg = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80';
    let tertiaryImg = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80';

    const lowerName = (dish.name || '').toLowerCase();
    const lowerCat = (dish.categoryName || '').toLowerCase();

    if (lowerName.includes('paneer') || lowerCat.includes('paneer')) {
      secondaryImg = 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80';
    } else if (lowerName.includes('sandwich') || lowerCat.includes('sandwich')) {
      secondaryImg = 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80';
    } else if (lowerName.includes('pizza') || lowerCat.includes('pizza')) {
      secondaryImg = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80';
    } else if (lowerName.includes('shake') || lowerName.includes('coffee') || lowerCat.includes('shake') || lowerCat.includes('coffee')) {
      secondaryImg = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80';
    } else if (lowerName.includes('soup') || lowerCat.includes('soup')) {
      secondaryImg = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800&auto=format&fit=crop&q=80';
    } else if (lowerName.includes('biryani') || lowerName.includes('rice') || lowerCat.includes('rice')) {
      secondaryImg = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80';
    } else if (lowerName.includes('roti') || lowerName.includes('naan') || lowerName.includes('paratha') || lowerCat.includes('roti')) {
      secondaryImg = 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1505253758473-96b3015f27eb?w=800&auto=format&fit=crop&q=80';
    } else if (lowerName.includes('chinese') || lowerName.includes('manchurian') || lowerName.includes('noodle') || lowerCat.includes('chinese')) {
      secondaryImg = 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80';
      tertiaryImg = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80';
    }

    // High performance verified sample video
    const videoPlaceholder = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

    return [
      {
        type: 'image',
        url: mainImg,
        thumb: mainImg,
        tag: '📸 Main View',
        label: `${dish.name} - Signature Plating`
      },
      {
        type: 'image',
        url: secondaryImg,
        thumb: secondaryImg,
        tag: '🔍 Close-up',
        label: `${dish.name} - Texture & Garnish`
      },
      {
        type: 'image',
        url: tertiaryImg,
        thumb: tertiaryImg,
        tag: '🍲 Kitchen Prep',
        label: `${dish.name} - Fresh Preparation`
      },
      {
        type: 'video',
        url: videoPlaceholder,
        thumb: mainImg,
        tag: '🎥 Video Reel',
        label: `${dish.name} - Sizzle Video`
      }
    ];
  }

  // Switch modal media display (0..N-1)
  function showModalMedia(index) {
    if (!currentModalMediaList || currentModalMediaList.length === 0) return;
    currentModalMediaIndex = (index + currentModalMediaList.length) % currentModalMediaList.length;
    const media = currentModalMediaList[currentModalMediaIndex];

    if (modalMediaCounter) {
      modalMediaCounter.textContent = `${currentModalMediaIndex + 1} / ${currentModalMediaList.length}`;
    }

    if (modalMediaTypeBadge) {
      modalMediaTypeBadge.textContent = media.tag;
    }

    if (media.type === 'video') {
      if (dishModalImg) dishModalImg.style.display = 'none';
      if (dishModalVideo) {
        dishModalVideo.style.display = 'block';
        if (modalVideoSource && modalVideoSource.src !== media.url) {
          modalVideoSource.src = media.url;
          dishModalVideo.load();
        }
        dishModalVideo.play().catch(() => {});
      }
    } else {
      if (dishModalVideo) {
        dishModalVideo.pause();
        dishModalVideo.style.display = 'none';
      }
      if (dishModalImg) {
        dishModalImg.style.display = 'block';
        dishModalImg.src = media.url;
        dishModalImg.alt = media.label;
      }
    }

    // Update active thumbnail
    if (modalGalleryThumbs) {
      modalGalleryThumbs.querySelectorAll('.modal-thumb-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === currentModalMediaIndex);
      });
    }
  }

  // Open Dish Preview Lightbox (View Only with Multi-Media Gallery)
  function openDishPreviewModal(dish) {
    if (!dishModalBackdrop) return;

    currentModalMediaList = getDishMediaList(dish);
    currentModalMediaIndex = 0;

    // Render thumbnail buttons
    if (modalGalleryThumbs) {
      modalGalleryThumbs.innerHTML = currentModalMediaList.map((m, idx) => `
        <button class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" type="button" data-media-idx="${idx}" aria-label="${m.label}">
          <img src="${m.thumb}" alt="${m.label}" class="modal-thumb-img" loading="lazy">
          ${m.type === 'video' ? '<span class="modal-thumb-video-badge">▶</span>' : ''}
        </button>
      `).join('');

      modalGalleryThumbs.querySelectorAll('.modal-thumb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-media-idx'), 10);
          showModalMedia(idx);
        });
      });
    }

    showModalMedia(0);

    if (dishModalTitle) dishModalTitle.textContent = dish.name;
    if (dishModalPrice) dishModalPrice.textContent = `₹${dish.price}`;
    if (dishModalCategory) dishModalCategory.textContent = dish.categoryName || 'Amol Veg Restro';
    if (dishModalDesc) {
      dishModalDesc.textContent = dish.description ||
        "Carefully prepared in our 100% pure vegetarian kitchen using fresh farm ingredients, pure ghee, and authentic Indian spices.";
    }

    if (dishModalBadges) {
      let badgesHtml = `
        <span class="veg-pill" style="border-radius: 4px; padding: 3px 10px;">
          <span class="veg-indicator-dot"></span> 100% Pure Veg
        </span>
      `;
      if (dish.isBestseller) {
        badgesHtml += `<span class="badge-tag badge-bestseller" style="font-size: 0.72rem; padding: 4px 10px;">⭐ Popular Special</span>`;
      }
      if (dish.isSpicy) {
        badgesHtml += `<span class="badge-tag badge-spicy" style="font-size: 0.72rem; padding: 4px 10px;">🌶️ Spicy Delight</span>`;
      }
      dishModalBadges.innerHTML = badgesHtml;
    }

    dishModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Close Dish Preview Modal
  function closeDishModal() {
    if (dishModalBackdrop) {
      dishModalBackdrop.classList.remove('open');
    }
    if (dishModalVideo) {
      dishModalVideo.pause();
    }
    document.body.style.overflow = '';
  }

  // Safety net: never leave the page scroll-locked (e.g. bfcache restore
  // while the lightbox was open, or a missed close path).
  function ensurePageScrollable() {
    if (!dishModalBackdrop || !dishModalBackdrop.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  // Bind All Event Handlers
  function bindEvents() {
    // 1. Search input (debounced 160ms)
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchQuery = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
        }
        searchTimeout = setTimeout(() => {
          renderSecondaryChips();
          renderMenu();
        }, 160);
      });
    }

    // 2. Clear search button
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        renderSecondaryChips();
        renderMenu();
      });
    }

    // 3. Primary category navigation buttons
    primaryCatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        primaryCatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePrimaryFilter = btn.getAttribute('data-primary-filter');
        currentCategory = 'all'; // reset to all secondary categories under this filter

        renderSecondaryChips();
        renderMenu();

        // Keep the tapped button visible inside its own horizontal scroller
        scrollChipIntoView(btn.closest('.menu-primary-categories'), btn);
      });
    });

    // 4. Sort select dropdown
    if (menuSortSelect) {
      menuSortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderMenu();
      });
    }

    // 5. Dish modal close triggers
    if (dishModalClose) {
      dishModalClose.addEventListener('click', closeDishModal);
    }
    if (dishModalBackdrop) {
      dishModalBackdrop.addEventListener('click', (e) => {
        if (e.target === dishModalBackdrop) {
          closeDishModal();
        }
      });
    }

    // 6. Modal Media Navigation Controls
    if (modalMediaPrev) {
      modalMediaPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showModalMedia(currentModalMediaIndex - 1);
      });
    }
    if (modalMediaNext) {
      modalMediaNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showModalMedia(currentModalMediaIndex + 1);
      });
    }

    // 7. Escape key and arrow keys
    window.addEventListener('keydown', (e) => {
      if (dishModalBackdrop && dishModalBackdrop.classList.contains('open')) {
        if (e.key === 'Escape') {
          closeDishModal();
        } else if (e.key === 'ArrowLeft') {
          showModalMedia(currentModalMediaIndex - 1);
        } else if (e.key === 'ArrowRight') {
          showModalMedia(currentModalMediaIndex + 1);
        }
      }
    });

    // 8. Floating Back to top button
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 450) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }, { passive: true });

      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Active Category ScrollSpy for secondary navigation
  function initScrollSpy() {
    if (!secondaryChipsContainer) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveChipOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function updateActiveChipOnScroll() {
    const sections = document.querySelectorAll('.category-block');
    let currentId = null;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 200 && rect.bottom >= 120) {
        currentId = sec.id.replace('section-', '');
      }
    });

    if (currentId) {
      const activeChip = secondaryChipsContainer.querySelector(`[data-cat-id="${currentId}"]`);
      if (activeChip && !activeChip.classList.contains('active')) {
        secondaryChipsContainer.querySelectorAll('.secondary-filter-chip').forEach(b => b.classList.remove('active'));
        activeChip.classList.add('active');
        scrollChipIntoView(secondaryChipsContainer, activeChip);
      }
    }
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
