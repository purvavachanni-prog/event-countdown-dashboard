/**
 * ==============================================================================
 * REVA HORIZON — STUDENT SHOWCASE & COUNTDOWN SCRIPT
 * Simple, Modular & Easy-to-Read Vanilla JavaScript
 * ==============================================================================
 */

// LocalStorage key for saving user-added events
const STORAGE_KEY = 'reva_horizon_events_data';

// Helper to create dates relative to now (keeps sample countdowns active & ticking)
function getFutureDate(daysAhead, hoursAhead = 0, minsAhead = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(date.getHours() + hoursAhead);
  date.setMinutes(date.getMinutes() + minsAhead);
  date.setSeconds(0);
  return date.toISOString();
}

// Initial Sample Events for REVA University
function getDefaultEvents() {
  return [
    {
      id: 'reva-1',
      title: 'REVA Tech Fest 2026',
      category: 'Tech Projects',
      targetDate: getFutureDate(5, 14, 30),
      venue: 'Kuvempu Auditorium, REVA Campus',
      description: 'The flagship annual university symposium featuring cutting-edge student project expos, AI hackathons, robotics arenas, and keynote addresses.',
      isFeatured: true,
      isCustom: false
    },
    {
      id: 'reva-2',
      title: 'REVA Hackathon 24H',
      category: 'Hackathons',
      targetDate: getFutureDate(9, 8, 0),
      venue: 'C.V. Raman Block, Labs 3 & 4',
      description: 'An intensive 24-hour hackathon where student teams design and build innovative web, AI, and IoT solutions for real-world campus challenges.',
      isFeatured: false,
      isCustom: false
    },
    {
      id: 'reva-3',
      title: 'REVA Kalataranga Cultural Fest',
      category: 'Campus Events',
      targetDate: getFutureDate(16, 18, 0),
      venue: 'Open Air Theatre (OAT), REVA Campus',
      description: 'A vibrant celebration of music, dance, theatrical arts, and fashion showcases by student clubs across all faculties.',
      isFeatured: false,
      isCustom: false
    },
    {
      id: 'reva-4',
      title: 'AI & IoT Project Exhibition',
      category: 'Tech Projects',
      targetDate: getFutureDate(24, 10, 0),
      venue: 'Science & Technology Block, Ground Floor',
      description: 'Senior engineering students demonstrate working prototypes of autonomous drones, smart agriculture devices, and computer vision models.',
      isFeatured: false,
      isCustom: false
    }
  ];
}

// Application State
let events = [];
let currentCategory = 'All';
let searchKeyword = '';

// DOM Elements
const featuredTitle = document.getElementById('featuredTitle');
const featuredCategory = document.getElementById('featuredCategory');
const featuredDesc = document.getElementById('featuredDesc');
const featuredDate = document.getElementById('featuredDate');
const featuredVenue = document.getElementById('featuredVenue');
const featDays = document.getElementById('featDays');
const featHours = document.getElementById('featHours');
const featMinutes = document.getElementById('featMinutes');
const featSeconds = document.getElementById('featSeconds');

const eventsGrid = document.getElementById('eventsGrid');
const eventsCount = document.getElementById('eventsCount');
const emptyState = document.getElementById('emptyState');
const emptyResetBtn = document.getElementById('emptyResetBtn');

const categoryButtons = document.querySelectorAll('.cat-btn');
const searchInput = document.getElementById('searchInput');

const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const addEventForm = document.getElementById('addEventForm');

const eventDateInput = document.getElementById('eventDate');
const resetSeedBtn = document.getElementById('resetSeedBtn');

// --- 1. Load & Save Data (LocalStorage) ---
function loadEvents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      events = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading events:', e);
      events = getDefaultEvents();
    }
  } else {
    events = getDefaultEvents();
    saveEvents();
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// --- 2. Live Countdown Timer Calculations ---
function getTimeRemaining(targetIsoString) {
  const total = new Date(targetIsoString).getTime() - Date.now();

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds, isPast: false };
}

