(function () {
  'use strict';

  const progressBar = document.getElementById('scrollProgressBar');
  const navLinks = document.querySelectorAll('.site-nav a[data-section]');
  const sections = document.querySelectorAll('.site-hero[id], .timeline-step[id], .site-section[id]');
  const menuBtn = document.getElementById('siteMenuBtn');
  const siteNav = document.getElementById('siteNav');
  const heroInner = document.querySelector('.site-hero__inner');
  const mapScene = document.getElementById('coverageMapScene');
  const mapSection = document.getElementById('cobertura');
  const timeline = document.getElementById('storyTimeline');
  const timelineFill = document.getElementById('timelineFill');
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const ambientOrbs = document.querySelectorAll('[data-orb]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let coverageMap = null;
  let mapBounds = null;

  /* Scroll progress */
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* Active nav link */
  function navSectionFor(id) {
    if (id === 'cobertura' || id === 'mercado-publico') return 'quienes';
    if (id.startsWith('experiencia')) return 'experiencia';
    if (id.startsWith('solucion')) return 'solucion';
    return id;
  }

  function updateNav() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = navSectionFor(section.id);
    });
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.dataset.section === current);
    });
  }

  /* Hero parallax */
  function updateHeroParallax() {
    if (reducedMotion || !heroInner) return;
    const scrollY = window.scrollY;
    const hero = document.getElementById('inicio');
    if (!hero) return;
    const heroH = hero.offsetHeight;
    if (scrollY > heroH) return;
    const p = scrollY / heroH;
    heroInner.style.transform = 'translateY(' + (scrollY * 0.28) + 'px)';
    heroInner.style.opacity = String(1 - p * 0.45);
  }

  /* Map scroll-linked parallax */
  function updateMapScroll() {
    if (!mapScene || !mapSection || reducedMotion) return;

    const rect = mapSection.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;

    mapScene.classList.toggle('is-active', visible);

    if (!visible) return;

    const sectionProgress = Math.max(0, Math.min(1,
      (vh * 0.55 - rect.top) / (rect.height * 0.55)
    ));

    const parallaxY = (1 - sectionProgress) * 28;
    mapScene.style.transform = 'translateY(' + (-parallaxY) + 'px) scale(' + (0.98 + sectionProgress * 0.02) + ')';
  }

  /* Timeline scroll progress (Captas-style) */
  function updateTimeline() {
    if (!timeline || !timelineFill || !timelineSteps.length) return;

    const timelineRect = timeline.getBoundingClientRect();
    const timelineStart = window.scrollY + timelineRect.top;
    const timelineEnd = timelineStart + timeline.offsetHeight;
    const viewportAnchor = window.scrollY + window.innerHeight * 0.42;

    const progress = (viewportAnchor - timelineStart) / (timelineEnd - timelineStart);
    timelineFill.style.height = (Math.max(0, Math.min(1, progress)) * 100) + '%';

    timelineSteps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const stepTop = window.scrollY + rect.top;
      const nextStep = timelineSteps[index + 1];
      const nextTop = nextStep
        ? window.scrollY + nextStep.getBoundingClientRect().top
        : stepTop + rect.height;

      const isPast = viewportAnchor >= stepTop + rect.height * 0.2;
      const isActive = viewportAnchor >= stepTop - 60 && viewportAnchor < nextTop - 20;

      step.classList.toggle('is-past', isPast);
      step.classList.toggle('is-active', isActive);
    });
  }

  /* Ambient orbs — parallax suave al scroll */
  function updateAmbient() {
    if (reducedMotion || !ambientOrbs.length) return;

    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const p = docHeight > 0 ? scrollY / docHeight : 0;

    ambientOrbs.forEach(function (orb) {
      const kind = orb.dataset.orb;
      let tx = 0;
      let ty = scrollY * 0.04;

      if (kind === 'navy') {
        tx = p * 40;
        ty = scrollY * 0.06;
      } else if (kind === 'red') {
        tx = -p * 50;
        ty = scrollY * 0.03;
      } else if (kind === 'blue') {
        tx = p * -30;
        ty = scrollY * 0.05;
      } else if (kind === 'warm') {
        tx = p * 25;
        ty = scrollY * 0.02;
      }

      orb.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
    });
  }

  /* Generar destellos */
  function initSparkles() {
    const container = document.getElementById('ambientSparkles');
    if (!container || reducedMotion) return;

    const count = window.innerWidth < 768 ? 18 : 32;
    const colors = ['', ' ambient__sparkle--navy', ' ambient__sparkle--red'];

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'ambient__sparkle' + colors[i % 3];
      sparkle.style.left = (Math.random() * 100) + '%';
      sparkle.style.top = (Math.random() * 100) + '%';
      sparkle.style.setProperty('--sparkle-dur', (3 + Math.random() * 5) + 's');
      sparkle.style.setProperty('--sparkle-delay', (Math.random() * 6) + 's');
      sparkle.style.setProperty('--sparkle-peak', (0.35 + Math.random() * 0.45).toFixed(2));
      container.appendChild(sparkle);
    }
  }

  function onScroll() {
    updateProgress();
    updateNav();
    updateHeroParallax();
    updateMapScroll();
    updateTimeline();
    updateAmbient();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Scroll reveal */
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (reducedMotion) {
      reveals.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    reveals.forEach(el => observer.observe(el));
  }

  /* Leaflet map */
  function createMarkerIcon(className) {
    return L.divIcon({
      className: 'map-marker-wrap',
      html: '<span class="map-marker ' + className + '"></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  }

  function initCoverageMap() {
    const mapEl = document.getElementById('coverageMap');
    if (!mapEl || typeof L === 'undefined') return;

    const coquimboCities = [
      { name: 'Ovalle', lat: -30.597, lng: -71.199, hub: true },
      { name: 'Illapel', lat: -31.634, lng: -71.165 },
      { name: 'Salamanca', lat: -31.778, lng: -70.963 },
      { name: 'Vicuña', lat: -30.032, lng: -70.708 }
    ];

    const magallanesCities = [
      { name: 'Punta Arenas', lat: -53.164, lng: -70.917, hub: true },
      { name: 'Puerto Natales', lat: -51.723, lng: -72.487 },
      { name: 'Porvenir', lat: -53.297, lng: -70.366 }
    ];

    coverageMap = L.map('coverageMap', {
      scrollWheelZoom: false,
      dragging: !reducedMotion,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 12,
      minZoom: 3
    }).addTo(coverageMap);

    const allMarkers = [];

    coquimboCities.forEach(city => {
      const marker = L.marker([city.lat, city.lng], {
        icon: createMarkerIcon('map-marker--coquimbo')
      }).addTo(coverageMap).bindPopup('<strong>' + city.name + '</strong><br>Coquimbo · Cable Color / FibraCorp');
      allMarkers.push(marker);
    });

    magallanesCities.forEach(city => {
      const marker = L.marker([city.lat, city.lng], {
        icon: createMarkerIcon('map-marker--magallanes')
      }).addTo(coverageMap).bindPopup('<strong>' + city.name + '</strong><br>Magallanes · TV Red');
      allMarkers.push(marker);
    });

    const coquimboHub = coquimboCities.find(c => c.hub);
    const magallanesHub = magallanesCities.find(c => c.hub);

    if (coquimboHub && magallanesHub) {
      L.polyline(
        [[coquimboHub.lat, coquimboHub.lng], [-42.5, -72.5], [magallanesHub.lat, magallanesHub.lng]],
        { color: '#152982', weight: 2, opacity: 0.45, dashArray: '10 8', lineCap: 'round' }
      ).addTo(coverageMap);
    }

    mapBounds = L.latLngBounds(allMarkers.map(m => m.getLatLng()));
    coverageMap.fitBounds(mapBounds, { padding: [48, 48], maxZoom: 5 });

    /* Fly-in when map enters viewport */
    if (!reducedMotion) {
      const mapObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && coverageMap) {
            coverageMap.flyToBounds(mapBounds, {
              padding: [48, 48],
              duration: 1.4,
              easeLinearity: 0.25
            });
            mapObserver.disconnect();
          }
        });
      }, { threshold: 0.25 });
      mapObserver.observe(mapScene);
    }

    setTimeout(function () { coverageMap.invalidateSize(); }, 200);
  }

  /* Smooth anchor scroll */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (siteNav) siteNav.classList.remove('is-open');
    });
  });

  if (menuBtn && siteNav) {
    menuBtn.addEventListener('click', () => siteNav.classList.toggle('is-open'));
  }

  document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.tab-bar button');
    const panels = tabGroup.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.toggle('is-active', t === tab));
        panels.forEach(p => p.classList.toggle('is-active', p.dataset.tab === target));
      });
    });
  });

  const credFilters = document.querySelectorAll('.cred-filters button');
  const credCards = document.querySelectorAll('.cred-grid-cards .cred-card');
  credFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      credFilters.forEach(b => b.classList.toggle('is-active', b === btn));
      credCards.forEach(card => {
        const tags = card.dataset.tags || '';
        card.classList.toggle('is-hidden', filter !== 'all' && !tags.includes(filter));
      });
    });
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

  initReveal();
  initSparkles();
  initPreloader();
  initCoverageMap();
  onScroll();

  /* Precarga: logo header, hero y fondo del hero */
  function initPreloader() {
    const preloader = document.getElementById('sitePreloader');
    const fill = document.getElementById('preloaderFill');
    if (!preloader) return;

    const headerLogo = document.querySelector('.site-header__logo');
    const heroLogo = document.querySelector('.site-hero__brand-logo');
    const heroBg = new Image();
    heroBg.src = 'assets/stock/patagonia.jpg';

    const assets = [headerLogo, heroLogo, heroBg].filter(Boolean);
    let loaded = 0;
    const total = assets.length;
    let dismissed = false;

    function setProgress() {
      if (fill) {
        fill.style.width = Math.round((loaded / total) * 100) + '%';
      }
    }

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      if (fill) fill.style.width = '100%';
      preloader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      window.setTimeout(function () {
        preloader.remove();
      }, reducedMotion ? 200 : 600);
    }

    function markLoaded() {
      loaded += 1;
      setProgress();
      if (loaded >= total) dismiss();
    }

    setProgress();

    assets.forEach(function (asset) {
      if (asset.complete && asset.naturalWidth !== 0) {
        markLoaded();
      } else {
        asset.addEventListener('load', markLoaded, { once: true });
        asset.addEventListener('error', markLoaded, { once: true });
      }
    });

    window.addEventListener('load', dismiss, { once: true });
    window.setTimeout(dismiss, reducedMotion ? 400 : 2200);
  }
})();
