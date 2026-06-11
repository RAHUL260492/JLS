// ============================================
// CUSTOM CURSOR (fine pointer / desktop only)
// ============================================
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
  let dotX = window.innerWidth / 2, dotY = window.innerHeight / 2;
  let ringX = dotX, ringY = dotY;
  const LERP = 0.13;

  document.addEventListener('mousemove', e => {
    dotX = e.clientX;
    dotY = e.clientY;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top  = dotY + 'px';
  });

  (function animateRing() {
    ringX += (dotX - ringX) * LERP;
    ringY += (dotY - ringY) * LERP;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Expand ring on interactive elements via delegation
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role="button"]')) {
      cursorRing.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [role="button"]')) {
      cursorRing.classList.remove('is-hovering');
    }
  });
}

// ============================================
// AMBIENT PARTICLES
// ============================================
const particlesCanvas = document.getElementById('particles-canvas');
if (particlesCanvas) {
  const pctx = particlesCanvas.getContext('2d');
  const COUNT = 38;
  let pts = [];

  function resizePCanvas() {
    particlesCanvas.width  = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }

  function initPts() {
    resizePCanvas();
    pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  0.3 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a:  0.04 + Math.random() * 0.22,
    }));
    setTimeout(() => particlesCanvas.classList.add('ready'), 400);
  }

  (function loopPts() {
    pctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = particlesCanvas.width;
      if (p.x > particlesCanvas.width)  p.x = 0;
      if (p.y < 0) p.y = particlesCanvas.height;
      if (p.y > particlesCanvas.height) p.y = 0;
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pctx.fillStyle = `rgba(26,26,26,${p.a})`;
      pctx.fill();
    });
    requestAnimationFrame(loopPts);
  })();

  window.addEventListener('resize', resizePCanvas, { passive: true });
  initPts();
}

// ============================================
// LETTER SPLIT — hero headline
// ============================================
// Letter-split: hero headlines fire immediately; scroll-reveal headings
// fire when the IntersectionObserver adds .is-revealed.
function applySplit(el, baseDelay) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = '1';
  const nodes = Array.from(el.childNodes);
  el.innerHTML = '';
  let idx = 0;

  function wrapChars(text, parent) {
    text.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = `${baseDelay + idx * 0.038}s`;
      parent.appendChild(span);
      if (ch.trim()) idx++;
    });
  }

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      wrapChars(node.textContent, el);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const wrapper = document.createElement(node.tagName);
      if (node.className) wrapper.className = node.className;
      wrapChars(node.textContent, wrapper);
      el.appendChild(wrapper);
    }
  });
}

// Immediate split for elements NOT inside scroll-reveal (e.g. hero)
document.querySelectorAll('[data-split]:not(.scroll-reveal)').forEach(el => {
  const baseDelay = parseFloat(el.style.getPropertyValue('--delay') || '0');
  applySplit(el, baseDelay);
});

// ============================================
// Sticky header shadow on scroll
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });
}

// Mobile menu toggle
const menuToggle = document.querySelector('.mobile-menu-toggle');
const menuOverlay = document.getElementById('mobileMenuOverlay');
const menuClose = document.querySelector('.mobile-menu-close');

if (menuToggle && menuOverlay && menuClose) {
  menuToggle.addEventListener('click', () => {
    menuOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
  menuClose.addEventListener('click', closeMobileMenu);
  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) closeMobileMenu();
  });
}

