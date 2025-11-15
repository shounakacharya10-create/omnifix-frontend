// -------- Config & API base ----------
const API_BASE = "https://omnifix-backend.onrender.com"; // change when deployed

// -------- Demo dataset fallback (kept for offline fallback) ----------
let SERVICES = [
  { id:1, title:"Home Cleaning", price:799, rating:4.7, short:"Deep cleaning for 1-3 BHK, includes sanitization", category:"cleaning", icon:"🧹", color:"#f97316", desc:"Our cleaning package covers sweeping, mopping, dusting, bathrooms and kitchen sanitization. Supplies included." },
  { id:2, title:"AC Service", price:899, rating:4.6, short:"AC cleaning & gas check - split & window units", category:"ac", icon:"❄️", color:"#06b6d4", desc:"Full AC service includes filter clean, coil check and gas top-up if required." },
  { id:3, title:"Plumbing", price:499, rating:4.5, short:"Leak repairs, pipe replacements & fittings", category:"plumbing", icon:"🔧", color:"#0ea5a4", desc:"From leak fixes to pipe replacement and bathroom fitting installations." },
  { id:4, title:"Electrician", price:399, rating:4.4, short:"Wiring, switchboards, fittings & lights", category:"electrical", icon:"💡", color:"#f59e0b", desc:"All home electrical services including wiring, switches, and lighting installation." },
  { id:5, title:"Carpentry", price:599, rating:4.3, short:"Minor carpentry, shelves & door fixes", category:"carpentry", icon:"🪚", color:"#7c3aed", desc:"Skilled carpenters for fittings, shelves, furniture repair and custom work." },
  { id:6, title:"Pest Control", price:999, rating:4.8, short:"Home pest control — one-time & packs", category:"pest", icon:"🪳", color:"#ef4444", desc:"Safe pest control for home, including roach, termite and rodent plans." }
];

// -------- DOM refs ----------
const servicesGrid = document.getElementById('services-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const resultsCount = document.getElementById('results-count');

const drawer = document.getElementById('details-drawer');
const drawerBody = document.getElementById('drawer-body');
const drawerClose = document.getElementById('drawer-close');
const drawerBook = document.getElementById('drawer-book');

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

// My bookings elements (injected into index.html)
const bookingsSection = document.getElementById('my-bookings-section');
const bookingsList = document.getElementById('my-bookings-list');
const noBookingsNotice = document.getElementById('no-bookings');
const bookingsCloseBtn = document.getElementById('bookings-close');

yearSpan.textContent = new Date().getFullYear();
priceValue.textContent = `₹${priceRange.value}`;

// ---------- rendering ----------
function renderServices(list){
  servicesGrid.innerHTML = '';
  if(!list || !list.length){
    servicesGrid.innerHTML = `<div class="muted">No services match your filter.</div>`;
    resultsCount.textContent = `Showing 0 results`;
    return;
  }
  resultsCount.textContent = `Showing ${list.length} results`;
  list.forEach(s=>{
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
    servicesGrid.appendChild(el);
  });

  // attach events (initial)
  rewireDetailsButtons();
  rewireBookButtons();
}

// ---------- utilities ----------
function stars(r){
  const filled = Math.round(r || 0);
  return '★'.repeat(Math.max(0, filled)) + '☆'.repeat(Math.max(0, 5-filled));
}

// ---------- filters ----------
function applyFilters(){
  const q = (searchInput?.value || '').trim().toLowerCase();
  const cat = categorySelect?.value || '';
  const maxPrice = +priceRange.value;
  priceValue.textContent = `₹${maxPrice}`;

  let filtered = (SERVICES || []).filter(s=>{
    if(cat && s.category !== cat) return false;
    if(s.price > maxPrice) return false;
    if(q && !(`${s.title} ${s.short} ${s.desc}`.toLowerCase().includes(q))) return false;
    return true;
  });
  renderServices(filtered);
}

// events for filters
searchInput?.addEventListener('input', debounce(()=> applyFilters(), 220));
categorySelect?.addEventListener('change', applyFilters);
priceRange?.addEventListener('input', applyFilters);

// ---------- drawer (details) ----------
let currentService = null;
function openDrawer(service){
  currentService = service;
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
  drawer.setAttribute('aria-hidden','false');
  drawer.style.transform = 'translateX(0)';
}
function closeDrawer(){
  drawer.setAttribute('aria-hidden','true');
  drawer.style.transform = 'translateX(100%)';
  currentService = null;
}
drawerClose?.addEventListener('click', closeDrawer);

// drawer's book button opens modal
drawerBook?.addEventListener('click', ()=>{
  if(currentService) ensureAuthThen(()=> openModal(currentService));
});

// ---------- modal (booking) ----------
function openModal(service){
  currentService = service;
  // if not authenticated, open auth flow instead
  const user = getCurrentUser();
  if(!user){
    openAuthView('login');
    showToast('Please login to continue booking');
    return;
  }

  modalDesc.textContent = `${service.title} — ${service.short}`;
  modal.setAttribute('aria-hidden','false');
  modal.style.display = 'flex';
  document.getElementById('customer-name')?.focus();
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
  bookingForm.reset();
}
modalClose?.addEventListener('click', closeModal);
modalCancel?.addEventListener('click', closeModal);
modal?.addEventListener('click', (evt)=> { if(evt.target === modal) closeModal(); });

// ---------- booking submit (calls backend) ----------
bookingForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const date = document.getElementById('booking-date').value;
  if(!currentService) return showToast('No service selected.');

  const token = localStorage.getItem('omnifix_token');
  if(!token){
    closeModal();
    openAuthView('login');
    showToast('Please login to book');
    return;
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

// ---------- toast ----------
let toastTimer = null;
function showToast(msg, ms=3000){
  if(!toast) { console.log('Toast:', msg); return; }
  toast.textContent = msg;
  toast.classList.add('show');
  toast.setAttribute('aria-hidden','false');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> {
    toast.classList.remove('show');
    toast.setAttribute('aria-hidden','true');
  }, ms);
}

// ---------- other helpers ----------
function debounce(fn, wait=200){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=> fn(...a), wait); }; }