// Format double digits (e.g. 7 -> "07")
function formatNum(n) {
  return String(n).padStart(2, '0');
}

// Format readable date string (e.g., "Nov 15, 2026, 02:30 PM")
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// --- 3. Render Functions ---

// Render the top Featured Hero card
function renderFeaturedEvent() {
  // Find event marked as featured or default to the first one
  const featured = events.find(e => e.isFeatured) || events[0];
  if (!featured) return;

  featuredTitle.textContent = featured.title;
  featuredCategory.textContent = featured.category;
  featuredDesc.textContent = featured.description || 'Join students and faculty for this upcoming event at REVA University.';
  featuredDate.textContent = formatDate(featured.targetDate);
  featuredVenue.textContent = featured.venue;

  // Update timer digits
  const t = getTimeRemaining(featured.targetDate);
  featDays.textContent = formatNum(t.days);
  featHours.textContent = formatNum(t.hours);
  featMinutes.textContent = formatNum(t.minutes);
  featSeconds.textContent = formatNum(t.seconds);
}

// Render the upcoming events grid
function renderEventsGrid() {
  // Filter events based on active category and search input
  const filtered = events.filter(item => {
    const matchesCategory = currentCategory === 'All' || item.category === currentCategory;
    const query = searchKeyword.toLowerCase().trim();
    const matchesSearch = !query || 
      item.title.toLowerCase().includes(query) ||
      item.venue.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  // Clear existing cards
  eventsGrid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    eventsCount.textContent = '0 events found';
    return;
  }

  emptyState.style.display = 'none';
  eventsCount.textContent = `Showing ${filtered.length} event${filtered.length === 1 ? '' : 's'}`;

  // Build card elements
  filtered.forEach(item => {
    const card = document.createElement('article');
    card.className = 'event-card';

    const t = getTimeRemaining(item.targetDate);

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="card-tag">${item.category}</span>
          ${item.isCustom ? `<button class="card-delete-btn" data-delete-id="${item.id}" title="Delete event">&times;</button>` : ''}
        </div>
        <div class="card-content" style="margin-top: 0.75rem;">
          <h4>${escapeHTML(item.title)}</h4>
          <div class="card-meta-row">
            <span>📅 ${formatDate(item.targetDate)}</span>
            <span style="display: block; margin-top: 0.2rem;">📍 ${escapeHTML(item.venue)}</span>
          </div>
          ${item.description ? `<p class="card-desc">${escapeHTML(item.description)}</p>` : ''}
        </div>
      </div>

      <!-- Live Card Countdown -->
      <div class="card-timer" data-timer-id="${item.id}">
        <div class="card-timer-header">
          <span>Countdown</span>
          <span>${t.isPast ? 'LIVE / CONCLUDED' : 'UPCOMING'}</span>
        </div>
        <div class="card-timer-digits">
          <div class="mini-box">
            <span class="mini-num num-d">${formatNum(t.days)}</span>
            <span class="mini-lbl">Days</span>
          </div>
          <div class="mini-box">
            <span class="mini-num num-h">${formatNum(t.hours)}</span>
            <span class="mini-lbl">Hours</span>
          </div>
          <div class="mini-box">
            <span class="mini-num num-m">${formatNum(t.minutes)}</span>
            <span class="mini-lbl">Mins</span>
          </div>
          <div class="mini-box">
            <span class="mini-num num-s">${formatNum(t.seconds)}</span>
            <span class="mini-lbl">Secs</span>
          </div>
        </div>
      </div>
    `;

    eventsGrid.appendChild(card);
  });
}

// Fast per-second timer update without re-building DOM
function updateAllTimers() {
  // 1. Update featured
  const featured = events.find(e => e.isFeatured) || events[0];
  if (featured) {
    const t = getTimeRemaining(featured.targetDate);
    featDays.textContent = formatNum(t.days);
    featHours.textContent = formatNum(t.hours);
    featMinutes.textContent = formatNum(t.minutes);
    featSeconds.textContent = formatNum(t.seconds);
  }

  // 2. Update each card's countdown numbers
  const timerContainers = document.querySelectorAll('[data-timer-id]');
  timerContainers.forEach(container => {
    const id = container.getAttribute('data-timer-id');
    const ev = events.find(e => e.id === id);
    if (!ev) return;

    const t = getTimeRemaining(ev.targetDate);
    const dEl = container.querySelector('.num-d');
    const hEl = container.querySelector('.num-h');
    const mEl = container.querySelector('.num-m');
    const sEl = container.querySelector('.num-s');

    if (dEl) dEl.textContent = formatNum(t.days);
    if (hEl) hEl.textContent = formatNum(t.hours);
    if (mEl) mEl.textContent = formatNum(t.minutes);
    if (sEl) sEl.textContent = formatNum(t.seconds);
  });
}

// --- 4. Modal Logic (Add Custom Event) ---
function openModal() {
  modalOverlay.classList.add('open');
  document.getElementById('eventTitle').focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  addEventForm.reset();
}

function handleAddEvent(e) {
  e.preventDefault();

  const title = document.getElementById('eventTitle').value.trim();
  const category = document.getElementById('eventCategory').value;
  const dateVal = document.getElementById('eventDate').value;
  const venue = document.getElementById('eventVenue').value.trim();
  const desc = document.getElementById('eventDesc').value.trim();

  if (!title || !dateVal || !venue) {
    alert('Please fill in all required fields.');
    return;
  }

  const targetDateObj = new Date(dateVal);
  if (isNaN(targetDateObj.getTime())) {
    alert('Please enter a valid date and time.');
    return;
  }

  // Create new event object
  const newEvent = {
    id: 'custom-' + Date.now(),
    title: title,
    category: category,
    targetDate: targetDateObj.toISOString(),
    venue: venue,
    description: desc,
    isFeatured: false,
    isCustom: true
  };

  // Add to events array at top of grid
  events.unshift(newEvent);
  saveEvents();

  // Re-render
  renderEventsGrid();
  closeModal();
}

// Delete custom event
function deleteEvent(id) {
  if (confirm('Are you sure you want to remove this event?')) {
    events = events.filter(e => e.id !== id);
    saveEvents();
    renderFeaturedEvent();
    renderEventsGrid();
  }
}

// Basic HTML escaping for security
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- 5. Event Listeners Setup ---
function setupEventListeners() {
  // Category tabs
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderEventsGrid();
    });
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchKeyword = e.target.value;
    renderEventsGrid();
  });

  // Modal open / close
  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  // Close when clicking outside modal card
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Form submit
  addEventForm.addEventListener('submit', handleAddEvent);

  // Card delete event delegation
  eventsGrid.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-delete-id');
      deleteEvent(id);
    }
  });

  // Empty state reset button
  emptyResetBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchKeyword = '';
    currentCategory = 'All';
    categoryButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === 'All'));
    renderEventsGrid();
  });

  // Reset sample seed events
  resetSeedBtn.addEventListener('click', () => {
    if (confirm('Reset to default REVA University sample events? Custom added events will be cleared.')) {
      events = getDefaultEvents();
      saveEvents();
      renderFeaturedEvent();
      renderEventsGrid();
    }
  });
}

// --- 6. Initialization ---
function init() {
  loadEvents();
  renderFeaturedEvent();
  renderEventsGrid();
  setupEventListeners();

  // Run live countdown loop every second
  setInterval(updateAllTimers, 1000);

  // Default datetime-local input to 7 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  defaultDate.setMinutes(defaultDate.getMinutes() - defaultDate.getTimezoneOffset());
  if (eventDateInput) {
    eventDateInput.value = defaultDate.toISOString().slice(0, 16);
  }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
