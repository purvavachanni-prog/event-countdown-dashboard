/**
 * ==============================================================================
 * REVA HORIZON — STUDENT SHOWCASE & COUNTDOWN SCRIPT
 * Modern, Elegant & Modular Vanilla JavaScript
 * ==============================================================================
 */

// LocalStorage Keys
const STORAGE_KEYS = {
  EVENTS: 'reva_horizon_events_data',
  REMINDERS: 'reva_horizon_reminders_data',
};

// Helper: Generates future dates dynamically relative to current runtime
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
      title: 'REVA Annual Innovation & Tech Fest 2026',
      category: 'Tech Projects',
      targetDate: getFutureDate(5, 14, 30),
      venue: 'Kuvempu Auditorium, REVA Campus',
      description: 'The flagship annual university symposium featuring cutting-edge student project expos, AI hackathons, robotics arenas, and visionary faculty keynotes.',
      isFeatured: true,
      isCustom: false
    },
    {
      id: 'reva-2',
      title: 'REVA Hackathon 24H: Smart Campus Sprint',
      category: 'Hackathons',
      targetDate: getFutureDate(9, 8, 0),
      venue: 'C.V. Raman Block, Labs 3 & 4',
      description: 'An intensive 24-hour hackathon where student teams design and build innovative web, AI, and IoT solutions for real-world campus challenges.',
      isFeatured: false,
      isCustom: false
    },
    {
      id: 'reva-3',
      title: 'REVA Kalataranga Cultural Showcase',
      category: 'Campus Events',
      targetDate: getFutureDate(16, 18, 0),
      venue: 'Open Air Theatre (OAT), REVA Campus',
      description: 'A vibrant celebration of music, dance, theatrical arts, and fashion showcases presented by student clubs across all faculties.',
      isFeatured: false,
      isCustom: false
    },
    {
      id: 'reva-4',
      title: 'AI & Autonomous Robotics Expo',
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
let reminders = new Set();
let currentCategory = 'All';
let searchKeyword = '';

// DOM Elements
const clockTime = document.getElementById('clockTime');
const clockDate = document.getElementById('clockDate');

const featuredCard = document.getElementById('featuredCard');
const featuredTitle = document.getElementById('featuredTitle');
const featuredCategory = document.getElementById('featuredCategory');
const featuredDesc = document.getElementById('featuredDesc');
const featuredDate = document.getElementById('featuredDate');
const featuredVenue = document.getElementById('featuredVenue');
const featuredRemindBtn = document.getElementById('featuredRemindBtn');
const featuredRemindText = document.getElementById('featuredRemindText');
const featDays = document.getElementById('featDays');
const featHours = document.getElementById('featHours');
const featMinutes = document.getElementById('featMinutes');
const featSeconds = document.getElementById('featSeconds');

const eventsGrid = document.getElementById('eventsGrid');
const eventsCount = document.getElementById('eventsCount');
const emptyState = document.getElementById('emptyState');
const emptyResetBtn = document.getElementById('emptyResetBtn');

const categoryButtons = document.querySelectorAll('.cat-btn');
const badgeAll = document.getElementById('badgeAll');
const badgeTech = document.getElementById('badgeTech');
const badgeHack = document.getElementById('badgeHack');
const badgeCampus = document.getElementById('badgeCampus');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

const modalOverlay = document.getElementById('modalOverlay');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const addEventForm = document.getElementById('addEventForm');
const eventDateInput = document.getElementById('eventDate');

const toastContainer = document.getElementById('toastContainer');
const resetSeedBtn = document.getElementById('resetSeedBtn');

// --- 1. Load & Save Data (LocalStorage) ---
function loadState() {
  // Load events
  const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (savedEvents) {
    try {
      events = JSON.parse(savedEvents);
    } catch (e) {
      console.error('Error loading events:', e);
      events = getDefaultEvents();
    }
  } else {
    events = getDefaultEvents();
    saveEvents();
  }

  // Load reminders
  const savedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
  if (savedReminders) {
    try {
      reminders = new Set(JSON.parse(savedReminders));
    } catch (e) {
      reminders = new Set();
    }
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

function saveReminders() {
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(Array.from(reminders)));
}

// --- 2. Live Digital Clock ---
function startDigitalClock() {
  const update = () => {
    const now = new Date();

    // 12-hour format with AM/PM
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hrsStr = String(hours).padStart(2, '0');
    const minStr = String(now.getMinutes()).padStart(2, '0');
    const secStr = String(now.getSeconds()).padStart(2, '0');

    clockTime.textContent = `${hrsStr}:${minStr}:${secStr} ${ampm}`;

    // Date: "Wednesday, Oct 28, 2026"
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    clockDate.textContent = now.toLocaleDateString('en-US', options);
  };

  update();
  setInterval(update, 1000);
}

// --- 3. Live Countdown Timer Calculations ---
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

function formatNum(n) {
  return String(n).padStart(2, '0');
}

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

// --- 4. Toast Notification System ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';

  const iconSvg = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;

  toast.innerHTML = `
    ${iconSvg}
    <span>${escapeHTML(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger smooth slide-in
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Automatically fade away after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// --- 5. Render Functions ---

// Update Category Badge Counts
function renderCategoryCounts() {
  const counts = {
    All: events.length,
    'Tech Projects': 0,
    Hackathons: 0,
    'Campus Events': 0
  };

  events.forEach(e => {
    if (counts[e.category] !== undefined) {
      counts[e.category]++;
    }
  });

  badgeAll.textContent = counts.All;
  badgeTech.textContent = counts['Tech Projects'];
  badgeHack.textContent = counts.Hackathons;
  badgeCampus.textContent = counts['Campus Events'];
}

// Render the top Featured Hero card
function renderFeaturedEvent() {
  const featured = events.find(e => e.isFeatured) || events[0];
  if (!featured) return;

  featuredTitle.textContent = featured.title;
  featuredCategory.textContent = featured.category;
  featuredDesc.textContent = featured.description || 'Join students and faculty for this upcoming event at REVA University.';
  featuredDate.textContent = formatDate(featured.targetDate);
  featuredVenue.textContent = featured.venue;

  // Remind Me Button State
  const isReminded = reminders.has(featured.id);
  featuredRemindBtn.classList.toggle('active', isReminded);
  featuredRemindText.textContent = isReminded ? 'Reminder Active' : 'Remind Me';

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
    const isReminded = reminders.has(item.id);

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="card-tag">${item.category}</span>
          <div class="card-actions-top">
            ${item.isCustom ? `
              <button class="card-delete-btn" data-action="delete" data-id="${item.id}" title="Delete event" aria-label="Delete event">&times;</button>
            ` : ''}
          </div>
        </div>

        <div class="card-content" style="margin-top: 0.85rem;">
          <h4>${escapeHTML(item.title)}</h4>
          <div class="card-meta-row">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${formatDate(item.targetDate)}
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${escapeHTML(item.venue)}
            </span>
          </div>
          ${item.description ? `<p class="card-desc">${escapeHTML(item.description)}</p>` : ''}
        </div>
      </div>

      <div>
        <!-- Live Card Countdown -->
        <div class="card-timer" data-timer-id="${item.id}">
          <div class="card-timer-header">
            <span>COUNTDOWN</span>
            <span class="timer-status-badge">${t.isPast ? 'LIVE' : 'UPCOMING'}</span>
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

        <!-- Remind Me Button -->
        <div class="card-footer" style="margin-top: 1rem;">
          <button class="remind-btn ${isReminded ? 'active' : ''}" data-action="remind" data-id="${item.id}">
            <svg viewBox="0 0 24 24" fill="${isReminded ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>${isReminded ? 'Reminder Set' : 'Remind Me'}</span>
          </button>
        </div>
      </div>
    `;

    eventsGrid.appendChild(card);
  });
}

