// script.js - merged enhanced frontend (services, filters, pagination, bookings, auth)

// -------- Config & API base ----------
const API_BASE = "https://omnifix-backend.onrender.com"; // change when deployed
// expose for console debugging
window.API_BASE = API_BASE;

// -------- Demo dataset fallback (kept for offline fallback) ----------
let SERVICES = [
  { id:1, title:"Home Cleaning (1 BHK)", price:699, rating:4.7, short:"Basic deep clean for 1 BHK", category:"cleaning", icon:"🧹", color:"#f97316", desc:"Vacuuming, mopping, dusting, bathroom & kitchen sanitization. Supplies included." },
  { id:2, title:"Home Cleaning (2 BHK)", price:1099, rating:4.8, short:"Deep clean for 2 BHK", category:"cleaning", icon:"🧼", color:"#f59e0b", desc:"Complete cleaning of 2 BHK, includes sanitization, dust removal and floor care." },
  { id:3, title:"Home Cleaning (3 BHK+)", price:1499, rating:4.8, short:"Deep clean for 3 BHK and above", category:"cleaning", icon:"🧽", color:"#fb923c", desc:"Full house deep-cleaning, sanitization and stain removal. Ideal for move-in/out." },

  { id:4, title:"AC Service (Split/Window)", price:899, rating:4.6, short:"Cleaning, coil check & gas top-up", category:"ac", icon:"❄️", color:"#06b6d4", desc:"Filter clean, coil cleaning, gas top-up (if needed) and performance check." },
  { id:5, title:"AC Installation", price:1499, rating:4.5, short:"Install indoor + outdoor units", category:"ac", icon:"🧰", color:"#60a5fa", desc:"Professional mounting, bracket fix, copper line & vacuuming. Includes testing." },

  { id:6, title:"Electrician - Basic", price:399, rating:4.4, short:"Switch/plug/fan fixes", category:"electrical", icon:"💡", color:"#f59e0b", desc:"Wiring fixes, switchboard repair, light and fan installation." },
  { id:7, title:"Electrician - Full Wiring", price:2499, rating:4.5, short:"Partial/full house rewiring", category:"electrical", icon:"⚡", color:"#f97316", desc:"Professional rewiring, MCB installation and safety checks with warranty." },

  { id:8, title:"Plumbing - Leak Fix", price:499, rating:4.5, short:"Leak repairs & pipe fix", category:"plumbing", icon:"🔧", color:"#0ea5a4", desc:"Fix leaking taps, joints, pipe replacement and minor bathroom repairs." },
  { id:9, title:"Plumbing - Installations", price:899, rating:4.5, short:"Fitting, cisterns and faucets", category:"plumbing", icon:"🚿", color:"#0284c7", desc:"Washbasin, shower, cistern installation, faucet change and fittings." },

  { id:10, title:"Carpentry - Minor", price:599, rating:4.3, short:"Shelves, hinges & small fixes", category:"carpentry", icon:"🪚", color:"#7c3aed", desc:"Minor carpentry: shelf mounting, hinge replacement and small furniture repair." },
  { id:11, title:"Carpentry - Custom", price:2499, rating:4.6, short:"Custom cabinets & wardrobes", category:"carpentry", icon:"🛠️", color:"#6d28d9", desc:"Custom furniture, wardrobes, shelving and finish work by skilled carpenters." },

  { id:12, title:"Pest Control - Basic", price:899, rating:4.7, short:"Cockroach & general pests", category:"pest", icon:"🪳", color:"#ef4444", desc:"One-time home pest control for roaches and common pests with safe chemicals." },
  { id:13, title:"Pest Control - Termite", price:2999, rating:4.8, short:"Termite treatment & inspection", category:"pest", icon:"🐜", color:"#dc2626", desc:"Termite inspection and chemical treatment with warranty options." },

  { id:14, title:"Appliance Repair - Refrigerator", price:999, rating:4.6, short:"Fridge repair & gas top-up", category:"appliance", icon:"🧊", color:"#06b6d4", desc:"Compressor check, gas top-up, cooling issues and part replacement." },
  { id:15, title:"Appliance Repair - Washing Machine", price:799, rating:4.5, short:"Service & repair (front/top)", category:"appliance", icon:"🧺", color:"#7dd3fc", desc:"Drum check, motor, water inlet and electronic fault repairs." },
  { id:16, title:"Appliance Repair - Microwave/OTG", price:499, rating:4.4, short:"Heating & power faults", category:"appliance", icon:"🍳", color:"#f4b4c0", desc:"Heating element change, plate repairs and electronic diagnostics." },

  { id:17, title:"Sofa/Carpet Cleaning", price:1299, rating:4.7, short:"Deep sofa & carpet shampoo", category:"cleaning", icon:"🛋️", color:"#f472b6", desc:"Hot-water extraction, deep shampooing and stain removal for upholstery." },
  { id:18, title:"Chimney Cleaning & Repair", price:699, rating:4.5, short:"Chimney oil/grease cleaning", category:"cleaning", icon:"🔥", color:"#fb7185", desc:"Degreasing, filter change and motor check for kitchen chimneys." },

  { id:19, title:"Water Purifier Service", price:499, rating:4.6, short:"RO/UV filter replacement & check", category:"plumbing", icon:"💧", color:"#0ea5a4", desc:"Filter change, membrane check, sanitizer flush for RO/UV systems." },
  { id:20, title:"TV/Audio Mounting", price:699, rating:4.5, short:"TV wall mount and setup", category:"electrical", icon:"📺", color:"#60a5fa", desc:"Wall mounting, cable hiding, audio system setup and testing." },

  { id:21, title:"Home Painting - Single Room", price:3999, rating:4.6, short:"Interior painting for 1 room", category:"painting", icon:"🎨", color:"#f97316", desc:"Surface prep, primer and two coats of premium paint; touchups included." },
  { id:22, title:"Home Painting - Full Home", price:14999, rating:4.7, short:"Full house interior painting", category:"painting", icon:"🖌️", color:"#fb923c", desc:"Complete home repaint with color consult, primer & high-quality paints." },

  { id:23, title:"Home Shifting - Packing", price:2499, rating:4.4, short:"Local packing & loading", category:"moving", icon:"📦", color:"#94a3b8", desc:"Packing, loading and short-distance shifting with insurance options." },
  { id:24, title:"Gardening & Lawn Care", price:899, rating:4.5, short:"Pruning, mowing & weeding", category:"garden", icon:"🌿", color:"#10b981", desc:"Lawn mowing, plant pruning, fertilizing and garden maintenance." }
];

