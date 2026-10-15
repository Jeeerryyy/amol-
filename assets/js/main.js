/**
 * Amol Veg Restro - Main Website Interactions (Minimal Professional)
 * Features: Sticky nav-dock shadow, animated hero entrance,
 * Curated Specialties showcase, and GSAP smooth reveal animations.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSpecialtiesTabs();
    initAmbienceCarousel();
    initGSAPAnimations();
    initScrollEffects();
  });

  // Sticky Nav-Dock Scroll State (subtle shadow on scroll)
  function initNavbar() {
    const header = document.querySelector('.nav-dock');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Interactive Signature Specialties on Homepage
  function initSpecialtiesTabs() {
    const tabs = document.querySelectorAll('.specialty-tab-btn');
    const container = document.getElementById('specialties-display-grid');
    if (!tabs.length || !container) return;

    const specialtyData = {
      popular: [
        { name: "Paneer Butter Masala", price: "₹220", cat: "Paneer Specials", img: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=600&auto=format&fit=crop&q=80", desc: "Tender cottage cheese cubes simmered in rich creamy butter tomato gravy.", tag: "Most Loved" },
        { name: "Veg Grill Sandwich", price: "₹70", cat: "Grill Sandwich", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80", desc: "Signature golden toasted sandwich with fresh vegetables and spiced green chutney.", tag: "Bestseller" },
        { name: "Farm House Pizza", price: "₹190", cat: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", desc: "Loaded with capsicum, onion, sweet corn, fresh tomato, and melted mozzarella.", tag: "Crisp & Cheesy" },
        { name: "Kaju Curry", price: "₹250", cat: "Kaju Special", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", desc: "Whole golden roasted cashews cooked in rich aromatic heritage gravy.", tag: "Royal Taste" }
      ],
      starters: [
        { name: "Paneer Sesame Satay", price: "₹230", cat: "Paneer Starters", img: "https://res.cloudinary.com/dmm2wpn5l/image/upload/v1784530962/qrscaniq/menu-items/obpfx1jjcuml0zldhcmn.jpg", desc: "Skewered marinated paneer cubes coated in crunchy sesame and glazed in savory sauce.", tag: "Chef Special" },
        { name: "Crispy Thread Paneer", price: "₹220", cat: "Paneer Starters", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80", desc: "Spiced paneer wrapped in delicate crunchy noodle threads, deep fried golden.", tag: "Crunchy" },
        { name: "Veg Manchurian Dry", price: "₹140", cat: "Chinese Starters", img: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80", desc: "Crisp vegetable dumplings wok-tossed in pungent garlic soy sauce and scallions.", tag: "Spicy & Tangy" },
        { name: "Veg Crispy", price: "₹190", cat: "Starters", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", desc: "Assorted vegetables battered light and fried crisp, tossed with fresh green chilies.", tag: "Crunchy Bite" }
      ],
      mains: [
        { name: "Paneer Kaju Masala", price: "₹220", cat: "Paneer Main Course", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", desc: "Rich Mughlai inspired combination of fresh paneer and cashews in golden gravy.", tag: "Rich Gravy" },
        { name: "Veg Kolhapuri", price: "₹160", cat: "Punjabi Dishes", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80", desc: "Authentic spicy Maharashtra specialty with mixed garden vegetables.", tag: "🌶️ Spicy" },
        { name: "Dal Tadka", price: "₹140", cat: "Main Course", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", desc: "Yellow lentils tempered with fragrant garlic, cumin seeds, and pure desi ghee.", tag: "Comfort Classic" },
        { name: "Veg Dum Biryani", price: "₹180", cat: "Rice & Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80", desc: "Fragrant basmati layered with seasonal vegetables, saffron, and whole spices.", tag: "Aromatic" }
      ],
      desserts: [
        { name: "Cold Coffee with Ice Cream", price: "₹130", cat: "Cold Coffee", img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80", desc: "Thick creamy blended cold coffee topped with a generous scoop of ice cream.", tag: "Frosty" },
        { name: "Brownie with Ice Cream", price: "₹130", cat: "Brownie", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80", desc: "Warm rich chocolate fudge brownie served with velvety vanilla ice cream.", tag: "Sweet Delight" },
        { name: "Oreo Milk Shake", price: "₹110", cat: "Milk Shake", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80", desc: "Crushed Oreo biscuits blended with chilled milk and chocolate drizzle.", tag: "Favorite" },
        { name: "Kit Kat Milk Shake", price: "₹110", cat: "Milk Shake", img: "https://images.unsplash.com/photo-1572442388796-11668ba67e53?w=600&auto=format&fit=crop&q=80", desc: "Crunchy wafer chocolate shake with smooth creamy texture.", tag: "Choco Treat" }
      ]
    };

    function renderSpecialties(type) {
      const items = specialtyData[type] || specialtyData.popular;
      container.innerHTML = items.map(dish => `
        <div class="dish-card">
          <div class="dish-thumb-box">
            <img src="${dish.img}" alt="${dish.name}" class="dish-thumb-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'">
            <div class="dish-badge-top-left">
              <span class="veg-indicator"><span class="veg-indicator-dot"></span></span>
            </div>
            <div class="dish-badge-top-right">
              <span class="badge-tag badge-bestseller">${dish.tag}</span>
            </div>
          </div>
          <div class="dish-card-body">
            <div>
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-gold-deep); text-transform: uppercase; margin-bottom: 2px;">${dish.cat}</div>
              <h3 class="dish-card-title">${dish.name}</h3>
              <p style="font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.45; margin: 4px 0 8px 0;">${dish.desc}</p>
            </div>
            <div class="dish-card-price-row">
              <span class="dish-card-price">${dish.price}</span>
              <a href="./menu.html?search=${encodeURIComponent(dish.name)}" class="dish-view-hint" title="View in digital menu">
                <span>View in Menu</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </a>
            </div>
          </div>
        </div>
      `).join('');

      if (window.gsap) {
        window.gsap.fromTo('#specialties-display-grid .dish-card',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
        );
      }
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.style.background = 'var(--color-surface)';
          t.style.color = 'var(--color-text-secondary)';
          t.style.borderColor = 'var(--color-border-subtle)';
        });
        tab.classList.add('active');
        tab.style.background = 'var(--color-text-primary)';
        tab.style.color = '#FFFFFF';
        tab.style.borderColor = 'var(--color-text-primary)';
        const tabType = tab.getAttribute('data-tab');
        renderSpecialties(tabType);
      });
    });

    // Initial render
    renderSpecialties('popular');
  }

  // Ambience Photo Carousel (auto-play, arrows, dots, swipe)
  function initAmbienceCarousel() {
    const carousel = document.getElementById('ambience-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.amb-track');
    const slides = carousel.querySelectorAll('.amb-slide');
    const prevBtn = carousel.querySelector('.amb-prev');
    const nextBtn = carousel.querySelector('.amb-next');
    const dots = carousel.querySelectorAll('.amb-dot');
    if (!track || !slides.length) return;

    let index = 0;
    let timer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startAuto() {
      if (reduceMotion || timer) return;
      timer = setInterval(next, 5500);
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); stopAuto(); startAuto(); });
    dots.forEach(d => {
      d.addEventListener('click', () => {
        goTo(parseInt(d.getAttribute('data-slide'), 10) || 0);
        stopAuto();
        startAuto();
      });
    });

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);

    // Touch swipe
    let touchX = null;
    track.addEventListener('touchstart', (e) => {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next(); else prev();
        stopAuto();
        startAuto();
      }
      touchX = null;
    }, { passive: true });

    // Keyboard arrows
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { prev(); stopAuto(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); stopAuto(); startAuto(); }
    });

    goTo(0);
    startAuto();

    // Pause autoplay off-screen or in a background tab (battery + calm UX)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) startAuto();
        else stopAuto();
      }, { threshold: 0.15 }).observe(carousel);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });
  }

  // GSAP Entrance and Scroll Animations
  function initGSAPAnimations() {
    if (!window.gsap) return;

    // Timeline entrance for Professional Hero
    const tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (document.querySelector('.hero')) {
      tl.from('.hero-media', { scale: 1.1, opacity: 0.8, duration: 1.2 })
        .from('.hero-kicker', { y: 20, opacity: 0, duration: 0.6 }, '-=0.8')
        .from('#hero-title', { y: 40, opacity: 0, duration: 0.9 }, '-=0.5')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5 }, '-=0.4')
        .from('.nav-dock', { y: -20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.scroll-cue', { opacity: 0, duration: 0.6 }, '-=0.3');
    }

    // Register ScrollTrigger if available
    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      window.gsap.utils.toArray('.pillar-box, .amb-carousel').forEach((box, i) => {
        window.gsap.from(box, {
          scrollTrigger: { trigger: box, start: 'top 85%' },
          y: 20,
          opacity: 0,
          duration: 0.5,
          delay: i * 0.1
        });
      });
    }
  }

  // ------------------------------------------------------------------------
  // Scroll & interaction effects: curtain, parallax hero, split headlines,
  // blur reveals, counters, clip-path, stacking deck, colour shift,
  // reactive marquee, magnetic buttons, tilt cards, cursor glow.
  // All gated behind reduced-motion + capability checks.
  // ------------------------------------------------------------------------
  function initScrollEffects() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // Always part the curtains (CSS hides them under reduced motion anyway)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.add('curtains-parted'));
    });
    setTimeout(() => {
      document.querySelectorAll('.curtain').forEach(c => c.remove());
    }, 1800);

    if (reduceMotion || !window.gsap) return;
    const hasST = !!window.ScrollTrigger;
    if (hasST) window.gsap.registerPlugin(window.ScrollTrigger);

    // Let CSS settle animations finish, then hand transforms to ScrollTrigger
    ['.hero-media', '.hero-title-wrap'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      const clear = () => { el.style.animation = 'none'; };
      el.addEventListener('animationend', clear, { once: true });
      setTimeout(clear, 2200);
    });

    // Hero title: character stagger on load (plays with the curtain)
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle && !heroTitle.querySelector('.ch')) {
      const text = heroTitle.textContent;
      heroTitle.textContent = '';
      [...text].forEach(ch => {
        if (ch === ' ') {
          heroTitle.appendChild(document.createTextNode(' '));
        } else {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = ch;
          heroTitle.appendChild(s);
        }
      });
      window.gsap.from('#hero-title .ch',
        { y: 70, opacity: 0, duration: 0.9, stagger: 0.035, ease: 'expo.out', delay: 0.45 });
    }

    if (!hasST) return;

    // Scroll-triggered hero transformation: parallax + zoom-through fade
    window.gsap.to('.hero-media', {
      yPercent: 16, scale: 1.14, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    window.gsap.to('.hero-title-wrap', {
      yPercent: -42, scale: 1.14, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '82% top', scrub: true }
    });
    window.gsap.to('.scroll-cue', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '30% top', scrub: true }
    });

    // Split-text headline reveals (word by word)
    document.querySelectorAll('.heading-section').forEach(h => {
      if (h.querySelector('.wi')) return;
      const words = h.textContent.trim().split(/\s+/);
      h.classList.add('split-words');
      h.innerHTML = words.map(w =>
        '<span class="w"><span class="wi">' + w + '</span></span>').join(' ');
      window.gsap.from(h.querySelectorAll('.wi'), {
        yPercent: 115, duration: 0.9, stagger: 0.07, ease: 'expo.out',
        scrollTrigger: { trigger: h, start: 'top 86%', once: true }
      });
    });

    // Blur-to-focus reveals
    window.gsap.utils.toArray(
      '.subheading-label, #story p, #location p, .stat, .amb-caption, .location-grid strong'
    ).forEach(el => {
      window.gsap.from(el, {
        filter: 'blur(10px)', y: 24, opacity: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    // Staggered grid reveal for dynamically rendered dish cards
    window.ScrollTrigger.batch('.dish-card', {
      start: 'top 92%', once: true,
      onEnter: batch => window.gsap.from(batch,
        { y: 34, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: true })
    });

    // Scroll-triggered counters
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseFloat(el.getAttribute('data-count')) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { v: 0 };
      window.ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => window.gsap.to(obj, {
          v: target, duration: 1.8, ease: 'expo.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
        })
      });
    });

    // Clip-path reveals (story photo + ambience carousel)
    ['.story-card-img', '.amb-viewport'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      window.gsap.fromTo(el,
        { clipPath: 'inset(10% 7% 10% 7% round 30px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
    });

    // Stacking deck (desktop only: mobile sections are taller than the
    // viewport, so pinning them would trap content mid-read)
    if (window.matchMedia('(min-width: 900px)').matches) {
      [['#story', '#ambience'], ['#ambience', '#location'], ['#location', '.site-footer']]
        .forEach(pair => {
          const curEl = document.querySelector(pair[0]);
          const nxtEl = document.querySelector(pair[1]);
          if (!curEl || !nxtEl) return;
          window.gsap.to(curEl, {
            scale: 0.955, filter: 'brightness(.96)', transformOrigin: 'center top', ease: 'none',
            scrollTrigger: { trigger: nxtEl, start: 'top bottom', end: 'top top+=120', scrub: true }
          });
        });
    }

    // Colour shift wash per section
    [['#specialties', ''], ['#story', ''], ['#ambience', 'sand'], ['#location', 'deep']]
      .forEach(pair => {
        const el = document.querySelector(pair[0]);
        const val = pair[1];
        if (!el) return;
        window.ScrollTrigger.create({
          trigger: el, start: 'top center', end: 'bottom center',
          onToggle: self => {
            if (self.isActive) {
              if (val) document.body.setAttribute('data-bg', val);
              else document.body.removeAttribute('data-bg');
            }
          }
        });
      });

    // Infinite marquee with scroll-velocity reaction
    const mTrack = document.querySelector('.marquee-track');
    if (mTrack) {
      const loop = window.gsap.to(mTrack, { xPercent: -50, ease: 'none', duration: 18, repeat: -1 });
      const clampTS = window.gsap.utils.clamp(-4, 6);
      window.ScrollTrigger.create({
        trigger: document.body, start: 0, end: 'max',
        onUpdate: self => loop.timeScale(clampTS(1 + self.getVelocity() / 2200))
      });
      window.gsap.ticker.add(() => {
        loop.timeScale(window.gsap.utils.interpolate(loop.timeScale(), 1, 0.06));
      });
    }

    // Magnetic hover buttons (desktop pointers only)
    if (finePointer) {
      document.querySelectorAll(
        '.hero-btn-primary, .hero-btn-ghost, .menu-button, .btn-primary, .btn-secondary, .amb-arrow'
      ).forEach(btn => {
        btn.classList.add('magnetic');
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - (r.left + r.width / 2);
          const y = e.clientY - (r.top + r.height / 2);
          window.gsap.to(btn, { x: x * 0.18, y: y * 0.22, duration: 0.4, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          window.gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        });
      });
    }

    // 3D card tilt on hover (dish cards render dynamically)
    if (finePointer) {
      const attachTilt = scope => {
        scope.querySelectorAll('.dish-card:not([data-tilt])').forEach(card => {
          card.setAttribute('data-tilt', '1');
          card.classList.add('tilt');
          card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
            const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
            window.gsap.to(card, { rotateX: rx, rotateY: ry, y: -4, duration: 0.4, ease: 'power2.out', transformPerspective: 800 });
          });
          card.addEventListener('mouseleave', () => {
            window.gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
          });
        });
      };
      attachTilt(document);
      const grid = document.getElementById('specialties-display-grid');
      if (grid && window.MutationObserver) {
        new window.MutationObserver(() => attachTilt(grid)).observe(grid, { childList: true });
      }
    }

    // Cursor glow spotlight (desktop pointers only)
    if (finePointer) {
      const glow = document.createElement('div');
      glow.id = 'cursor-glow';
      document.body.appendChild(glow);
      let gx = -400, gy = -400, tx = gx, ty = gy;
      window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      window.gsap.ticker.add(() => {
        gx += (tx - gx) * 0.08;
        gy += (ty - gy) * 0.08;
        glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)';
      });
    }
  }


})();