// Fast per-second timer update without re-building DOM
function updateAllTimers() {
  // 1. Update featured card
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

// --- 6. Remind Me Action ---
function toggleReminder(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;

  if (reminders.has(id)) {
    reminders.delete(id);
    showToast(`Reminder removed for "${ev.title}".`);
  } else {
    reminders.add(id);
    showToast(`Reminder set for "${ev.title}"!`);
  }

  saveReminders();
  renderFeaturedEvent();
  renderEventsGrid();
}

// --- 7. Modal Logic (Add Custom Event) ---
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
    showToast('Please fill in all required fields.');
    return;
  }

  const targetDateObj = new Date(dateVal);
  if (isNaN(targetDateObj.getTime())) {
    showToast('Please enter a valid date and time.');
    return;
  }

  if (targetDateObj.getTime() <= Date.now()) {
    showToast('Event date must be in the future.');
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
  renderCategoryCounts();
  closeModal();

  showToast(`"${title}" added to REVA Horizon showcase!`);
}

// Delete custom event
function deleteEvent(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;

  events = events.filter(e => e.id !== id);
  reminders.delete(id);
  saveEvents();
  saveReminders();
  renderFeaturedEvent();
  renderEventsGrid();
  renderCategoryCounts();

  showToast(`Removed "${ev.title}" from showcase.`);
}

// Clear Search and Category Filters
function resetFilters() {
  searchInput.value = '';
  searchKeyword = '';
  clearSearchBtn.style.display = 'none';
  currentCategory = 'All';

  categoryButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === 'All');
  });

  renderEventsGrid();
  showToast('Filters cleared. Showing all events.');
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

// --- 8. Event Listeners Setup ---
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
    clearSearchBtn.style.display = searchKeyword ? 'block' : 'none';
    renderEventsGrid();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchKeyword = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
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

  // Featured Remind Me Button
  featuredRemindBtn.addEventListener('click', () => {
    const featured = events.find(e => e.isFeatured) || events[0];
    if (featured) {
      toggleReminder(featured.id);
    }
  });

  // Delegated events for Grid cards (Delete & Remind)
  eventsGrid.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.getAttribute('data-action');
    const id = actionBtn.getAttribute('data-id');

    if (action === 'remind') {
      toggleReminder(id);
    } else if (action === 'delete') {
      deleteEvent(id);
    }
  });

  // Empty state 'Clear Filters & Reset' button
  emptyResetBtn.addEventListener('click', resetFilters);

  // Reset sample seed events
  resetSeedBtn.addEventListener('click', () => {
    events = getDefaultEvents();
    reminders = new Set();
    saveEvents();
    saveReminders();
    renderFeaturedEvent();
    renderEventsGrid();
    renderCategoryCounts();
    showToast('Reset to default REVA University sample events.');
  });
}

// --- 9. Initialization ---
function init() {
  loadState();
  startDigitalClock();
  renderCategoryCounts();
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
