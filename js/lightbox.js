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

    // Botones de cierre (X y backdrop)
    el.querySelectorAll('[data-lightbox-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
      });
    });

    // Controles de zoom en la barra superior
    el.querySelectorAll('[data-lightbox-zoom]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const action = btn.dataset.lightboxZoom;
        if (action === 'in') setZoom(zoomLevel + 0.6);
        else if (action === 'out') setZoom(zoomLevel - 0.6);
        else if (action === 'reset') setZoom(1);
      });
    });

    // El zoom se activa EXCLUSIVAMENTE al tocar o hacer clic sobre la foto de la joya
    if (imgEl) {
      imgEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setZoom(zoomLevel === 1 ? 2.2 : 1);
      });
    }

    // Tocar el fondo oscuro fuera de la imagen cierra el visor
    if (viewportEl) {
      viewportEl.addEventListener('click', (e) => {
        if (e.target === viewportEl || e.target === canvasEl) {
          close();
        }
      });
    }

    // Acción de compra directa desde el visor
    if (btnAction) {
      btnAction.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentProduct) return;
        const prodId = currentProduct.id;
        close();
        const card = document.querySelector(`[data-product-id="${prodId}"]`);
        if (card) {
          const addBtn = card.querySelector('[data-add-to-cart]');
          if (addBtn) addBtn.click();
        }
      });
    }

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el && el.classList.contains('is-open')) {
        close();
      }
    });

    // Delegación global: cualquier clic en la foto, título o tarjeta abre el visor en alta resolución
    document.addEventListener('click', (e) => {
      // Si el clic fue en "Agregar al carrito" o dentro del modal, no abrir visor
      if (e.target.closest('[data-add-to-cart]') || e.target.closest('.image-lightbox') || e.target.closest('.size-modal-overlay') || e.target.closest('.cart-drawer')) {
        return;
      }

      // 1. Clic en la tarjeta de producto o en su foto / título en la tienda
      const card = e.target.closest('.product-card');
      const media = e.target.closest('[data-zoom-pid]');
      if (card || media) {
        const targetCard = card || media.closest('.product-card');
        const pid = (media && media.dataset.zoomPid) || (targetCard && targetCard.dataset.productId);
        if (!pid) return;

        e.preventDefault();
        
        // Buscar producto en la base de datos de FYNX
        let p = (window.FYNX && window.FYNX.db && Array.isArray(window.FYNX.db.prods)) 
          ? window.FYNX.db.prods.find((x) => String(x.id) === String(pid)) 
          : null;

        // Si no está en memoria, extraer datos directamente de los atributos HTML de la tarjeta
        if (!p && targetCard) {
          p = {
            id: pid,
            name: targetCard.dataset.productName || 'Joya Exclusiva',
            price: Number(targetCard.dataset.productPrice) || 0,
            img: targetCard.dataset.productImage || 'logo.jpg',
            desc: targetCard.querySelector('.product-card__detail')?.textContent || 'Alta orfebrería en oro 18K garantizado.',
            stock: Number(targetCard.dataset.productStock) || 1,
            cat: targetCard.dataset.category || '',
            isKit: targetCard.dataset.isKit === '1' || targetCard.dataset.category === 'm',
            pieces: targetCard.dataset.productPieces || '',
            breakdown: targetCard.dataset.productBreakdown || '',
            suggestedRetail: targetCard.dataset.productRetail || ''
          };
        }

        if (p) open(p);
        return;
      }

      // 2. Miniaturas del panel administrativo (Joyas y Stock)
      const thumb = e.target.closest('.admin__thumb[data-zoom-img]');
      if (thumb) {
        e.preventDefault();
        open({
          img: thumb.dataset.zoomImg,
          name: thumb.dataset.zoomTitle || 'Detalle de Joya',
          desc: thumb.dataset.zoomDesc || 'Alta orfebrería en oro 18K garantizado.',
          price: Number(thumb.dataset.zoomPrice) || 0,
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
        canvasEl.style.transform = `scale(${zoomLevel / 1.5})`;
      } else {
        canvasEl.classList.remove('is-zoomed');
        canvasEl.style.transform = '';
      }
    }
  }

  function open(p) {
    if (!el) init();
    if (!el) el = document.querySelector('[data-lightbox]');
    if (!el) return;

    currentProduct = p;
    setZoom(1);

    const imgSrc = p.img || 'logo.jpg';
    if (imgEl) {
      imgEl.src = imgSrc;
      imgEl.alt = p.name || 'Joya Fynx Dorado';
    }
    const isKit = p.cat === 'm' || p.isKit;
    const esc = (window.FYNX && window.FYNX.esc) ? window.FYNX.esc : (s) => String(s);
    if (titleEl) titleEl.textContent = p.name || (isKit ? 'Kit Mayorista Fynx' : 'Pieza Exclusiva');
    if (descEl) {
      if (isKit && (p.pieces || p.breakdown || p.suggestedRetail)) {
        descEl.innerHTML = `
          ${p.pieces ? `<div style="color:var(--gold-1);font-weight:600;margin-bottom:6px;font-size:0.9rem">📦 Incluye: ${esc(p.pieces)}</div>` : ''}
          ${p.breakdown ? `<div style="margin-bottom:8px;line-height:1.45;color:var(--color-text)">📋 <b>Contenido:</b> ${esc(p.breakdown)}</div>` : ''}
          ${p.suggestedRetail ? `<div style="color:var(--gold-2);font-size:0.85rem;margin-bottom:8px;font-weight:500">💰 <b>Ganancia estimada:</b> ${esc(p.suggestedRetail)}</div>` : ''}
          <div style="color:var(--color-text-muted);font-size:0.8rem;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px">${esc(p.desc || 'Oro 18K garantizado de por vida.')}</div>
        `;
      } else {
        descEl.textContent = p.desc || 'Pieza forjada a mano en oro macizo 18K garantizado.';
      }
    }
    if (priceEl) {
      const money = (window.FYNX && window.FYNX.money) ? window.FYNX.money : (n) => `$ ${n}`;
      priceEl.textContent = money(p.price || 0);
    }
    if (btnAction) {
      const hasStock = typeof p.stock !== 'undefined' ? Number(p.stock) > 0 : true;
      btnAction.disabled = !hasStock;
      btnAction.textContent = hasStock ? (isKit ? 'Pedir Kit Mayorista' : 'Agregar al carrito') : (isKit ? 'Kit Agotado' : 'Pieza Agotada');
      btnAction.style.opacity = hasStock ? '1' : '0.5';
    }

    // Mostrar el visor de forma infalible
    el.removeAttribute('hidden');
    el.hidden = false;
    el.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    
    // Forzar reflow para animación suave
    void el.offsetWidth;
    el.classList.add('is-open');
  }

  function close() {
    if (!el) return;
    el.classList.remove('is-open');
    setZoom(1);
    setTimeout(() => {
      el.style.display = 'none';
      el.setAttribute('hidden', '');
      el.hidden = true;
      document.documentElement.style.overflow = '';
      currentProduct = null;
    }, 240);
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