// -------- Internal state (services + pagination) ----------
let allServices = [];        // canonical from backend (preferred)
let visibleServices = [];    // after filters/sort
let page = 1;
let pageSize = 12;
let maxShown = pageSize;

// -------- DOM refs ----------
const servicesGrid = document.getElementById('services-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const resultsCount = document.getElementById('results-count');

const sortSelect = document.getElementById('sort-select');
const ratingSelect = document.getElementById('rating-select');
const pageSizeSelect = document.getElementById('page-size');
const loadMoreBtn = document.getElementById('load-more');
const categoryTiles = document.getElementById('category-tiles');

const drawer = document.getElementById('details-drawer');
const drawerBody = document.getElementById('drawer-body');
const drawerClose = document.getElementById('drawer-close');
const drawerBook = document.getElementById('drawer-book');
const drawerOpenPage = document.getElementById('drawer-open-page');

const modal = document.getElementById('modal');
const modalDesc = document.getElementById('modal-desc');
const bookingForm = document.getElementById('booking-form');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');

const toast = document.getElementById('toast');
const yearSpan = document.getElementById('year');
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
const bookNowBtn = document.getElementById('book-now');

// My bookings elements (if present)
const bookingsSection = document.getElementById('my-bookings-section');
const bookingsList = document.getElementById('my-bookings-list');
const noBookingsNotice = document.getElementById('no-bookings');
const bookingsCloseBtn = document.getElementById('bookings-close');

yearSpan.textContent = new Date().getFullYear();
priceValue && (priceValue.textContent = `₹${priceRange?.value || 0}`);

// ---------- utilities ----------
function debounce(fn, wait=200){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=> fn(...a), wait); }; }
function stars(r){ const filled = Math.round(r || 0); return '★'.repeat(Math.max(0, filled)) + '☆'.repeat(Math.max(0, 5-filled)); }
function showToast(msg, ms=3000){ if(!toast){ console.log('Toast:', msg); return; } toast.textContent = msg; toast.classList.add('show'); toast.setAttribute('aria-hidden','false'); setTimeout(()=>{ toast.classList.remove('show'); toast.setAttribute('aria-hidden','true'); }, ms); }

