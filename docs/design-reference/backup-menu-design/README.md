# 🍽️ Backup Menu Design (Independent Live Digital QR Menu)

This folder contains a 100% self-contained, offline-capable backup of the exact **Live Digital QR Menu** hosted on **`http://localhost:3001/demo/menu`** (or `https://menubook.in/demo/menu`).

---

## 📁 Files Included

- **`index.html`**: The complete, standalone single-file digital QR menu application. Runs directly in any web browser without needing Node.js, Next.js, or any backend server.
- **`restaurant_menu_data.json`**: Structured JSON data with the restaurant details, categories, and all 20 dishes (with prices, descriptions, tags, photo gallery links, and video links).
- **`README.md`**: Instructions for running, testing, and editing.

---

## ⚡ Features & Parity with Live Menu

1. **Exact Visual Identity**:
   - Hero banner with warm paper styling, photo background, and gradient overlay.
   - Branding: **nirvanaa studios**, **98603 35616**, **Review Us**, and headline *"Good Food, Better Mood."*
2. **Interactive Search**:
   - Live instantaneous search bar filtering all dishes by name, category, or ingredients.
3. **Smooth Category Navigation**:
   - Category navigation tabs: `All dishes`, `Sandwiches`, `Pizza & Sides`, `Burgers`, `Drinks & Desserts`, `Chinese`.
   - Auto-centering smooth scroll when clicking any category button.
   - When **All dishes** is active, items are organized by category with stylish section headers and dish counters.
4. **Master 4-Column Grid**:
   - Displays 4 dishes per row on desktop and mobile screens.
   - Card hover lift effect, dish tags (*Guest favourite*, *Most loved*, *House special*, *Freshly baked*), prices in rupees (`₹`), and green arrow icons.
5. **Interactive Dish Detail Modal**:
   - Multi-photo gallery and embedded video player with custom thumbnail tabs.
   - Click or double-click to enlarge in a full-screen image lightbox.
   - Badges: *Made with care*, *Freshly prepared*, *Customer favourite*.
   - **Order via WhatsApp**: Formatted `wa.me` link prefilled with dish name and price.
   - **Call Waiter**: Toast notification banner.
6. **Zero Dependencies**:
   - Uses standard HTML5, CSS3, and modern vanilla JavaScript.
   - No npm install, no build step, no server required.

---

## 🚀 How to Run

### Method 1: Direct Double-Click (Offline)
Simply double-click `index.html` in Windows File Explorer. It opens instantly in your default web browser (Chrome, Edge, Safari, Firefox).

### Method 2: Mobile Simulation
1. Open `index.html` in Chrome or Edge.
2. Press <kbd>F12</kbd> (or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>).
3. Toggle the Device Toolbar (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd>) to view the mobile dining table layout.

### Method 3: Static Hosting / Local Server
You can host this entire folder anywhere:
- **Python**: `python -m http.server 8080`
- **Node**: `npx serve .`
- **GitHub Pages / Netlify / Vercel**: Upload `index.html` directly as a static site.
