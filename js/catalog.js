// Catálogo: pinta filtros y tarjetas desde los datos del panel.
(() => {
  const init = () => {
    const F = window.FYNX;
    if (!F || !F.db) return;
    const { db, esc, money, catName, waUrl } = F;
    const grid = document.querySelector('[data-catalog-grid]');
    const filters = document.querySelector('[data-catalog-filters]');
    const count = document.querySelector('[data-catalog-count]');
    if (!grid || !filters) return;

    let cat = 'todo';
    const gem = '<svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" opacity=".55" aria-hidden="true"><polygon points="32 8 50 24 32 56 14 24"/><line x1="14" y1="24" x2="50" y2="24"/><line x1="32" y1="8" x2="32" y2="56"/></svg>';

    const card = (p) => {
      const stock = Number(p.stock) || 0;
      const hasStock = stock > 0;
      const imgSrc = p.img || 'logo.jpg';
      const isKit = p.cat === 'm';
      const piecesText = p.pieces || '';
      const breakdownText = p.breakdown || '';
      const retailText = p.suggestedRetail || '';

      return `
      <li class="product-card ${hasStock ? '' : 'product-card--out'}" data-category="${esc(p.cat)}" data-is-kit="${isKit ? '1' : '0'}" data-product data-product-id="${esc(p.id)}" data-product-name="${esc(p.name)}" data-product-price="${Number(p.price) || 0}" data-product-image="${esc(imgSrc)}" data-product-sizes="${esc(p.sizes || '')}" data-product-stock="${stock}" data-product-pieces="${esc(piecesText)}" data-product-breakdown="${esc(breakdownText)}" data-product-retail="${esc(retailText)}">
        <div class="product-card__media" data-zoom-pid="${esc(p.id)}" role="button" tabindex="0" title="Toca para ampliar y detallar">
          <img class="product-card__image" src="${esc(imgSrc)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="400" height="500" onerror="this.onerror=null;this.src='logo.jpg'">
          <div class="product-card__zoom-hint" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            <span>Detallar</span>
          </div>
          ${!hasStock 
            ? `<span class="product-card__badge product-card__badge--out">Agotado</span>` 
            : isKit 
              ? `<span class="product-card__badge" style="background:linear-gradient(135deg,#d4af37,#996515);color:#000;font-weight:700;letter-spacing:0.06em">${esc(p.tag || 'KIT MAYORISTA')}</span>` 
              : (p.tag ? `<span class="product-card__badge">${esc(p.tag)}</span>` : '')}
        </div>
        <div class="product-card__body">
          <p class="product-card__category">${esc(isKit ? 'Mayorista · Kit / Lote' : catName(p.cat))}</p>
          <h3 class="product-card__name">${esc(p.name)}</h3>

          ${(isKit && piecesText) ? `
            <div style="display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--gold-1);background:rgba(212,175,55,0.12);padding:2px 8px;border-radius:4px;margin-bottom:6px;font-weight:var(--fw-medium)">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <span>Incluye: <b>${esc(piecesText)}</b></span>
            </div>
          ` : ''}

          <p class="product-card__detail">
            ${isKit && breakdownText 
              ? esc(breakdownText.slice(0, 95)) + (breakdownText.length > 95 ? '…' : '')
              : `${esc((p.desc || '').slice(0, 75))}${p.sizes ? ` · <span class="product-card__sizes">${p.sizes.split(',').length} tallas</span>` : ''}`}
          </p>

          ${(isKit && retailText) ? `
            <div style="display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--gold-2);margin-bottom:4px;font-weight:var(--fw-medium)">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span><small style="color:var(--color-text-muted)">Ganancia:</small> ${esc(retailText)}</span>
            </div>
          ` : ''}

          <p class="product-card__price">
            <data value="${Number(p.price) || 0}">${money(p.price)}</data>
            <span style="display:block;font-size:0.75rem;margin-top:2px;color:${hasStock ? (stock <= 2 ? 'var(--gold-1)' : 'var(--color-text-muted)') : '#ff9a9a'}">
              ${hasStock 
                ? (isKit 
                    ? (stock === 1 ? 'Último kit disponible' : `${stock} kits disponibles`) 
                    : (stock === 1 ? 'Última pieza disponible' : `${stock} disponibles`)) 
                : 'Agotado'}
            </span>
          </p>
          <button type="button" class="button button--primary product-card__cta" ${hasStock ? 'data-add-to-cart' : 'disabled aria-disabled="true"'} ${isKit ? 'style="background:var(--gold);color:#000;font-weight:var(--fw-bold)"' : ''}>
            ${hasStock ? (isKit ? 'Pedir Kit Mayorista' : 'Agregar al carrito') : 'Agotado'}
          </button>
        </div>
      </li>`;
    };

    const render = () => {
      const g = document.querySelector('[data-catalog-grid]');
      const f = document.querySelector('[data-catalog-filters]');
      const cnt = document.querySelector('[data-catalog-count]');
      if (!g || !f) return;
      if (cat !== 'todo' && !db.cats.some((c) => c.id == cat)) cat = 'todo';
      
      // Chips con stock acumulado por categoría
      f.innerHTML = [{ id: 'todo', name: 'Todo' }, ...db.cats].map((c) => {
        const catStock = F.getCategoryStock(c.id);
        return `<button class="catalog__filter" type="button" data-filter="${esc(c.id)}" aria-pressed="${cat == c.id}">
          ${esc(c.name)} <small style="opacity:0.75;font-size:0.75em">(${catStock})</small>
        </button>`;
      }).join('');
      f.hidden = false;

      const list = db.prods.filter((p) => p.on && (cat === 'todo' || p.cat == cat));
      if (cnt) cnt.textContent = `${list.length} ${list.length === 1 ? 'joya' : 'joyas'}`;
      g.innerHTML = list.length ? list.map(card).join('') : '<li class="catalog__empty">Pronto tendremos piezas nuevas en esta categoría.</li>';
      
      document.querySelectorAll('[data-wa-link]').forEach((a) => { a.href = waUrl(a.dataset.waMsg || 'Hola Fynx Dorado'); });
      updateWaButtons();
    };

    const updateWaButtons = () => {
      const clean = (n) => {
        let num = String(n || '').replace(/\D/g, '');
        if (num.length === 10 && !num.startsWith('57')) num = '57' + num;
        return num || '573116240316';
      };
      const l1Num = clean(db.cfg.wa || '573116240316');
      const l1Text = db.cfg.waLabel || 'Línea 1 · Asesoría';
      const l2Num = clean(db.cfg.wa2 || '573001234567');
      const l2Text = db.cfg.wa2Label || 'Línea 2 · Pedidos';

      document.querySelectorAll('[data-wa-btn="1"]').forEach((btn) => {
        btn.href = `https://api.whatsapp.com/send?phone=${l1Num}&text=${encodeURIComponent('Hola Joyería Fynx Dorado, deseo comunicarme con la Línea 1.')}`;
        const span = btn.querySelector('[data-wa-text="1"]');
        if (span) span.textContent = l1Text;
      });

      document.querySelectorAll('[data-wa-btn="2"]').forEach((btn) => {
        btn.href = `https://api.whatsapp.com/send?phone=${l2Num}&text=${encodeURIComponent('Hola Joyería Fynx Dorado, deseo comunicarme con la Línea 2.')}`;
        const span = btn.querySelector('[data-wa-text="2"]');
        if (span) span.textContent = l2Text;
      });

      document.querySelectorAll('[data-wa-text="1"]').forEach((el) => { el.textContent = l1Text; });
      document.querySelectorAll('[data-wa-text="2"]').forEach((el) => { el.textContent = l2Text; });

      document.querySelectorAll('[data-wa-link]').forEach((a) => {
        const msg = a.dataset.waMsg || 'Hola Joyería Fynx Dorado, deseo asesoría personalizada para una joya.';
        a.href = `https://api.whatsapp.com/send?phone=${l1Num}&text=${encodeURIComponent(msg)}`;
      });
    };

    F.updateWaButtons = updateWaButtons;

    filters.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (b) { cat = b.dataset.filter; render(); }
    });

    F.render = render;
    render();
    updateWaButtons();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