// ---------- mobile nav toggle & quick book ----------
navToggle?.addEventListener('click', ()=> {
  mainNav.style.display = mainNav.style.display === 'flex' ? '' : 'flex';
});
bookNowBtn?.addEventListener('click', ()=> {
  ensureAuthThen(()=> openModal(SERVICES[0]));
});

// ---------- load services from backend ----------
async function fetchServicesFromApi(){
  try {
    const res = await fetch(`${API_BASE}/api/services`);
    const data = await res.json();
    // map server fields into frontend-friendly shape (id instead of _id)
    SERVICES = (data || []).map(s => ({
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
    applyFilters();
  } catch (err) {
    console.error('Failed to fetch services', err);
    showToast('Unable to load services from server — using local data');
    renderServices(SERVICES);
    applyFilters();
  }
}

// ---------- init (fetch services) ----------
fetchServicesFromApi();

// --- Authentication (uses backend token) ---
const authModal = document.getElementById('auth-modal');
const authClose = document.getElementById('auth-close');
const switchToLogin = document.getElementById('switch-to-login');
const switchToRegister = document.getElementById('switch-to-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// auth UI functions
function openAuthView(mode = 'register'){
  authModal.setAttribute('aria-hidden','false');
  authModal.style.display = 'flex';
  const regView = document.getElementById('register-view');
  const loginView = document.getElementById('login-view');
  if(mode === 'login'){
    regView.classList.add('hidden');
    loginView.classList.remove('hidden');
    setTimeout(()=> document.getElementById('login-email')?.focus(), 40);
  } else {
    loginView.classList.add('hidden');
    regView.classList.remove('hidden');
    setTimeout(()=> document.getElementById('reg-name')?.focus(), 40);
  }
}
function closeAuth(){
  authModal.setAttribute('aria-hidden','true');
  authModal.style.display = 'none';
  document.getElementById('register-view')?.classList.remove('hidden');
  document.getElementById('login-view')?.classList.add('hidden');
  registerForm.reset?.(); loginForm.reset?.();
}
authClose?.addEventListener('click', closeAuth);
switchToLogin?.addEventListener('click', ()=> openAuthView('login'));
switchToRegister?.addEventListener('click', ()=> openAuthView('register'));

// token + user helpers
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

// ---------- register/login (call backend) ----------
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

// Header UI
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
  }
}

// protect booking: if user not logged in, open login modal
function ensureAuthThen(fn){
  const u = getCurrentUser();
  if(u) return fn();
  openAuthView('login');
}

// Rewire Book buttons to ensure auth (remove old listeners)
function rewireBookButtons(){
  document.querySelectorAll('.book-btn').forEach(btn=>{
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });
  document.querySelectorAll('.book-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      ensureAuthThen(()=> openModal(SERVICES.find(x=>String(x.id) === String(id))));
    });
  });
}
// Rewire details buttons
function rewireDetailsButtons(){
  document.querySelectorAll('.details-btn').forEach(btn=>{
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });
  document.querySelectorAll('.details-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      openDrawer(SERVICES.find(x=>String(x.id) === String(id)));
    });
  });
}

// When DOM updates (initial render done), wire header and book buttons
updateHeaderAuth();
rewireBookButtons();
rewireDetailsButtons();


// ===== password eye toggles for both login & register =====
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

// ---------------- My Bookings: fetch & render ----------------
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
  if(!bookingsSection) return;
  bookingsList.innerHTML = '';
  if (!bookings || bookings.length === 0) {
    noBookingsNotice.classList.remove('hidden');
    bookingsList.classList.add('hidden');
    return;
  }
  noBookingsNotice.classList.add('hidden');
  bookingsList.classList.remove('hidden');

  bookings.forEach(b => {
    const svc = (b.service && typeof b.service === 'object') ? b.service : (SERVICES.find(s => String(s.id) === String(b.service)) || {});
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
        // note: server cancel endpoint may not exist. If not, this will return 404.
        const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) {
          const body = await res.json().catch(()=>null);
          // if API returns 404, tell user cancel not implemented server-side
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

// show/hide bookings section
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

// add account menu entry that opens my bookings (will appear for logged-in users)
function ensureBookingsMenu() {
  const menu = document.querySelector('.account-menu');
  if(!menu) return;
  if (menu.querySelector('.my-bookings-link')) return; // already added
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

// ensure the bookings menu is added when header updates
const origUpdateHeaderAuth = updateHeaderAuth;
updateHeaderAuth = function(){
  origUpdateHeaderAuth();
  setTimeout(()=> ensureBookingsMenu(), 50);
};
