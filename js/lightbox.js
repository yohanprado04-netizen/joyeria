// Visor / Lightbox Dark Luxury para ampliar y detallar joyas en alta resolución.
(() => {
  let el, imgEl, titleEl, descEl, priceEl, btnAction, canvasEl, viewportEl;
  let currentProduct = null;
  let zoomLevel = 1;

  function init() {
    el = document.querySelector('[data-lightbox]');
    if (!el) return;

    imgEl = el.querySelector('[data-lightbox-img]');
    titleEl = el.querySelector('[data-lightbox-title]');
    descEl = el.querySelector('[data-lightbox-desc]');
    priceEl = el.querySelector('[data-lightbox-price]');
    btnAction = el.querySelector('[data-lightbox-action]');
    canvasEl = el.querySelector('[data-lightbox-canvas]');
    viewportEl = el.querySelector('[data-lightbox-viewport]');

    // Botones de cierre
    el.querySelectorAll('[data-lightbox-close]').forEach((btn) => {
      btn.addEventListener('click', close);
    });

    // Controles de zoom
    el.querySelectorAll('[data-lightbox-zoom]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.lightboxZoom;
        if (action === 'in') setZoom(zoomLevel + 0.5);
        else if (action === 'out') setZoom(zoomLevel - 0.5);
        else if (action === 'reset') setZoom(1);
      });
    });

    // El zoom se activa EXCLUSIVAMENTE al tocar o hacer clic sobre la foto de la joya
    if (imgEl) {
      imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        setZoom(zoomLevel === 1 ? 2.2 : 1);
      });
    }

    // Tocar o hacer clic en el fondo oscuro exterior cierra el visor de inmediato
    if (viewportEl) {
      viewportEl.addEventListener('click', (e) => {
        if (e.target === viewportEl || e.target === canvasEl) {
          close();
        }
      });
    }

    // Acción de compra directa desde el visor
    if (btnAction) {
      btnAction.addEventListener('click', () => {
        if (!currentProduct) return;
        close();
        // Disparar apertura del modal de talla o agregar al carrito
        const card = document.querySelector(`[data-product-id="${currentProduct.id}"]`);
        if (card) {
          const addBtn = card.querySelector('[data-add-to-cart]');
          if (addBtn) addBtn.click();
        }
      });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el && el.classList.contains('is-open')) {
        close();
      }
    });

    // Delegación de clics en tarjetas de la tienda y miniaturas del panel para abrir visor
    document.addEventListener('click', (e) => {
      // 1. Tarjetas del catálogo oficial
      const media = e.target.closest('[data-zoom-pid]');
      if (media && !e.target.closest('[data-add-to-cart]')) {
        e.preventDefault();
        const pid = media.dataset.zoomPid;
        const p = (window.FYNX && window.FYNX.db && window.FYNX.db.prods) ? window.FYNX.db.prods.find((x) => x.id == pid) : null;
        if (p) open(p);
        return;
      }

      // 2. Miniaturas del panel admin (Joyas y Stock)
      const thumb = e.target.closest('.admin__thumb[data-zoom-img]');
      if (thumb) {
        e.preventDefault();
        open({
          img: thumb.dataset.zoomImg,
          name: thumb.dataset.zoomTitle || 'Detalle de Joya',
          desc: thumb.dataset.zoomDesc || 'Alta orfebrería en oro 18K.',
          price: thumb.dataset.zoomPrice || 0,
          stock: 1
        });
      }
    });
  }

  function setZoom(lvl) {
    zoomLevel = Math.max(1, Math.min(3.5, lvl));
    if (canvasEl) {
      if (zoomLevel > 1) {
        canvasEl.classList.add('is-zoomed');
        canvasEl.style.transform = `scale(${zoomLevel / 1.6})`;
      } else {
        canvasEl.classList.remove('is-zoomed');
        canvasEl.style.transform = '';
      }
    }
  }

  function open(p) {
    if (!el) init();
    if (!el) return;

    currentProduct = p;
    setZoom(1);

    const imgSrc = p.img || 'logo.jpg';
    if (imgEl) {
      imgEl.src = imgSrc;
      imgEl.alt = p.name || 'Joya Fynx Dorado';
    }
    if (titleEl) titleEl.textContent = p.name || 'Pieza Exclusiva';
    if (descEl) descEl.textContent = p.desc || 'Pieza forjada a mano en oro macizo 18K garantizado.';
    if (priceEl) {
      const money = window.FYNX && window.FYNX.money ? window.FYNX.money : (n) => `$ ${n}`;
      priceEl.textContent = money(p.price || 0);
    }
    if (btnAction) {
      const hasStock = Number(p.stock) > 0;
      btnAction.disabled = !hasStock;
      btnAction.textContent = hasStock ? 'Agregar al carrito' : 'Pieza Agotada';
      if (!hasStock) btnAction.style.opacity = '0.5';
      else btnAction.style.opacity = '';
    }

    el.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      el.classList.add('is-open');
    });
  }

  function close() {
    if (!el) return;
    el.classList.remove('is-open');
    setZoom(1);
    setTimeout(() => {
      el.hidden = true;
      document.documentElement.style.overflow = '';
      currentProduct = null;
    }, 280);
  }

  if (typeof window !== 'undefined') {
    if (!window.FYNX) window.FYNX = {};
    window.FYNX.openLightbox = open;
    window.FYNX.closeLightbox = close;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
