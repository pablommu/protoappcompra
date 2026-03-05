/**
 * IOP Compra — Home SPA
 * Interactividad: carrusel de alertas, tab bar, feedback táctil
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     ALERT ICONS — SVG por tipo de alerta
  ───────────────────────────────────────────────────────── */
  const ALERT_ICONS = {
    warning: `<svg class="icon icon--md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 9v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>`,
    info: `<svg class="icon icon--md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12 8v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M12 11v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    success: `<svg class="icon icon--md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
      <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    danger: `<svg class="icon icon--md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  };

  const ARROW_ICON = `<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  /* ─────────────────────────────────────────────────────────
     LOAD ALERTS — fetch data/alerts.json y renderiza cards
  ───────────────────────────────────────────────────────── */
  function renderAlertCard(alert, index, total) {
    return `
      <article class="alert-card alert-card--${alert.type}"
               role="listitem"
               tabindex="0"
               aria-label="${alert.ariaLabel}">
        <div class="alert-card__header">
          <div class="alert-card__icon-wrap" aria-hidden="true">
            ${ALERT_ICONS[alert.type] ?? ALERT_ICONS.info}
          </div>
          <p class="alert-card__label">${alert.label}</p>
        </div>
        <div class="alert-card__content">
          <p class="alert-card__value">${alert.value}</p>
          <p class="alert-card__desc">${alert.desc}</p>
        </div>
        <button class="alert-card__action"
                type="button"
                aria-label="${alert.action}"
                tabindex="-1">
          <span class="alert-card__action-label">${alert.action}</span>
          ${ARROW_ICON}
        </button>
      </article>`;
  }

  function renderDot(index, total, label) {
    const isFirst = index === 0;
    return `<button class="carousel-dot${isFirst ? ' carousel-dot--active' : ''}"
              role="tab" type="button"
              aria-selected="${isFirst}"
              aria-label="Alerta ${index + 1} de ${total}: ${label}"></button>`;
  }

  async function loadAlerts() {
    const scroll    = document.querySelector('.alerts-scroll');
    const dotsWrap  = document.querySelector('.carousel-dots');

    if (!scroll || !dotsWrap) return;

    try {
      const res  = await fetch('data/alerts.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { alerts } = await res.json();

      scroll.innerHTML   = alerts.map((a, i) => renderAlertCard(a, i, alerts.length)).join('');
      dotsWrap.innerHTML = alerts.map((a, i) => renderDot(i, alerts.length, a.label)).join('');

      initAlertCarousel();
      initAlertActions();
    } catch (err) {
      console.error('[IOP Compra] Error cargando alertas:', err);
    }
  }

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
     KPI SCROLL — scroll vertical con snap, sincroniza dots
  ───────────────────────────────────────────────────────── */
  function initKpiScroll() {
    const scroll   = document.querySelector('.kpi-scroll');
    const dotsWrap = document.querySelector('.kpi-dots');
    if (!scroll || !dotsWrap) return;

    const items = Array.from(scroll.querySelectorAll('.kpi-item'));
    let activeIndex = 0;

    // Renderiza dots
    dotsWrap.innerHTML = items.map((_, i) =>
      `<span class="kpi-dot${i === 0 ? ' kpi-dot--active' : ''}"></span>`
    ).join('');
    const dots = Array.from(dotsWrap.querySelectorAll('.kpi-dot'));

    function setActive(index) {
      if (index === activeIndex) return;
      dots[activeIndex].classList.remove('kpi-dot--active');
      activeIndex = index;
      dots[activeIndex].classList.add('kpi-dot--active');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = items.indexOf(entry.target);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { root: scroll, threshold: 0.6 }
    );

    items.forEach((item) => observer.observe(item));
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
    loadAlerts();   // async: fetch JSON → render cards + dots → init carousel
    initKpiScroll();
    initTabBar();
    formatStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
