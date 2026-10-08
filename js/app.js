/**
 * Buktot Beach Resort - Client-side Local Storage Database & Interactive Logic
 * Features:
 * - LocalStorage bookings management (Create, Read, Delete, Export, Reset)
 * - LocalStorage inquiries management
 * - LocalStorage guest reviews system
 * - Interactive Day Tour & Cabana cost calculator
 * - Image lightbox modal
 * - Dynamic notification toast
 */

// Key constants for localStorage
const DB_KEYS = {
  BOOKINGS: 'buktot_beach_bookings_v1',
  INQUIRIES: 'buktot_beach_inquiries_v1',
  REVIEWS: 'buktot_beach_reviews_v1'
};

// Initial Seed Data for Guest Reviews
const SEED_REVIEWS = [
  {
    id: 'rev-01',
    name: 'Maria Elena Santos',
    location: 'Calapan City, Oriental Mindoro',
    rating: 5,
    date: '2026-03-24',
    text: 'Buktot Beach is pure raw paradise! The white sand is so fine, and the unique violet-tinted rock formations are stunning in person. Uncrowded and serene.',
    tourType: 'Day Tour Package'
  },
  {
    id: 'rev-02',
    name: 'Joshua & Clara Fernandez',
    location: 'Quezon City, Metro Manila',
    rating: 5,
    date: '2026-04-02',
    text: 'We rented a nipa cabana for the whole afternoon. The crystal clear water was so refreshing and calm. Just bring your own food and drinks as it is genuinely an eco-haven!',
    tourType: 'Nipa Cabana Rental'
  },
  {
    id: 'rev-03',
    name: 'Capt. Aris Villanueva',
    location: 'Roxas, Oriental Mindoro',
    rating: 5,
    date: '2026-04-15',
    text: 'Best camping experience under the Mindoro stars! The peaceful sea breeze and sunset views from the hunchback cliff trail are unmatched.',
    tourType: 'Overnight Stargazer Camp'
  }
];

// Initial Seed Data for Bookings
const SEED_BOOKINGS = [
  {
    id: 'BKT-2026-001',
    guestName: 'Ana Patricia Reyes',
    email: 'ana.reyes@example.com',
    phone: '0917-882-9931',
    packageType: 'day_tour',
    packageName: 'Day-Tour Package (₱150/pax)',
    guests: 4,
    visitDate: '2026-10-15',
    cabanaType: 'standard_hut',
    estimatedTotal: 900,
    specialRequests: 'Would prefer a seaside cabana near shade trees.',
    status: 'Confirmed',
    createdAt: '2026-10-06 14:20'
  },
  {
    id: 'BKT-2026-002',
    guestName: 'Mark Angelo Dela Cruz',
    email: 'mark.delacruz@example.com',
    phone: '0928-554-1212',
    packageType: 'overnight_camp',
    packageName: 'Overnight Stargazer Camp (₱350/pax)',
    guests: 2,
    visitDate: '2026-10-18',
    cabanaType: 'none',
    estimatedTotal: 700,
    specialRequests: 'Bringing 1 personal tent and campfire grill set.',
    status: 'Pending',
    createdAt: '2026-10-07 09:45'
  }
];

// DOMContentLoaded Initialization
document.addEventListener('DOMContentLoaded', () => {
  initLocalStorage();
  setupNavbarScroll();
  setupBookingForm();
  setupInquiryForm();
  setupCostCalculator();
  setupReviewSubmission();
  renderBookingsTable();
  renderReviewsList();
  setupLightbox();
  setMinVisitDate();
});

// Set minimum date picker to today
function setMinVisitDate() {
  const dateInput = document.getElementById('visitDate');
  const calcDate = document.getElementById('calcDate');
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.min = today;
  if (calcDate) calcDate.min = today;
}

// Navbar Scroll Effect & Active link highlight
function setupNavbarScroll() {
  const navbar = document.querySelector('.navbar-buktot');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// LocalStorage Database Initialization
function initLocalStorage() {
  if (!localStorage.getItem(DB_KEYS.BOOKINGS)) {
    localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
  }
  if (!localStorage.getItem(DB_KEYS.INQUIRIES)) {
    localStorage.setItem(DB_KEYS.INQUIRIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.REVIEWS)) {
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
  }
}

// Universal LocalStorage DB Helper
const LocalDB = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return [];
    }
  },
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving localStorage:', e);
      return false;
    }
  }
};

