/* ============================================================
   ETTASKY WEDDING — wedding.js
   ============================================================

   HOW TO ADD GUESTS:
   Add names to the GUESTS array below. Names are matched
   case-insensitively. Each entry can be:
     - A string:  "First Last"               (1 wedding seat)
     - An object: { name: "First Last", seats: 2 }  (with plus-one)

   All guests on this list will see both the Dogs Game RSVP
   and the Wedding RSVP when they look up their name.

   ============================================================ */

const GUESTS = [
  // Add guests here — examples:
  // "Jane Smith",
  // { name: "John Doe", seats: 2 },
];

/* ============================================================
   EVENT DEFINITIONS
   (Rehearsal dinner is private — not shown on site)
   ============================================================ */

const EVENTS = {
  dogs: {
    id: 'dogs',
    title: 'Chicago Dogs Game ⚾',
    meta: 'Saturday · August 15 · 6:00 PM',
    headerClass: 'erh-navy',
    blurb: `It's <strong>Star Wars Night</strong> with fireworks at the ballpark — the perfect way to kick off the wedding weekend! We have a <strong>limited number of tickets available on a first-come, first-served basis</strong>, so please let us know as soon as possible if you'd like to join. We've got the tickets covered — food and drinks at the game are on you. Come ready to mingle, cheer, and have a blast!`,
    hasMealChoice: false,
    hasGuestNames: false,
    attendingOnly: true,
  },
  wedding: {
    id: 'wedding',
    title: 'The Wedding 💍',
    meta: 'Sunday · August 16 · 4:00 PM',
    headerClass: 'erh-gold',
    blurb: null, // handled specially in buildWeddingBlock
    hasMealChoice: true,
    hasGuestNames: true,
    attendingOnly: false,
  }
};

// All guests see both events (dogs game + wedding)
const ALL_EVENTS = ['dogs', 'wedding'];

/* ============================================================
   GUEST LOOKUP
   ============================================================ */

function normalizeGuestName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findGuest(inputName) {
  const normalized = normalizeGuestName(inputName);
  for (const entry of GUESTS) {
    const guestName = typeof entry === 'string' ? entry : entry.name;
    const seats = typeof entry === 'object' && entry.seats ? entry.seats : 1;
    if (normalizeGuestName(guestName) === normalized) {
      return { name: guestName, seats };
    }
    // Also allow partial first+last match
    const parts = normalized.split(' ');
    const guestParts = normalizeGuestName(guestName).split(' ');
    if (parts.length >= 2 && guestParts.length >= 2) {
      if (parts[0] === guestParts[0] && parts[parts.length - 1] === guestParts[guestParts.length - 1]) {
        return { name: guestName, seats };
      }
    }
  }
  return null;
}

/* ============================================================
   RSVP MODAL BUILDER
   ============================================================ */

function buildRsvpForm(guest) {
  let html = `
    <p class="rsvp-greeting">Hey there, <strong>${guest.name}</strong>! 🎉 We're so glad you're here. Below you'll find everything we need from you for the weekend.</p>
  `;

  for (const eventId of ALL_EVENTS) {
    const ev = EVENTS[eventId];
    html += buildEventBlock(ev, guest);
  }

  html += `
    <div class="rsvp-submit-row">
      <button class="btn-submit" onclick="submitRsvp()">Submit My RSVP</button>
    </div>
  `;

  return html;
}