// -------- Authentication helpers (kept from your previous script) --------
const authModal = document.getElementById('auth-modal');
const authClose = document.getElementById('auth-close');
const switchToLogin = document.getElementById('switch-to-login');
const switchToRegister = document.getElementById('switch-to-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function openAuthView(mode = 'register'){
  if(!authModal) return;
  authModal.setAttribute('aria-hidden','false');
  authModal.style.display = 'flex';
  const regView = document.getElementById('register-view');
  const loginView = document.getElementById('login-view');
  if(mode === 'login'){
    regView && regView.classList.add('hidden');
    loginView && loginView.classList.remove('hidden');
    setTimeout(()=> document.getElementById('login-email')?.focus(), 40);
  } else {
    loginView && loginView.classList.add('hidden');
    regView && regView.classList.remove('hidden');
    setTimeout(()=> document.getElementById('reg-name')?.focus(), 40);
  }
}
function closeAuth(){
  if(!authModal) return;
  authModal.setAttribute('aria-hidden','true');
  authModal.style.display = 'none';
  document.getElementById('register-view')?.classList.remove('hidden');
  document.getElementById('login-view')?.classList.add('hidden');
  registerForm?.reset?.(); loginForm?.reset?.();
}
authClose?.addEventListener('click', closeAuth);
switchToLogin?.addEventListener('click', ()=> openAuthView('login'));
switchToRegister?.addEventListener('click', ()=> openAuthView('register'));

function saveAuth(token, user){
  localStorage.setItem('omnifix_token', token);
  localStorage.setItem('omnifix_user', JSON.stringify(user));
  setCurrentUser(user);
  updateHeaderAuth();
}
function getCurrentUser(){
  try { return JSON.parse(localStorage.getItem('omnifix_user') || 'null'); }
  catch(e){ return null; }
}
function setCurrentUser(user){
  if(!user) {
    localStorage.removeItem('omnifix_user');
    return updateHeaderAuth();
  }
  localStorage.setItem('omnifix_user', JSON.stringify(user));
  updateHeaderAuth();
}
function logoutUser(){
  localStorage.removeItem('omnifix_user');
  localStorage.removeItem('omnifix_token');
  updateHeaderAuth();
  showToast('Logged out');
}

// register/login listeners (call backend)
registerForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pw = document.getElementById('reg-password').value;
  if(!name || !email || !pw){ showToast('Please fill all fields'); return; }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pw })
    });
    const body = await res.json().catch(()=>null);
    if(!res.ok){
      const msg = body?.message || (body?.errors && body.errors[0]?.msg) || 'Registration failed';
      showToast(msg);
      return;
    }
    saveAuth(body.token, body.user);
    showToast(`Welcome, ${body.user.name || body.user.email}`);
    closeAuth();
  } catch (err) {
    console.error('Registration error', err);
    showToast('Network error');
  }
});

loginForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pw = document.getElementById('login-password').value;
  if(!email || !pw){ showToast('Please fill both fields'); return; }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw })
    });
    const body = await res.json().catch(()=>null);
    if(!res.ok){
      const msg = body?.message || (body?.errors && body.errors[0]?.msg) || 'Login failed';
      showToast(msg);
      return;
    }
    saveAuth(body.token, body.user);
    showToast(`Welcome back, ${body.user.name || body.user.email}`);
    closeAuth();
  } catch (err) {
    console.error('Login error', err);
    showToast('Network / login error');
  }
});

