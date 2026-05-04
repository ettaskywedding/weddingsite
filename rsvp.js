const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwQm0cN8ePG8BexEv1xxiL_iWeyIRx9ezx46D_JBz7sdiun5rb6MwfMYfQLSYCemj-C/exec';
const REGISTRY_URL = 'https://www.myregistry.com/giftlist/EttaskyWedding';

/* -----------------------------
   HELPERS
----------------------------- */

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/* -----------------------------
   GUEST LOOKUP (HOUSEHOLD NAME)
----------------------------- */

function findGuest(householdName) {
  const normalized = normalizeName(householdName);

  for (const guest of GUESTS) {
    if (normalizeName(guest.name) === normalized) {
      return guest;
    }
  }

  return null;
}

function lookupGuest() {
  const name = document.getElementById('household-name').value.trim();
  const errorEl = document.getElementById('lookup-error');

  if (!name) {
    errorEl.textContent = 'Please enter the name on your invitation.';
    errorEl.style.display = 'block';
    return;
  }

  const guest = findGuest(name);

  if (!guest) {
    errorEl.textContent =
      `We couldn't find "${name}" on our guest list. Please check spelling or reach out!`;
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  showForm(guest);
}

/* -----------------------------
   SHOW FORM
----------------------------- */

function showForm(guest) {
  document.getElementById('step-lookup').style.display = 'none';

  document.getElementById('greeting-bar').innerHTML =
    `Hello, <strong>${guest.name}</strong>! We have allocated <strong>${guest.seats} seat${guest.seats > 1 ? 's' : ''}</strong> for you.`;

  document.querySelector('.decline-message a').href = REGISTRY_URL;

  document.getElementById('seats-banner').textContent =
    `We've reserved up to ${guest.seats} seat${guest.seats > 1 ? 's' : ''} for your party.`;

  const select = document.getElementById('party-size');
  select.innerHTML = '';

  for (let i = 1; i <= guest.seats; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i} person${i > 1 ? 's' : ''}`;
    select.appendChild(opt);
  }

  const form = document.getElementById('rsvp-form');
  form.dataset.guestName = guest.name;
  form.dataset.guestSeats = guest.seats;

  updateGuestRows(1);

  document.getElementById('step-form').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* -----------------------------
   ATTENDING TOGGLE
----------------------------- */

function handleAttending(value) {
  const yesSection = document.getElementById('yes-section');
  const declineMsg = document.getElementById('decline-message');
  const declineSubmit = document.getElementById('decline-submit');

  if (value === 'Yes') {
    yesSection.style.display = 'block';
    declineMsg.style.display = 'none';
    declineSubmit.style.display = 'none';
  } else {
    yesSection.style.display = 'none';
    declineMsg.style.display = 'block';
    declineSubmit.style.display = 'block';
  }
}

/* -----------------------------
   GUEST ROWS
----------------------------- */

function updateGuestRows(count) {
  count = parseInt(count);

  const container = document.getElementById('guest-rows-container');
  container.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    const row = document.createElement('div');
    row.className = 'guest-row';

    row.innerHTML = `
      <div class="guest-row-label">Guest ${i}${i === 1 ? ' (you)' : ''}</div>
      <div class="guest-row-fields">
        <input type="text" id="g${i}-first" placeholder="First name" />
        <input type="text" id="g${i}-last" placeholder="Last name" />
        <select id="g${i}-meal" style="grid-column:1/-1;">
          <option value="">— Dinner choice —</option>
          <option value="Fish">Fish</option>
          <option value="Beef">Beef</option>
          <option value="Vegetarian">Vegetarian</option>
        </select>
      </div>
    `;

    container.appendChild(row);
  }

  // Prefill first guest
  const form = document.getElementById('rsvp-form');
  if (form.dataset.guestName) {
    const parts = form.dataset.guestName.split(' ');
    document.getElementById('g1-first').value = parts[0] || '';
    document.getElementById('g1-last').value = parts.slice(1).join(' ') || '';
  }

  // Reset dogs selection when party size changes
  document.getElementById('dogs-count-group').style.display = 'none';
  document.querySelectorAll('input[name="dogs-attending"]').forEach(r => r.checked = false);
}

/* -----------------------------
   DOGS GAME HANDLING
----------------------------- */

function handleDogsSelection() {
  const value = document.querySelector('input[name="dogs-attending"]:checked')?.value;
  const group = document.getElementById('dogs-count-group');
  const select = document.getElementById('dogs-count');

  if (value === 'Partial') {
    const max = parseInt(document.getElementById('party-size').value);

    select.innerHTML = '';
    for (let i = 1; i <= max; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i} person${i > 1 ? 's' : ''}`;
      select.appendChild(opt);
    }

    group.style.display = 'block';
  } else {
    group.style.display = 'none';
  }
}

/* -----------------------------
   SUBMIT
----------------------------- */

async function submitForm(e) {
  e.preventDefault();

  const attendingEl = document.querySelector('input[name="attending"]:checked');
  if (!attendingEl) {
    alert('Please let us know if you can attend!');
    return;
  }

  const attending = attendingEl.value;
  const form = document.getElementById('rsvp-form');

  let payload = {
    timestamp: new Date().toISOString(),
    submittedBy: form.dataset.guestName,
    attending,
    partySize: 0,
    guestNames: '',
    mealChoices: '',
    dogsGame: '',
    dietary: '',
    loveSong: '',
    notes: ''
  };

  if (attending === 'Yes') {
    const dogsEl = document.querySelector('input[name="dogs-attending"]:checked');
    if (!dogsEl) {
      alert('Please let us know about the Dogs Game!');
      return;
    }

    const partySize = parseInt(document.getElementById('party-size').value);
    const names = [];
    const meals = [];

    for (let i = 1; i <= partySize; i++) {
      const first = document.getElementById(`g${i}-first`).value.trim();
      const last = document.getElementById(`g${i}-last`).value.trim();
      const meal = document.getElementById(`g${i}-meal`).value;

      if (!first || !last) {
        alert(`Please enter full name for Guest ${i}`);
        return;
      }

      if (!meal) {
        alert(`Select a meal for ${first}`);
        return;
      }

      names.push(`${first} ${last}`);
      meals.push(`${first}: ${meal}`);
    }

    payload.partySize = partySize;
    payload.guestNames = names.join(', ');
    payload.mealChoices = meals.join(' | ');

    const dogpartySize = parseInt(document.getElementById('party-size').value);

    if (dogsEl.value === 'Yes') {
      payload.dogsGame = dogpartySize;
    } else if (dogsEl.value === 'Partial') {
      const count = parseInt(document.getElementById('dogs-count').value);

      if (!count) {
        alert('Select how many people for the Dogs Game');
        return;
      }

      payload.dogsGame = count;
    } else {
      payload.dogsGame = 0;
    }

    payload.dietary = document.getElementById('dietary').value.trim();
    payload.loveSong = document.getElementById('love-song').value.trim();
    payload.notes = document.getElementById('notes').value.trim();
  }

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    showConfirmation(attending);
  } catch (err) {
    alert('Submission failed — try again');
    console.error(err);
  }
}

/* -----------------------------
   CONFIRMATION
----------------------------- */

function showConfirmation(attending) {
  document.getElementById('step-form').style.display = 'none';
  document.getElementById('step-confirmation').style.display = 'block';

  if (attending === 'No') {
    document.getElementById('conf-title').textContent = "We'll miss you!";
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* -----------------------------
   INIT
----------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('household-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') lookupGuest();
  });

  document.querySelectorAll('input[name="dogs-attending"]').forEach(radio => {
    radio.addEventListener('change', handleDogsSelection);
  });
});