// Interactive Cost Calculator
function setupCostCalculator() {
  const pkgSelect = document.getElementById('calcPackage');
  const guestsInput = document.getElementById('calcGuests');
  const cabanaSelect = document.getElementById('calcCabana');
  const breakdownDisplay = document.getElementById('calcBreakdown');
  const totalDisplay = document.getElementById('calcTotal');

  if (!pkgSelect || !guestsInput || !cabanaSelect) return;

  function calculate() {
    const pkgPrice = parseInt(pkgSelect.value, 10) || 0;
    const guests = Math.max(1, parseInt(guestsInput.value, 10) || 1);
    const cabanaPrice = parseInt(cabanaSelect.value, 10) || 0;

    const tourTotal = pkgPrice * guests;
    const grandTotal = tourTotal + cabanaPrice;

    if (breakdownDisplay) {
      breakdownDisplay.innerHTML = `
        <div class="d-flex justify-content-between mb-1">
          <span>Entrance & Tour (₱${pkgPrice} × ${guests} pax):</span>
          <strong>₱${tourTotal.toLocaleString()}</strong>
        </div>
        <div class="d-flex justify-content-between mb-1">
          <span>Cabana / Facility Fee:</span>
          <strong>₱${cabanaPrice.toLocaleString()}</strong>
        </div>
      `;
    }

    if (totalDisplay) {
      totalDisplay.textContent = `₱${grandTotal.toLocaleString()}`;
    }
  }

  pkgSelect.addEventListener('change', calculate);
  guestsInput.addEventListener('input', calculate);
  cabanaSelect.addEventListener('change', calculate);
  calculate(); // run initial
}

// Booking Form Processing (Saves to Local Database)
function setupBookingForm() {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guestName').value.trim();
    const email = document.getElementById('guestEmail').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const packageSelect = document.getElementById('packageType');
    const packageType = packageSelect.value;
    const packageName = packageSelect.options[packageSelect.selectedIndex].text;
    const guests = parseInt(document.getElementById('guestCount').value, 10) || 1;
    const visitDate = document.getElementById('visitDate').value;
    const cabanaSelect = document.getElementById('cabanaPreference');
    const cabanaType = cabanaSelect ? cabanaSelect.value : 'none';
    const notes = document.getElementById('specialRequests').value.trim();

    // Compute estimated price
    let basePrice = 150;
    if (packageType === 'overnight_camp') basePrice = 350;
    if (packageType === 'diy_entrance') basePrice = 50;

    let cabanaFee = 0;
    if (cabanaType === 'standard_hut') cabanaFee = 300;
    if (cabanaType === 'cliffside_cabana') cabanaFee = 500;
    if (cabanaType === 'tent_pitch') cabanaFee = 150;

    const estimatedTotal = (basePrice * guests) + cabanaFee;

    const newBooking = {
      id: 'BKT-' + Date.now().toString().slice(-6),
      guestName: name,
      email: email,
      phone: phone,
      packageType: packageType,
      packageName: packageName,
      guests: guests,
      visitDate: visitDate,
      cabanaType: cabanaType,
      estimatedTotal: estimatedTotal,
      specialRequests: notes,
      status: 'Confirmed',
      createdAt: new Date().toLocaleString()
    };

    const bookings = LocalDB.get(DB_KEYS.BOOKINGS);
    bookings.unshift(newBooking);
    LocalDB.save(DB_KEYS.BOOKINGS, bookings);

    bookingForm.reset();
    showToast(`Success! Reservation #${newBooking.id} has been recorded into the local database.`);
    renderBookingsTable();

    // Optional: scroll to the bookings record modal/section
    const modalEl = document.getElementById('bookingConfirmationModal');
    if (modalEl && window.bootstrap) {
      document.getElementById('modalBookingId').textContent = newBooking.id;
      document.getElementById('modalGuestName').textContent = newBooking.guestName;
      document.getElementById('modalPackage').textContent = newBooking.packageName;
      document.getElementById('modalGuests').textContent = `${newBooking.guests} Person(s)`;
      document.getElementById('modalDate').textContent = newBooking.visitDate;
      document.getElementById('modalTotal').textContent = `₱${newBooking.estimatedTotal.toLocaleString()}`;
      
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  });
}