// ---------- header auth UI (keeps your original behavior) ----------
function updateHeaderAuth(){
  const headerActions = document.querySelector('.header-actions');
  if(!headerActions) return;
  headerActions.querySelectorAll('.auth-inserted')?.forEach(n => n.remove());

  const user = getCurrentUser();
  if(!user){
    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn auth-inserted';
    loginBtn.textContent = 'Login';
    loginBtn.addEventListener('click', ()=> openAuthView('login'));

    const regBtn = document.createElement('button');
    regBtn.className = 'btn btn-ghost auth-inserted';
    regBtn.textContent = 'Register';
    regBtn.addEventListener('click', ()=> openAuthView('register'));

    headerActions.insertBefore(loginBtn, headerActions.firstChild);
    headerActions.insertBefore(regBtn, headerActions.firstChild);
  } else {
    const wrapper = document.createElement('div');
    wrapper.className = 'header-account auth-inserted';
    wrapper.style.position = 'relative';

    const pill = document.createElement('div');
    pill.className = 'account-pill';
    const avatar = document.createElement('div');
    avatar.className = 'account-avatar';
    const initials = (user.name || user.email || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
    avatar.style.background = '#4f46e5';
    avatar.textContent = initials;

    const txt = document.createElement('div');
    txt.textContent = user.name || user.email;

    pill.appendChild(avatar);
    pill.appendChild(txt);

    const menu = document.createElement('div');
    menu.className = 'account-menu';
    menu.innerHTML = `
      <div style="padding:6px 10px;font-weight:700">${user.name}</div>
      <button id="account-logout">Logout</button>
    `;
    wrapper.appendChild(pill);
    wrapper.appendChild(menu);
    headerActions.insertBefore(wrapper, headerActions.firstChild);

    pill.addEventListener('click', ()=> menu.classList.toggle('show'));
    document.getElementById('account-logout').addEventListener('click', ()=> {
      logoutUser();
      menu.classList.remove('show');
    });

    // add "My Bookings" entry if bookings UI exists
    if(menu && !menu.querySelector('.my-bookings-link') && bookingsSection){
      const node = document.createElement('button');
      node.className = 'my-bookings-link';
      node.style.display = 'block';
      node.style.padding = '8px 10px';
      node.style.border = 'none';
      node.style.background = 'transparent';
      node.style.cursor = 'pointer';
      node.textContent = 'My Bookings';
      node.addEventListener('click', ()=> {
        menu.classList.remove('show');
        loadAndShowBookings();
      });
      menu.insertBefore(node, menu.firstChild);
    }
  }

  // ensure the permanent header booking button is created (if logged in)
  try { ensureHeaderBookingsButton(); } catch(e){ /* ignore */ }
}

// Permanent header bookings button helper
function ensureHeaderBookingsButton(){
  const headerActions = document.querySelector('.header-actions');
  if(!headerActions) return;
  // remove existing duplicates
  document.querySelectorAll('.header-bookings-btn')?.forEach(n=>n.remove());

  const user = getCurrentUser();
  if(!user) return; // only show to logged-in users

  const btn = document.createElement('button');
  btn.className = 'btn header-bookings-btn';
  btn.style.marginRight = '8px';
  btn.textContent = 'My Bookings';
  btn.addEventListener('click', ()=> {
    loadAndShowBookings();
  });

  const bookNow = document.getElementById('book-now');
  if(bookNow) headerActions.insertBefore(btn, bookNow);
  else headerActions.appendChild(btn);
}

// protect booking: if user not logged in, open login modal
function ensureAuthThen(fn){
  const u = getCurrentUser();
  if(u) return fn();
  openAuthView('login');
}

// ---------- rendering services (grid) ----------
function renderServices(list){
  servicesGrid && (servicesGrid.innerHTML = '');
  if(!list || !list.length){
    if(servicesGrid) servicesGrid.innerHTML = `<div class="muted">No services match your filter.</div>`;
    resultsCount && (resultsCount.textContent = `Showing 0 results`);
    loadMoreBtn && (loadMoreBtn.style.display = 'none');
    return;
  }
  resultsCount && (resultsCount.textContent = `Showing ${Math.min(maxShown, list.length)} of ${list.length} results`);

  const toShow = list.slice(0, maxShown);
  toShow.forEach(s=>{
    const el = document.createElement('article');
    el.className = 'card-service';
    el.innerHTML = `
      <div class="card-top">
        <div class="icon-circle" style="background:${s.color}">${s.icon}</div>
        <div class="card-body">
          <div class="service-title">${s.title}</div>
          <div class="service-desc">${s.short}</div>
        </div>
      </div>
      <div class="card-footer">
        <div>
          <div class="price">₹${s.price}</div>
          <div class="rating" aria-hidden="true">${stars(s.rating)}</div>
        </div>
        <div class="actions">
          <button class="small-btn details-btn" data-id="${s.id}">Details</button>
          <button class="small-btn btn-primary book-btn" data-id="${s.id}">Book</button>
        </div>
      </div>
    `;
    servicesGrid && servicesGrid.appendChild(el);
  });

  // load-more toggle
  if(loadMoreBtn) loadMoreBtn.style.display = (maxShown < list.length) ? 'inline-block' : 'none';

  // attach events
  rewireDetailsButtons();
  rewireBookButtons();
}

// ---------- filters / sort / pagination ----------
function applyFilters(){
  const q = (searchInput?.value || '').trim().toLowerCase();
  const cat = (categorySelect?.value || '').trim();
  const maxPrice = +priceRange?.value || Infinity;
  const minRating = +ratingSelect?.value || 0;
  const sortBy = sortSelect?.value || 'default';

  const source = (allServices && allServices.length>0) ? allServices : SERVICES;

  visibleServices = (source || []).filter(s=>{
    if(cat && s.category !== cat) return false;
    if(s.price > maxPrice) return false;
    if(s.rating < minRating) return false;
    if(q && !(`${s.title} ${s.short} ${s.desc}`.toLowerCase().includes(q))) return false;
    return true;
  });

  // sort
  if(sortBy === 'price-asc') visibleServices.sort((a,b)=> a.price - b.price);
  else if(sortBy === 'price-desc') visibleServices.sort((a,b)=> b.price - a.price);
  else if(sortBy === 'rating-desc') visibleServices.sort((a,b)=> b.rating - a.rating);

  // reset pagination
  page = 1;
  pageSize = +pageSizeSelect?.value || pageSize;
  maxShown = pageSize;
  renderServices(visibleServices);
}

// ---------- category tiles ----------
function getCategoriesList(){
  const source = (allServices && allServices.length>0) ? allServices : SERVICES;
  const map = {};
  source.forEach(s => {
    const c = s.category || 'other';
    if(!map[c]) map[c] = { count:0, sample: s };
    map[c].count++;
  });
  return Object.keys(map).map(k => ({ key:k, count: map[k].count, sample: map[k].sample }));
}
function renderCategoryTiles(){
  if(!categoryTiles) return;
  const cats = getCategoriesList().sort((a,b)=> b.count - a.count);
  categoryTiles.innerHTML = '';
  // All tile
  const allNode = document.createElement('button');
  allNode.className = 'cat-tile active';
  allNode.textContent = 'All';
  allNode.addEventListener('click', ()=> {
    categorySelect && (categorySelect.value = '');
    document.querySelectorAll('.cat-tile')?.forEach(n=>n.classList.remove('active'));
    allNode.classList.add('active');
    applyFilters();
  });
  categoryTiles.appendChild(allNode);

  cats.forEach(c=>{
    const n = document.createElement('button');
    n.className = 'cat-tile';
    n.innerHTML = `<div class="cat-icon" style="background:${c.sample.color || '#7c3aed'}">${c.sample.icon || '🔧'}</div><div class="cat-name">${c.key}<div class="cat-count">${c.count}</div></div>`;
    n.addEventListener('click', ()=> {
      categorySelect && (categorySelect.value = c.key);
      document.querySelectorAll('.cat-tile')?.forEach(nn=>nn.classList.remove('active'));
      n.classList.add('active');
      applyFilters();
      document.getElementById('services')?.scrollIntoView({behavior:'smooth', block:'start'});
    });
    categoryTiles.appendChild(n);
  });
}

// ---------- drawer (details) ----------
let currentService = null;
function openDrawer(service){
  currentService = service;
  if(!drawerBody) return;
  drawerBody.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <div style="width:64px;height:64px;border-radius:12px;background:${service.color};display:flex;align-items:center;justify-content:center;font-size:28px">${service.icon}</div>
      <div>
        <div style="font-weight:700;font-size:16px">${service.title}</div>
        <div style="color:var(--muted);font-size:13px">${service.category} • ₹${service.price} • ${service.rating} ★</div>
      </div>
    </div>
    <div style="margin-top:12px;color:var(--muted);line-height:1.45">${service.desc}</div>
  `;
  drawer && drawer.setAttribute('aria-hidden','false');
  if(drawer) drawer.style.transform = 'translateX(0)';
  if(drawerOpenPage) drawerOpenPage.href = `service.html?id=${service.id}`;
}
function closeDrawer(){
  drawer && drawer.setAttribute('aria-hidden','true');
  if(drawer) drawer.style.transform = 'translateX(100%)';
  currentService = null;
}
drawerClose?.addEventListener('click', closeDrawer);

// drawer book handler
drawerBook?.addEventListener('click', ()=> {
  if(currentService) ensureAuthThen(()=> openModal(currentService));
});

// ---------- modal (booking) ----------
function openModal(service){
  currentService = service;
  const user = getCurrentUser();
  if(!user){
    openAuthView('login');
    showToast('Please login to continue booking');
    return;
  }

  modalDesc && (modalDesc.textContent = `${service.title} — ${service.short}`);
  modal && modal.setAttribute('aria-hidden','false');
  if(modal) modal.style.display = 'flex';
  document.getElementById('customer-name')?.focus();
}
function closeModal(){
  modal && modal.setAttribute('aria-hidden','true');
  if(modal) modal.style.display = 'none';
  bookingForm?.reset();
}
modalClose?.addEventListener('click', closeModal);
modalCancel?.addEventListener('click', closeModal);
modal?.addEventListener('click', (evt)=> { if(evt.target === modal) closeModal(); });

// booking submit -> call backend
bookingForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const date = document.getElementById('booking-date').value;
  if(!currentService) return showToast('No service selected.');

  const token = localStorage.getItem('omnifix_token');
  if(!token){
    closeModal(); openAuthView('login'); showToast('Please login to book'); return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        service: currentService.id || currentService._id || currentService,
        name,
        phone,
        date
      })
    });

    const body = await res.json().catch(()=>null);
    if(!res.ok){
      const msg = body?.message || (body?.errors && body.errors[0]?.msg) || 'Booking failed';
      showToast(msg);
      return;
    }

    showToast('Booking confirmed!');
    bookingForm.reset();
    closeModal();
    closeDrawer();
  } catch (err) {
    console.error('Booking error', err);
    showToast('Network error — could not create booking');
  }
});

// ---------- fetch services from backend (with fallback) ----------
async function fetchServicesFromApi(){
  try {
    const res = await fetch(`${API_BASE}/api/services`);
    const data = await res.json();
    if(!Array.isArray(data) || data.length < 6){
      // backend returned too few services — use local fallback but still map what exists
      console.warn('Server returned few services — using local demo list as fallback');
      // Use server results to update SERVICES if present, otherwise keep local demo
      if(Array.isArray(data) && data.length>0){
        SERVICES = data.map(s => ({
          id: s._id || s.id,
          title: s.title || '',
          price: s.price || 0,
          rating: s.rating || 4.5,
          short: s.short || (s.desc || ''),
          desc: s.desc || s.short || '',
          category: s.category || '',
          icon: s.icon || '🔧',
          color: s.color || '#7c3aed'
        }));
      }
      // prefer showing local SERVICES fallback
      allServices = []; // empty so applyFilters uses SERVICES
      applyFilters();
      renderCategoryTiles();
      return;
    }

    allServices = (data || []).map(s => ({
      id: s._id || s.id,
      title: s.title || '',
      price: s.price || 0,
      rating: s.rating || 4.5,
      short: s.short || (s.desc || ''),
      desc: s.desc || s.short || '',
      category: s.category || '',
      icon: s.icon || '🔧',
      color: s.color || '#7c3aed'
    }));

    // initialize filters + UI
    applyFilters();
    renderCategoryTiles();
  } catch (err) {
    console.error('Failed to fetch services', err);
    showToast('Unable to load services from server — using local data');
    // fallback: use local SERVICES
    allServices = [];
    applyFilters();
    renderCategoryTiles();
  }
}

// ---------- rewire buttons ----------
function rewireBookButtons(){
  document.querySelectorAll('.book-btn').forEach(btn=>{
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });
  document.querySelectorAll('.book-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const source = (allServices && allServices.length>0) ? allServices : SERVICES;
      const svc = source.find(x=> String(x.id) === String(id));
      ensureAuthThen(()=> openModal(svc));
    });
  });
}
function rewireDetailsButtons(){
  document.querySelectorAll('.details-btn').forEach(btn=>{
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });
  document.querySelectorAll('.details-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const source = (allServices && allServices.length>0) ? allServices : SERVICES;
      const svc = source.find(x=> String(x.id) === String(id));
      openDrawer(svc);
    });
  });
}

// ---------- My Bookings: fetch & render (kept & integrated) ----------
async function fetchMyBookings() {
  const token = localStorage.getItem('omnifix_token');
  if (!token) {
    openAuthView('login');
    showToast('Please login to view bookings');
    return [];
  }

  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) {
      const body = await res.json().catch(()=>null);
      showToast(body?.message || 'Failed to load bookings');
      return [];
    }
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error('fetchMyBookings error', err);
    showToast('Network error while loading bookings');
    return [];
  }
}

function renderBookings(bookings) {
  if(!bookingsSection || !bookingsList || !noBookingsNotice) return;
  bookingsList.innerHTML = '';
  if (!bookings || bookings.length === 0) {
    noBookingsNotice.classList.remove('hidden');
    bookingsList.classList.add('hidden');
    return;
  }
  noBookingsNotice.classList.add('hidden');
  bookingsList.classList.remove('hidden');

  bookings.forEach(b => {
    const source = (allServices && allServices.length>0) ? allServices : SERVICES;
    const svc = (b.service && typeof b.service === 'object') ? b.service : (source.find(s => String(s.id) === String(b.service)) || {});
    const title = svc.title || (b.service && b.service.title) || 'Service';
    const price = svc.price ? `₹${svc.price}` : '';
    const date = new Date(b.date).toLocaleString();
    const status = b.status || 'pending';

    const item = document.createElement('div');
    item.className = 'card-service';
    item.style.marginBottom = '12px';
    item.innerHTML = `
      <div class="card-top" style="align-items:flex-start">
        <div class="icon-circle" style="background:${svc.color || '#7c3aed'};width:56px;height:56px">${svc.icon || '🔧'}</div>
        <div style="flex:1;padding-left:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">${title}</div>
            <div style="font-weight:800;color:var(--primary)">${price}</div>
          </div>
          <div class="muted" style="margin-top:6px">${svc.category || ''} • ${date}</div>
          <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
            <div class="small-btn">${status}</div>
            <button class="small-btn btn-primary view-booking-btn" data-id="${b._id}">View</button>
            <button class="small-btn btn-ghost cancel-booking-btn" data-id="${b._id}">Cancel</button>
          </div>
        </div>
      </div>
    `;
    bookingsList.appendChild(item);
  });

  // wire view/cancel buttons
  document.querySelectorAll('.view-booking-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const b = bookings.find(x => String(x._id) === String(id));
      if(!b) return;
      openDrawer({
        title: (b.service && b.service.title) || 'Booking',
        short: b.name + ' • ' + (b.phone || ''),
        desc: `Date: ${new Date(b.date).toLocaleString()}\nStatus: ${b.status || 'pending'}`
      });
    });
  });

  document.querySelectorAll('.cancel-booking-btn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const id = e.currentTarget.dataset.id;
      if (!confirm('Cancel this booking?')) return;
      try {
        const token = localStorage.getItem('omnifix_token');
        const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) {
          const body = await res.json().catch(()=>null);
          if (res.status === 404) {
            showToast('Cancel not implemented on server (ask admin).');
            return;
          }
          showToast(body?.message || 'Failed to cancel');
          return;
        }
        showToast('Booking cancelled');
        loadAndShowBookings();
      } catch (err) {
        console.error('cancel booking error', err);
        showToast('Network error');
      }
    });
  });
}

async function loadAndShowBookings(){
  if(!bookingsSection) return;
  bookingsSection.classList.remove('hidden');
  bookingsSection.setAttribute('aria-hidden','false');
  const data = await fetchMyBookings();
  renderBookings(data);
}

bookingsCloseBtn?.addEventListener('click', ()=>{
  if(!bookingsSection) return;
  bookingsSection.classList.add('hidden');
  bookingsSection.setAttribute('aria-hidden','true');
});

// ---------- enable password toggle buttons ----------
function togglePw(inputId, btnId){
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if(!inp || !btn) return;
  btn.addEventListener('click', ()=>{
    if(inp.type === 'password'){ inp.type = 'text'; btn.textContent = '🙈'; }
    else { inp.type = 'password'; btn.textContent = '👁️'; }
    inp.focus();
  });
}
togglePw('reg-password','reg-pw-toggle');
togglePw('login-password','login-pw-toggle');

// ---------- mobile nav toggle & quick book ----------
navToggle?.addEventListener('click', ()=> {
  mainNav.style.display = mainNav.style.display === 'flex' ? '' : 'flex';
});
bookNowBtn?.addEventListener('click', ()=> {
  // default to first service
  const source = (allServices && allServices.length>0) ? allServices : SERVICES;
  ensureAuthThen(()=> openModal(source[0]));
});

// ---------- load more / infinite scroll ----------
loadMoreBtn?.addEventListener('click', ()=> {
  page++;
  maxShown = page * pageSize;
  renderServices(visibleServices);
});
window.addEventListener('scroll', debounce(()=> {
  if(!loadMoreBtn) return;
  if(loadMoreBtn.style.display === 'none') return;
  if((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 300)){
    page++; maxShown = page * pageSize; renderServices(visibleServices);
  }
}, 150));

// ---------- header and button wiring ----------
function initHeaderAndButtons(){
  updateHeaderAuth();
  rewireBookButtons();
  rewireDetailsButtons();
  // ensure header bookings button
  try { ensureHeaderBookingsButton(); } catch(e){ /* ignore */ }
}

// ---------- fetch & init ----------
(async function init(){
  // wire filters
  searchInput?.addEventListener('input', debounce(()=> applyFilters(), 220));
  categorySelect?.addEventListener('change', applyFilters);
  priceRange?.addEventListener('input', ()=> { priceValue && (priceValue.textContent = `₹${priceRange.value}`); applyFilters(); });
  sortSelect?.addEventListener('change', applyFilters);
  ratingSelect?.addEventListener('change', applyFilters);
  pageSizeSelect?.addEventListener('change', ()=> { pageSize = +pageSizeSelect.value; page =1; maxShown = pageSize; renderServices(visibleServices); });

  // load services from backend (or fallback)
  await fetchServicesFromApi();

  // wire header & buttons after initial render
  initHeaderAndButtons();

  // If page loaded with hash to open a service (service.html uses location.href redirection to index#open-service=id)
  const hash = location.hash || '';
  const openId = (hash.match(/open-service=([^&]+)/) || [])[1];
  if(openId){
    const source = (allServices && allServices.length>0) ? allServices : SERVICES;
    const svc = source.find(s => String(s.id) === String(openId));
    if(svc) openModal(svc);
  }
})();