function closeMobileMenu() {
  if (menuOverlay) {
    menuOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

// ========================================
// SCROLL REVEAL ANIMATION SYSTEM
// ========================================

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.querySelectorAll('.scroll-reveal');
        const siblingIndex = Array.from(siblings).indexOf(entry.target);
        const staggerDelay = siblingIndex * 0.08;

        entry.target.style.transitionDelay = `${staggerDelay}s`;
        entry.target.classList.add('is-revealed');

        // Fire letter-split for headings revealed by scroll
        if (entry.target.dataset.split !== undefined) {
          applySplit(entry.target, staggerDelay);
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initScrollReveal);

// ============================================
// ARRIVALS CAROUSEL — Manual + Auto-Scroll
// ============================================
const carousel = document.getElementById('arrivalsCarousel');
const leftArrow = document.querySelector('.carousel-arrow--left');
const rightArrow = document.querySelector('.carousel-arrow--right');
const scrollAmount = 320;
const autoScrollInterval = 3000; // ms between auto-advances
let autoScrollTimer = null;

function getCardWidth() {
  const card = carousel && carousel.querySelector('.product-card');
  if (!card) return scrollAmount;
  const gap = parseInt(getComputedStyle(carousel).gap) || 24;
  return card.offsetWidth + gap;
}

function advanceCarousel() {
  if (!carousel) return;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  if (carousel.scrollLeft >= maxScroll - 4) {
    // Loop back to start
    carousel.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    carousel.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
  }
}

function startAutoScroll() {
  stopAutoScroll();
  autoScrollTimer = setInterval(advanceCarousel, autoScrollInterval);
}

function stopAutoScroll() {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }
}

if (carousel) {
  // Manual arrow controls
  if (leftArrow) {
    leftArrow.addEventListener('click', () => {
      carousel.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
      startAutoScroll(); // reset timer after manual interaction
    });
  }
  if (rightArrow) {
    rightArrow.addEventListener('click', () => {
      advanceCarousel();
      startAutoScroll();
    });
  }

  // Pause on hover / touch
  carousel.addEventListener('mouseenter', stopAutoScroll);
  carousel.addEventListener('mouseleave', startAutoScroll);
  carousel.addEventListener('touchstart', stopAutoScroll, { passive: true });
  carousel.addEventListener('touchend', startAutoScroll, { passive: true });

  // Kick off auto-scroll once page has loaded
  window.addEventListener('load', startAutoScroll);
}

// ============================================
// FOOTER ACCORDION (Mobile)
// ============================================
const footerToggles = document.querySelectorAll('.footer-column__toggle');

footerToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    // Only activate accordion behavior on mobile
    if (window.innerWidth > 768) return;

    const column = toggle.closest('.footer-column');
    const isOpen = column.classList.contains('is-open');

    // Close all other columns
    document.querySelectorAll('.footer-column.is-open').forEach(col => {
      col.classList.remove('is-open');
      col.querySelector('.footer-column__toggle').setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked column
    if (!isOpen) {
      column.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    document.querySelectorAll('.footer-column').forEach(col => {
      col.classList.remove('is-open');
    });
  }
});

// ============================================
// FLOATING PROMO BADGE
// ============================================
const floatingPromo = document.getElementById('floatingPromo');
const floatingPromoClose = document.getElementById('floatingPromoClose');

if (floatingPromoClose && floatingPromo) {
  floatingPromoClose.addEventListener('click', (e) => {
    e.stopPropagation();
    floatingPromo.classList.add('is-hidden');
    sessionStorage.setItem('promoDismissed', 'true');
  });

  if (sessionStorage.getItem('promoDismissed') === 'true') {
    floatingPromo.classList.add('is-hidden');
  }

  let promoShown = false;
  window.addEventListener('scroll', () => {
    if (!promoShown && window.scrollY > 300) {
      floatingPromo.style.display = 'block';
      promoShown = true;
    }
  }, { passive: true });
}

/* Header nav: top-level dropdown triggers (Men/Women/Linen) open the menu on click/tap instead of navigating */
(function () {
  var triggers = document.querySelectorAll('.nav-links .nav-item.has-dropdown > .nav-link--trigger');
  if (!triggers.length) return;
  function closeAll(except) {
    document.querySelectorAll('.nav-links .nav-item.has-dropdown.is-open').forEach(function (li) {
      if (li === except) return;
      li.classList.remove('is-open');
      var a = li.querySelector('.nav-link--trigger');
      if (a) a.setAttribute('aria-expanded', 'false');
    });
  }
  triggers.forEach(function (t) {
    var li = t.parentElement;
    function toggle(e) {
      e.preventDefault();
      var willOpen = !li.classList.contains('is-open');
      closeAll(li);
      li.classList.toggle('is-open', willOpen);
      t.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }
    t.addEventListener('click', toggle);
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-links .nav-item.has-dropdown')) closeAll(null);
  });
})();
