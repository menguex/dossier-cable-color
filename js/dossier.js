(function () {
  'use strict';

  const deck = document.getElementById('deck');
  const progress = document.getElementById('slideProgress');
  const navButtons = document.querySelectorAll('.deck-nav__list button');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const total = slides.length;
  let current = 0;

  function pad(n) {
    return String(n + 1).padStart(2, '0');
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    const slide = slides[current];
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
    updateUI();
  }

  function updateUI() {
    if (progress) progress.textContent = pad(current) + ' / ' + String(total).padStart(2, '0');
    navButtons.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === current);
    });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  function syncFromScroll() {
    if (!deck || window.innerWidth <= 900) return;
    const scrollLeft = deck.scrollLeft;
    const width = deck.clientWidth || 1;
    const index = Math.round(scrollLeft / width);
    if (index !== current && index >= 0 && index < total) {
      current = index;
      updateUI();
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goTo(parseInt(btn.dataset.slide, 10));
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  if (deck) {
    deck.addEventListener('scroll', syncFromScroll, { passive: true });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goTo(current + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goTo(current - 1);
    }
  });

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent('Propuesta comercial — ' + data.get('empresa'));
      const body = encodeURIComponent(
        'Nombre: ' + data.get('nombre') + '\n' +
        'Empresa: ' + data.get('empresa') + '\n' +
        'Región: ' + data.get('region') + '\n' +
        'Interés: ' + data.get('tipo') + '\n\n' +
        'Mensaje:\n' + (data.get('mensaje') || '(sin mensaje)')
      );
      window.location.href = 'mailto:comercial@unolimitada.cl?subject=' + subject + '&body=' + body;
    });
  }

  updateUI();
})();