// Render Bookings in Local Admin / Records Modal & Table
function renderBookingsTable() {
  const container = document.getElementById('bookingsTableBody');
  const countBadge = document.getElementById('bookingsCountBadge');
  if (!container) return;

  const bookings = LocalDB.get(DB_KEYS.BOOKINGS);
  if (countBadge) countBadge.textContent = bookings.length;

  if (bookings.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          <i class="bi bi-inbox fs-3 d-block mb-2"></i>
          No reservations found in the local database yet. Submit a booking above!
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = bookings.map((b, index) => `
    <tr>
      <td><strong>#${b.id}</strong></td>
      <td>
        <div class="fw-bold">${escapeHtml(b.guestName)}</div>
        <small class="text-muted">${escapeHtml(b.email)} | ${escapeHtml(b.phone)}</small>
      </td>
      <td><span class="badge bg-info text-dark">${escapeHtml(b.packageName)}</span></td>
      <td>${b.visitDate} <br><small class="text-muted">(${b.guests} pax)</small></td>
      <td class="fw-bold text-success">₱${Number(b.estimatedTotal).toLocaleString()}</td>
      <td><span class="badge ${b.status === 'Confirmed' ? 'bg-success' : 'bg-warning'}">${b.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteBooking('${b.id}')" title="Delete record">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Delete Booking Function
window.deleteBooking = function(id) {
  if (confirm(`Are you sure you want to delete reservation #${id}?`)) {
    let bookings = LocalDB.get(DB_KEYS.BOOKINGS);
    bookings = bookings.filter(b => b.id !== id);
    LocalDB.save(DB_KEYS.BOOKINGS, bookings);
    renderBookingsTable();
    showToast(`Reservation #${id} removed from database.`);
  }
};

// Export Bookings to JSON
window.exportBookingsJSON = function() {
  const bookings = LocalDB.get(DB_KEYS.BOOKINGS);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookings, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `buktot_resort_bookings_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Database exported successfully as JSON file!');
};

// Reset Database to Seed Data
window.resetLocalDatabase = function() {
  if (confirm('Reset database to default sample reservations and reviews?')) {
    localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    localStorage.setItem(DB_KEYS.INQUIRIES, JSON.stringify([]));
    renderBookingsTable();
    renderReviewsList();
    showToast('Local database restored to initial sample state.');
  }
};

// Inquiry / Contact Form Processing
function setupInquiryForm() {
  const form = document.getElementById('inquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    const inquiry = {
      id: 'INQ-' + Date.now().toString().slice(-5),
      name,
      email,
      subject,
      message,
      submittedAt: new Date().toLocaleString()
    };

    const inquiries = LocalDB.get(DB_KEYS.INQUIRIES);
    inquiries.unshift(inquiry);
    LocalDB.save(DB_KEYS.INQUIRIES, inquiries);

    form.reset();
    showToast('Thank you! Your message has been saved in the local inquiries ledger. We will reply via email!');
  });
}

// Guest Review Submission & Rendering
function setupReviewSubmission() {
  const reviewForm = document.getElementById('reviewForm');
  if (!reviewForm) return;

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('revName').value.trim();
    const location = document.getElementById('revLocation').value.trim() || 'Mindoro Explorer';
    const tourType = document.getElementById('revTourType').value;
    const rating = parseInt(document.getElementById('revRating').value, 10) || 5;
    const text = document.getElementById('revComment').value.trim();

    const newRev = {
      id: 'rev-' + Date.now().toString().slice(-5),
      name,
      location,
      tourType,
      rating,
      text,
      date: new Date().toISOString().split('T')[0]
    };

    const reviews = LocalDB.get(DB_KEYS.REVIEWS);
    reviews.unshift(newRev);
    LocalDB.save(DB_KEYS.REVIEWS, reviews);

    reviewForm.reset();
    renderReviewsList();
    showToast('Thank you for sharing your Buktot Beach experience!');
  });
}

function renderReviewsList() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  const reviews = LocalDB.get(DB_KEYS.REVIEWS);
  container.innerHTML = reviews.map(r => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="review-card h-100">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="rating-stars">
            ${'<i class="bi bi-star-fill"></i>'.repeat(r.rating)}
            ${'<i class="bi bi-star"></i>'.repeat(5 - r.rating)}
          </div>
          <span class="badge bg-light text-muted border">${r.date}</span>
        </div>
        <p class="card-text mb-3 text-secondary">"${escapeHtml(r.text)}"</p>
        <div class="d-flex align-items-center pt-2 border-top">
          <div class="rounded-circle bg-teal text-white d-flex align-items-center justify-content-center fw-bold me-3" style="width: 42px; height: 42px; background-color: #0b7285;">
            ${r.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h6 class="mb-0 fw-bold">${escapeHtml(r.name)}</h6>
            <small class="text-muted">${escapeHtml(r.location)} • <span class="text-primary">${escapeHtml(r.tourType)}</span></small>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Lightbox Modal for Gallery Images
function setupLightbox() {
  const modalImage = document.getElementById('lightboxImage');
  const modalCaption = document.getElementById('lightboxCaption');
  const galleryItems = document.querySelectorAll('.gallery-grid-item');
  const lightboxModal = document.getElementById('galleryLightboxModal');

  if (!modalImage || !galleryItems.length || !lightboxModal) return;

  const bsModal = new bootstrap.Modal(lightboxModal);

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-overlay h6') || item.querySelector('.gallery-overlay p');
      
      if (img) {
        modalImage.src = img.src;
        modalImage.alt = img.alt;
      }
      if (modalCaption && caption) {
        modalCaption.textContent = caption.textContent;
      }
      bsModal.show();
    });
  });
}

// Toast notification helper
function showToast(message) {
  let toastContainer = document.querySelector('.buktot-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'buktot-toast-container';
    document.body.appendChild(toastContainer);
  }

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white bg-dark border-0 shadow-lg show';
  toastEl.setAttribute('role', 'alert');
  toastEl.style.minWidth = '280px';
  toastEl.innerHTML = `
    <div class="d-flex p-2">
      <div class="toast-body d-flex align-items-center">
        <i class="bi bi-check-circle-fill text-success fs-5 me-2"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  setTimeout(() => {
    toastEl.classList.remove('show');
    setTimeout(() => toastEl.remove(), 400);
  }, 4500);
}

// Security Helper to avoid XSS in innerHTML
function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
