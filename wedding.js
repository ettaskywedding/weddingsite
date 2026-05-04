
Copy

/* ============================================================
   ETTASKY WEDDING — wedding.js
   Main site interactions: nav, FAQ accordion, hero slideshow
   ============================================================ */
 
function initSite() {
 
  /* ── HAMBURGER NAV ── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
 
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }
 
  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
 
  /* ── HERO BUBBLE SLIDESHOW ── */
  const slides  = document.querySelectorAll('.bubble-slide');
  const dotsEl  = document.getElementById('bubble-dots');
 
  if (slides.length && dotsEl) {
    let current  = 0;
    let timer    = null;
 
    // Build dot indicators
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className   = 'bubble-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Photo ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
 
    function goTo(index) {
      slides[current].classList.remove('active');
      dotsEl.children[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dotsEl.children[current].classList.add('active');
      resetTimer();
    }
 
    function next() { goTo(current + 1); }
 
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 4000);
    }
 
    // Start auto-advance
    resetTimer();
 
    // Pause on hover
    const bubble = document.getElementById('hero-bubble');
    bubble.addEventListener('mouseenter', () => clearInterval(timer));
    bubble.addEventListener('mouseleave', resetTimer);
  }
 
}
 
// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}
 
function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');
}