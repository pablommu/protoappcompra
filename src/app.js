/**
 * IOP Compra — Home SPA
 * Interactividad: tab bar, KPI carousel (scroll snap), dropdown campaña
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     KPI DATA — valores por campaña
  ───────────────────────────────────────────────────────── */
  const KPI_BY_CAMPAIGN = {
    I26: [
      { label: 'MARKUP',    tag: 'I26',     value: '201,61', unit: '%'   },
      { label: 'COBERTURA', tag: 'I26',     value: '4,2',    unit: 'sem' },
      { label: 'PEDIDOS',   tag: 'ACTIVOS', value: '38',     unit: ''    },
    ],
    V26: [
      { label: 'MARKUP',    tag: 'V26',     value: '198,30', unit: '%'   },
      { label: 'COBERTURA', tag: 'V26',     value: '3,8',    unit: 'sem' },
      { label: 'PEDIDOS',   tag: 'ACTIVOS', value: '42',     unit: ''    },
    ],
    I25: [
      { label: 'MARKUP',    tag: 'I25',     value: '195,12', unit: '%'   },
      { label: 'COBERTURA', tag: 'I25',     value: '5,1',    unit: 'sem' },
      { label: 'PEDIDOS',   tag: 'ACTIVOS', value: '31',     unit: ''    },
    ],
    V25: [
      { label: 'MARKUP',    tag: 'V25',     value: '202,88', unit: '%'   },
      { label: 'COBERTURA', tag: 'V25',     value: '4,6',    unit: 'sem' },
      { label: 'PEDIDOS',   tag: 'ACTIVOS', value: '27',     unit: ''    },
    ],
    I24: [
      { label: 'MARKUP',    tag: 'I24',     value: '189,74', unit: '%'   },
      { label: 'COBERTURA', tag: 'I24',     value: '3,9',    unit: 'sem' },
      { label: 'PEDIDOS',   tag: 'ACTIVOS', value: '35',     unit: ''    },
    ],
  };

  let currentCampaign = 'I26';

  /* ─────────────────────────────────────────────────────────
     KPI CAROUSEL — scroll snap VERTICAL + dots clickables
  ───────────────────────────────────────────────────────── */
  function initKpiCarousel() {
    var carousel      = document.getElementById('kpi-carousel');
    var dots          = Array.from(document.querySelectorAll('.kpi-page-dot'));
    var metricLabelEl = document.getElementById('kpi-metric-label');
    var campaignTagEl = document.getElementById('kpi-campaign-tag');

    if (!carousel) return null;

    /** Navega al slide indicado con animación */
    function goToSlide(index) {
      var slideHeight = carousel.clientHeight;
      carousel.scrollTo({ top: index * slideHeight, behavior: 'smooth' });
      syncState(index);
    }

    /** Sincroniza el header (label+tag) y los dots con el slide visible */
    function syncState(index) {
      var kpis = KPI_BY_CAMPAIGN[currentCampaign];
      var kpi  = kpis[index];
      if (!kpi) return;

      metricLabelEl.textContent = kpi.label;
      campaignTagEl.textContent = kpi.tag;

      var btn = document.getElementById('campaign-btn');
      if (btn) btn.setAttribute('aria-label', 'Cambiar campaña: ' + kpi.tag);

      dots.forEach(function(dot, i) {
        var isActive = i === index;
        dot.classList.toggle('kpi-page-dot--inactive', !isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    /** Rellena los slides con los datos de la campaña activa */
    function renderCampaign(campaign) {
      currentCampaign = campaign;
      var kpis   = KPI_BY_CAMPAIGN[campaign];
      var slides = Array.from(carousel.querySelectorAll('.kpi-slide'));

      slides.forEach(function(slide, i) {
        var kpi    = kpis[i];
        var valEl  = slide.querySelector('.kpi-hero__value');
        var unitEl = slide.querySelector('.kpi-hero__unit');
        if (valEl)  valEl.textContent  = kpi.value;
        if (unitEl) unitEl.textContent = kpi.unit;
      });

      // Volver al primer slide instantáneamente (sin animación)
      carousel.scrollTop = 0;
      syncState(0);
    }

    // ── Click en dots → navegación directa al slide ──
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        goToSlide(i);
      });
    });

    // ── Detectar slide visible cuando el scroll vertical se detiene ──
    var scrollTimer = null;
    carousel.addEventListener('scroll', function() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function() {
        var slideHeight = carousel.clientHeight;
        if (slideHeight === 0) return;
        var idx = Math.round(carousel.scrollTop / slideHeight);
        syncState(idx);
      }, 60);
    }, { passive: true });

    // Estado inicial
    syncState(0);

    return { renderCampaign: renderCampaign };
  }

  /* ─────────────────────────────────────────────────────────
     CAMPAIGN DROPDOWN — abre/cierra con animación
  ───────────────────────────────────────────────────────── */
  function initCampaignDropdown(carouselCtrl) {
    var btn      = document.getElementById('campaign-btn');
    var dropdown = document.getElementById('campaign-dropdown');
    if (!btn || !dropdown) return;

    function openDropdown() {
      dropdown.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      dropdown.style.transition = 'none';
      dropdown.style.opacity    = '0';
      dropdown.style.transform  = 'translateY(-6px) scale(0.97)';
      requestAnimationFrame(function() {
        dropdown.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
        dropdown.style.opacity    = '1';
        dropdown.style.transform  = 'translateY(0) scale(1)';
      });
    }

    function closeDropdown() {
      btn.setAttribute('aria-expanded', 'false');
      dropdown.style.transition = 'opacity 0.14s ease, transform 0.14s ease';
      dropdown.style.opacity    = '0';
      dropdown.style.transform  = 'translateY(-4px) scale(0.97)';
      setTimeout(function() {
        dropdown.hidden = true;
        dropdown.style.cssText  = '';
      }, 140);
    }

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.hidden ? openDropdown() : closeDropdown();
    });

    Array.from(dropdown.querySelectorAll('.campaign-option')).forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var campaign = opt.dataset.campaign;

        // Actualizar selección visual
        Array.from(dropdown.querySelectorAll('.campaign-option')).forEach(function(o) {
          o.classList.toggle('campaign-option--active', o === opt);
          o.setAttribute('aria-selected', o === opt ? 'true' : 'false');
        });

        if (carouselCtrl) carouselCtrl.renderCampaign(campaign);
        closeDropdown();
      });
    });

    // Cerrar al tocar fuera
    document.addEventListener('click', function() {
      if (!dropdown.hidden) closeDropdown();
    });
  }

  /* ─────────────────────────────────────────────────────────
     TAB BAR
  ───────────────────────────────────────────────────────── */
  function initTabBar() {
    var tabs = Array.from(document.querySelectorAll('.tab-bar__item'));

    function activateTab(tab) {
      tabs.forEach(function(t) {
        var isTarget = t === tab;
        t.classList.toggle('tab-bar__item--active', isTarget);
        isTarget ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current');

        var existing = t.querySelector('.tab-bar__indicator');
        if (isTarget && !existing) {
          var ind = document.createElement('span');
          ind.className = 'tab-bar__indicator';
          ind.setAttribute('aria-hidden', 'true');
          t.appendChild(ind);
        } else if (!isTarget && existing) {
          existing.remove();
        }
      });
    }

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() { activateTab(tab); });
    });
  }

  /* ─────────────────────────────────────────────────────────
     WEEK STATS — separador de miles
  ───────────────────────────────────────────────────────── */
  function formatStats() {
    document.querySelectorAll('.week-stat__value').forEach(function(el) {
      var raw = parseInt(el.textContent, 10);
      if (!isNaN(raw) && raw >= 1000) el.textContent = raw.toLocaleString('es-ES');
    });
  }

  /* ─────────────────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────────────────── */
  function init() {
    var carouselCtrl = initKpiCarousel();
    initCampaignDropdown(carouselCtrl);
    initTabBar();
    formatStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