function buildEventBlock(ev, guest) {
  if (ev.id === 'wedding') {
    return buildWeddingBlock(ev, guest);
  }

  return `
    <div class="event-rsvp-block" id="block-${ev.id}">
      <div class="event-rsvp-header ${ev.headerClass}">
        <div>
          <h3>${ev.title}</h3>
          <div class="event-meta">${ev.meta}</div>
        </div>
      </div>
      <div class="event-rsvp-body">
        <p class="event-info-blurb">${ev.blurb}</p>
        <div class="attending-row">
          <span class="attending-label">Will you be attending?</span>
          <div class="toggle-group">
            <button class="toggle-btn yes" onclick="setAttending('${ev.id}', true, this)">✓ Yes!</button>
            <button class="toggle-btn no"  onclick="setAttending('${ev.id}', false, this)">Can't make it</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildWeddingBlock(ev, guest) {
  // Build seat options up to guest.seats
  let seatOptions = '';
  for (let i = 1; i <= guest.seats; i++) {
    seatOptions += `<option value="${i}">${i}</option>`;
  }

  // Build initial single guest row
  const initialRows = buildGuestRows(1, guest.seats);

  return `
    <div class="event-rsvp-block" id="block-wedding">
      <div class="event-rsvp-header ${ev.headerClass}">
        <div>
          <h3>${ev.title}</h3>
          <div class="event-meta">${ev.meta}</div>
        </div>
      </div>
      <div class="event-rsvp-body">
        <p class="event-info-blurb">
          🎊 <strong>We've saved ${guest.seats} seat${guest.seats > 1 ? 's' : ''} for you!</strong>
          Please let us know how many you'll be filling and give us a little info for each guest.
          The ceremony begins promptly at 4:00 PM — plan to arrive at The Walden by 3:30 PM.
        </p>

        <div class="attending-row">
          <span class="attending-label">Will you be attending?</span>
          <div class="toggle-group">
            <button class="toggle-btn yes" onclick="setWeddingAttending(true, this)">✓ Wouldn't miss it!</button>
            <button class="toggle-btn no"  onclick="setWeddingAttending(false, this)">Can't make it</button>
          </div>
        </div>

        <div id="wedding-guest-section" style="display:none; margin-top:1.25rem;">
          <div class="seats-selector">
            <label for="seat-count">How many seats will you be filling?</label>
            <select id="seat-count" onchange="updateGuestRows(this.value, ${guest.seats})">
              ${seatOptions}
            </select>
          </div>
          <div class="guest-rows" id="guest-rows">
            ${initialRows}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildGuestRows(count, maxSeats) {
  let html = '';
  for (let i = 1; i <= count; i++) {
    html += `
      <div class="guest-row" id="guest-row-${i}">
        <div class="guest-row-title">Guest ${i}</div>
        <div class="guest-row-fields">
          <input type="text" placeholder="First name" id="g${i}-first" />
          <input type="text" placeholder="Last name"  id="g${i}-last" />
          <select id="g${i}-meal" class="full-width">
            <option value="">— Select meal choice —</option>
            <option value="chicken">🍗 Chicken</option>
            <option value="beef">🥩 Beef</option>
            <option value="vegetarian">🥦 Vegetarian</option>
          </select>
        </div>
        <div class="dietary-row">
          <input type="text" placeholder="Severe dietary restrictions? (optional)" id="g${i}-dietary" />
        </div>
        <p style="font-size:0.75rem; opacity:0.5; margin-top:0.4rem;">Exact preparation will vary — please only note severe restrictions above.</p>
      </div>
    `;
  }
  return html;
}

/* ============================================================
   INTERACTIVE FUNCTIONS
   ============================================================ */

const rsvpState = {};

function setAttending(eventId, attending, btn) {
  rsvpState[eventId] = attending;
  const group = btn.closest('.toggle-group');
  group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function setWeddingAttending(attending, btn) {
  rsvpState['wedding'] = attending;
  const group = btn.closest('.toggle-group');
  group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const section = document.getElementById('wedding-guest-section');
  if (section) {
    section.style.display = attending ? 'block' : 'none';
  }
}

function updateGuestRows(count, maxSeats) {
  const container = document.getElementById('guest-rows');
  if (container) {
    container.innerHTML = buildGuestRows(parseInt(count), maxSeats);
  }
}

function submitRsvp() {
  // Basic validation
  const weddingAttending = rsvpState['wedding'];
  if (weddingAttending === undefined) {
    alert('Please let us know if you\'re attending the wedding!');
    return;
  }

  if (weddingAttending) {
    const seatEl = document.getElementById('seat-count');
    const count = seatEl ? parseInt(seatEl.value) : 1;
    for (let i = 1; i <= count; i++) {
      const first = document.getElementById(`g${i}-first`);
      const last  = document.getElementById(`g${i}-last`);
      const meal  = document.getElementById(`g${i}-meal`);
      if (!first?.value.trim() || !last?.value.trim()) {
        alert(`Please enter a name for Guest ${i}.`);
        return;
      }
      if (!meal?.value) {
        alert(`Please select a meal choice for ${first.value}.`);
        return;
      }
    }
  }

  // Show confirmation
  document.getElementById('rsvp-form-content').style.display = 'none';
  document.getElementById('rsvp-confirmation').classList.add('visible');
}

/* ============================================================
   MODAL OPEN / CLOSE
   ============================================================ */

function openRsvpModal() {
  const overlay = document.getElementById('rsvp-modal-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Reset to lookup state
  resetModal();
}

function closeRsvpModal() {
  const overlay = document.getElementById('rsvp-modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function resetModal() {
  document.getElementById('name-input').value = '';
  document.getElementById('lookup-error').style.display = 'none';
  document.getElementById('rsvp-form-section').style.display = 'none';
  document.getElementById('name-lookup-section').style.display = 'block';
  document.getElementById('rsvp-confirmation').classList.remove('visible');
  document.getElementById('rsvp-form-content').style.display = 'block';
  Object.keys(rsvpState).forEach(k => delete rsvpState[k]);
}

function lookupGuest() {
  const input = document.getElementById('name-input').value.trim();
  if (!input) return;

  const guest = findGuest(input);
  const errorEl = document.getElementById('lookup-error');

  if (!guest) {
    errorEl.textContent = `We couldn't find "${input}" on our guest list. Please try your full name as it appears on your invitation, or reach out to us directly!`;
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  document.getElementById('name-lookup-section').style.display = 'none';

  const formSection = document.getElementById('rsvp-form-section');
  formSection.innerHTML = buildRsvpForm(guest);
  formSection.style.display = 'block';
}

/* ============================================================
   NAV + FAQ
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close modal on overlay click
  document.getElementById('rsvp-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeRsvpModal();
  });

  // Allow Enter key in name input
  document.getElementById('name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') lookupGuest();
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
});

function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');
}
