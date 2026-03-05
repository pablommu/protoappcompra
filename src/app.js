/**
 * IOP Compra — Home SPA
 * Interactividad: carrusel de alertas, tab bar, feedback táctil
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     CAROUSEL — sincroniza dots con scroll horizontal
  ───────────────────────────────────────────────────────── */
  function initAlertCarousel() {
    const scroll = document.querySelector('.alerts-scroll');
    const dots   = Array.from(document.querySelectorAll('.carousel-dot'));

    if (!scroll || !dots.length) return;

    let activeIndex = 0;

    function setActive(index) {
      if (index === activeIndex) return;
      dots[activeIndex].classList.remove('carousel-dot--active');
      dots[activeIndex].setAttribute('aria-selected', 'false');
      activeIndex = index;
      dots[activeIndex].classList.add('carousel-dot--active');
      dots[activeIndex].setAttribute('aria-selected', 'true');
    }

    // IntersectionObserver: marca el card visible como activo
    const cards = Array.from(scroll.querySelectorAll('.alert-card'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const idx = cards.indexOf(entry.target);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { root: scroll, threshold: 0.55 }
    );

    cards.forEach((card) => observer.observe(card));

    // Dot → scroll to card
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        if (!cards[i]) return;
        cards[i].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      });
    });

    // Keyboard navigation dentro del scroll
    scroll.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && activeIndex < cards.length - 1) {
        e.preventDefault();
        cards[activeIndex + 1].scrollIntoView({
          behavior: 'smooth', inline: 'start', block: 'nearest',
        });
        cards[activeIndex + 1].focus({ preventScroll: true });
      } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
        e.preventDefault();
        cards[activeIndex - 1].scrollIntoView({
          behavior: 'smooth', inline: 'start', block: 'nearest',
        });
        cards[activeIndex - 1].focus({ preventScroll: true });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     TAB BAR — gestiona estado activo entre pestañas
  ───────────────────────────────────────────────────────── */
  function initTabBar() {
    const tabs = Array.from(document.querySelectorAll('.tab-bar__item'));

    function activateTab(tab) {
      tabs.forEach((t) => {
        const isTarget = t === tab;
        t.classList.toggle('tab-bar__item--active', isTarget);
        if (isTarget) {
          t.setAttribute('aria-current', 'page');
        } else {
          t.removeAttribute('aria-current');
        }

        // Gestiona indicador superior
        const existing = t.querySelector('.tab-bar__indicator');
        if (isTarget && !existing) {
          const indicator = document.createElement('span');
          indicator.className = 'tab-bar__indicator';
          indicator.setAttribute('aria-hidden', 'true');
          t.prepend(indicator);
        } else if (!isTarget && existing) {
          existing.remove();
        }
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab));
    });
  }

  /* ─────────────────────────────────────────────────────────
     ALERT CARDS — feedback táctil en acción
  ───────────────────────────────────────────────────────── */
  function initAlertActions() {
    document.querySelectorAll('.alert-card__action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card  = btn.closest('.alert-card');
        const label = card?.querySelector('.alert-card__label')?.textContent ?? '';
        const value = card?.querySelector('.alert-card__value')?.textContent ?? '';
        // En producción abriría un drawer/modal con el detalle
        console.info(`[IOP Compra] Alerta: ${label.trim()} — ${value.trim()}`);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     WEEK STATS — formatea números con separador de miles
     (datos estáticos en este prototipo)
  ───────────────────────────────────────────────────────── */
  function formatStats() {
    document.querySelectorAll('.week-stat__value').forEach((el) => {
      const raw = parseInt(el.textContent, 10);
      if (!isNaN(raw) && raw >= 1000) {
        el.textContent = raw.toLocaleString('es-ES');
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────────────────── */
  function init() {
    initAlertCarousel();
    initTabBar();
    initAlertActions();
    formatStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
