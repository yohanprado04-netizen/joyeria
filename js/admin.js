// Panel de administración oculto: se abre con 5 clics en el texto del pie de página (o con #admin en la URL).
// Barra lateral a la izquierda en escritorio; en móvil, menú lateral deslizable. El contenido ocupa el resto.
(() => {
  const F = window.FYNX, db = F.db, esc = F.esc, money = F.money;
  const $ = (s, r = document) => r.querySelector(s);
  const IDLE = 10 * 60 * 1000, LOCK = 'fynx_lock';
  const TITLES = { home: 'Resumen', p: 'Joyas', st: 'Stock', fin: 'Finanzas', c: 'Categorías', s: 'Ajustes' };
  const IC = {
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    p: '<polygon points="12 2 3 9 12 22 21 9"/><line x1="3" y1="9" x2="21" y2="9"/>',
    st: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    fin: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    c: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1"/>',
    s: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
  let root, toastEl, authed = false, defaultPin = false, sec = 'home', edit = null, pend = null, idleT, toastT;
  let stockFilter = 'all';

  const H = async (s) => (window.crypto && crypto.subtle)
    ? [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('fynx:' + s)))].map((b) => b.toString(16).padStart(2, '0')).join('')
    : s;
  const lockInfo = () => { try { return JSON.parse(localStorage.getItem(LOCK)) || { n: 0, until: 0 }; } catch (e) { return { n: 0, until: 0 }; } };
  const setLock = (o) => { try { localStorage.setItem(LOCK, JSON.stringify(o)); } catch (e) {} };
  const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2400); };
  const commit = (m) => { if (!F.save()) return toast('Sin espacio: usa fotos más pequeñas'); F.render(); draw(); toast(m); };

  /* ---- Sesión: PIN con bloqueo por intentos y persistencia ---- */
  const AUTH_KEY = 'fynx_admin_authed';
  async function login(pin) {
    const L = lockInfo(), now = Date.now();
    if (L.until > now) return `Demasiados intentos. Espera ${Math.ceil((L.until - now) / 1000)} s.`;
    let ok = false;
    if (db.cfg.pinHash) ok = (await H(pin)) === db.cfg.pinHash;
    else if (pin === (db.cfg.pin || '1234')) { ok = true; db.cfg.pinHash = await H(pin); delete db.cfg.pin; F.save(); }
    if (ok) {
      setLock({ n: 0, until: 0 });
      authed = true;
      localStorage.setItem(AUTH_KEY, 'true'); // Mantiene la sesión abierta en PWA y navegador
      defaultPin = pin === '1234';
      sec = 'home';
      edit = null;
      draw();
      return '';
    }
    const n = L.n + 1;
    setLock({ n: n >= 5 ? 0 : n, until: n >= 5 ? now + 60000 : 0 });
    return n >= 5 ? 'Demasiados intentos. Espera 60 s.' : 'PIN incorrecto';
  }
  const bump = () => {};

  /* ---- Vistas ---- */
  const home = () => {
    const fin = F.getFinances ? F.getFinances() : { totalSales: 0, totalOrders: 0, pendingCount: 0, inventoryValue: 0, totalPieces: 0, sales: [] };
    const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';

    return `
      <div class="admin__stats">
        <div class="admin__stat"><span>Ventas Confirmadas</span><b>${money(fin.totalSales)}</b></div>
        <div class="admin__stat"><span>Pedidos Concretados</span><b>${fin.totalOrders}</b></div>
        <div class="admin__stat"><span>Valor Inventario</span><b>${money(fin.inventoryValue)}</b></div>
        <div class="admin__stat"><span>Stock Físico</span><b>${fin.totalPieces}</b></div>
      </div>

      ${fin.pendingCount ? `
        <div class="admin__card" style="border:1px solid var(--gold-2);background:rgba(212,175,55,0.08)">
          <div class="admin__bar">
            <div>
              <h3 style="color:var(--gold-1);margin:0 0 4px;font-size:0.95rem;letter-spacing:0.12em;text-transform:uppercase">
                Tienes ${fin.pendingCount} pedido${fin.pendingCount > 1 ? 's' : ''} pendiente${fin.pendingCount > 1 ? 's' : ''} por confirmar
              </h3>
              <p style="margin:0;font-size:0.85rem;color:var(--color-text-muted)">
                Los clientes enviaron el pedido por WhatsApp. El stock <b>no</b> se descontará hasta que confirmes la compra.
              </p>
            </div>
            <button class="button button--primary admin__sm" data-a="go" data-k="fin">Revisar y Confirmar</button>
          </div>
        </div>
      ` : ''}

      ${fin.lowStockCount ? `
        <div class="admin__card admin__warn">
          <div class="admin__bar">
            <div>
              <h3 style="color:var(--gold-1);margin:0 0 4px">Alerta de Stock Bajo</h3>
              <p style="margin:0">Hay <b>${fin.lowStockCount}</b> joyas con 2 o menos unidades disponibles.</p>
            </div>
            <button class="button button--primary admin__sm" data-a="go" data-k="st">Revisar Stock</button>
          </div>
        </div>
      ` : ''}

      <div class="admin__card">
        <div class="admin__bar">
          <div>
            <h3 style="margin:0 0 4px">Centro de Alertas y Notificaciones</h3>
            <span class="admin__badge admin__badge--ok">Alertas sonoras y en pantalla: SIEMPRE ACTIVAS</span>
          </div>
          <button class="button ${notifGranted ? 'button--ghost' : 'button--primary'} admin__sm" data-a="enable-notifs">
            ${notifGranted ? 'Notificaciones del Sistema Activas (Probar)' : 'Activar y Probar Alerta'}
          </button>
        </div>
        <p style="margin:var(--space-2) 0 0;font-size:0.85rem;color:var(--color-text-muted);line-height:1.45">
          Cada vez que un cliente realice un pedido, tu dispositivo emitirá una campanilla sonora y mostrará un banner dorado en tiempo real. Para notificaciones emergentes con la pantalla apagada: en <b>iPhone (iOS)</b> pulsa <i>Compartir &gt; Agregar a inicio</i>; en <b>Android</b> se activan automáticamente bajo conexión segura (HTTPS).
        </p>
      </div>

      <div class="admin__card">
        <div class="admin__bar">
          <h3>Últimas Ventas y Pedidos</h3>
          ${(db.sales && db.sales.length) ? `<button class="button button--ghost admin__sm" data-a="go" data-k="fin">Ver Finanzas Detalladas</button>` : ''}
        </div>
        ${(db.sales && db.sales.length) ? `
          <div class="admin__list">
            ${db.sales.slice(0, 5).map((s) => {
              const isPending = s.status === 'pending';
              const isCancelled = s.status === 'cancelled';
              const statusBadge = isPending 
                ? '<span class="admin__badge admin__badge--warn">Por confirmar</span>'
                : isCancelled
                ? '<span class="admin__badge admin__badge--danger">Cancelado</span>'
                : '<span class="admin__badge admin__badge--ok">Confirmado</span>';

              const pago = esc((s.client && s.client.payment) || 'Transferencia');
              const isCash = pago.toLowerCase().includes('efect') || pago.toLowerCase().includes('contra');

              return `
                <article class="admin__sale-card" style="border:1px solid ${isPending ? 'var(--gold-2)' : 'var(--color-border)'}">
                  <div class="admin__sale-meta">
                    <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:6px;flex-wrap:wrap">
                      <b style="font-size:1.15rem;color:var(--gold-1);letter-spacing:0.02em;white-space:nowrap">${money(s.total)}</b>
                      <small style="color:var(--color-text-muted)">${new Date(s.date).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</small>
                      ${statusBadge}
                      <span class="admin__badge ${isCash ? 'admin__badge--ok' : 'admin__badge--warn'}">Pago: ${pago}</span>
                      ${(s.client && (s.client.advisorLabel || s.client.advisorLine)) ? `<span class="admin__badge" style="background:rgba(212,175,55,0.15);color:var(--gold-1);border:1px solid var(--gold-2)">${esc(s.client.advisorLabel || `Línea ${s.client.advisorLine}`)}</span>` : ''}
                    </div>
                    <div style="font-size:0.875rem;color:var(--color-text);margin-bottom:3px">
                      <b>${esc((s.client && s.client.name) || 'Cliente WhatsApp')}</b>
                      ${(s.client && s.client.phone) ? `· <small style="color:var(--color-text-muted)">${esc(s.client.phone)}</small>` : ''}
                    </div>
                    <div style="font-size:0.8125rem;color:var(--color-text-muted)">
                      ${(s.items || []).map((it) => `${esc(it.name)} ${it.size ? `(${esc(it.size)})` : ''} × <b>${it.qty || 1}</b>`).join(' · ')}
                    </div>
                  </div>
                  ${isPending ? `<div class="admin__sale-actions"><button class="button button--primary admin__sm" data-a="order-confirm" data-id="${esc(s.id)}" style="background:var(--gold);color:#000;font-weight:var(--fw-bold);white-space:nowrap">Confirmar compra</button></div>` : ''}
                </article>
              `;
            }).join('')}
          </div>
        ` : '<p style="color:var(--color-text-muted);font-size:0.85rem">Aún no hay compras registradas. Al enviar un pedido por WhatsApp se registrará aquí para tu confirmación.</p>'}
      </div>

      ${defaultPin ? '<div class="admin__card admin__warn"><h3>Cambia el PIN</h3><p>Sigues usando el PIN de fábrica. Cámbialo en Ajustes antes de entregar el sitio.</p><button class="button button--primary admin__sm" data-a="go" data-k="s">Ir a Ajustes</button></div>' : ''}

      <div class="admin__card"><h3>Acciones rápidas</h3><div class="admin__row-actions">
        <button class="button button--primary" data-a="new">Nueva joya</button>
        <button class="button button--ghost" data-a="go" data-k="st">Actualizar Stock</button>
        <button class="button button--ghost" data-a="go" data-k="fin">Ver Finanzas</button>
        <button class="button button--ghost" data-a="go" data-k="c">Categorías</button>
        <button class="button button--ghost" data-a="load-seed">Cargar datos de prueba</button>
        <button class="button button--ghost" data-a="hide">Ver tienda</button></div></div>`;
  };

  const stockView = () => {
    const f = F.getFinances();
    let prods = db.prods;
    if (stockFilter === 'low') prods = prods.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 2);
    else if (stockFilter === 'out') prods = prods.filter((p) => (Number(p.stock) || 0) <= 0);

    return `
      <div class="admin__stats">
        <div class="admin__stat"><span>Unidades Totales</span><b>${f.totalPieces}</b></div>
        <div class="admin__stat"><span>En Stock</span><b>${db.prods.filter((p) => (Number(p.stock) || 0) > 0).length}</b></div>
        <div class="admin__stat" style="border-color:${f.lowStockCount ? 'var(--gold-2)' : 'var(--color-border)'}">
          <span style="color:var(--gold-1)">Stock Bajo (≤2)</span><b>${f.lowStockCount}</b>
        </div>
        <div class="admin__stat" style="border-color:${f.outOfStockCount ? '#8a3a3a' : 'var(--color-border)'}">
          <span style="color:#ff9a9a">Agotadas</span><b>${f.outOfStockCount}</b>
        </div>
      </div>

      <div class="admin__card">
        <div class="admin__bar">
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
            <button class="button button--ghost admin__sm ${stockFilter === 'all' ? 'admin__btn-active' : ''}" data-a="st-filter" data-val="all">Todas (${db.prods.length})</button>
            <button class="button button--ghost admin__sm ${stockFilter === 'low' ? 'admin__btn-active' : ''}" data-a="st-filter" data-val="low">Stock Bajo (${f.lowStockCount})</button>
            <button class="button button--ghost admin__sm ${stockFilter === 'out' ? 'admin__btn-active' : ''}" data-a="st-filter" data-val="out">Agotadas (${f.outOfStockCount})</button>
          </div>
          <button class="button button--ghost admin__sm" data-a="st-restock">+3 a todas las agotadas</button>
        </div>

        <div class="admin__list">
          ${prods.map((p) => {
            const st = Number(p.stock) || 0;
            const badgeClass = st <= 0 ? 'admin__badge--danger' : st <= 2 ? 'admin__badge--warn' : 'admin__badge--ok';
            const badgeText = st <= 0 ? 'Agotado' : st <= 2 ? `Bajo (${st})` : `En Stock (${st})`;
            return `
              <article class="admin__item admin__item--stock" data-pid="${esc(p.id)}">
                <div class="admin__thumb" ${p.img ? `data-zoom-img="${esc(p.img)}" data-zoom-title="${esc(p.name)}" data-zoom-desc="${esc(p.desc || '')}" data-zoom-price="${Number(p.price) || 0}" style="cursor:pointer" title="Toca para ampliar y detallar foto"` : ''}>${p.img ? `<img src="${esc(p.img)}" alt="">` : svg('p')}</div>
                <div class="admin__meta">
                  <b>${esc(p.name)}</b>
                  <small>${esc(F.catName(p.cat))} · ${money(p.price)} · <span class="admin__badge ${badgeClass}">${badgeText}</span></small>
                </div>
                <div class="admin__stock-ctrl">
                  <button type="button" class="admin__stock-btn" data-a="st-dec" data-id="${esc(p.id)}" aria-label="Restar 1">−</button>
                  <input type="number" min="0" class="admin__stock-input" data-st-input="${esc(p.id)}" value="${st}">
                  <button type="button" class="admin__stock-btn" data-a="st-inc" data-id="${esc(p.id)}" aria-label="Sumar 1">+</button>
                </div>
              </article>
            `;
          }).join('') || '<p class="admin__empty">No hay joyas en esta vista de stock.</p>'}
        </div>
      </div>`;
  };

  const finView = () => {
    const f = F.getFinances();
    const sales = db.sales || [];
    
    // Métricas por método de pago (Efectivo vs Transferencia)
    const transferOrders = sales.filter((s) => (s.client?.payment || '').toLowerCase().includes('transf'));
    const cashOrders = sales.filter((s) => (s.client?.payment || '').toLowerCase().includes('efect') || (s.client?.payment || '').toLowerCase().includes('contra'));
    const transferCount = transferOrders.length;
    const cashCount = cashOrders.length;
    const transferTotal = transferOrders.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const cashTotal = cashOrders.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalPaymentsCount = transferCount + cashCount;
    const morePopular = transferCount > cashCount ? 'Transferencia' : cashCount > transferCount ? 'Efectivo' : (transferCount > 0 ? 'Empate' : 'Sin datos');

    const catBreakdown = db.cats.map((c) => {
      const prodsInCat = db.prods.filter((p) => p.cat == c.id);
      const pieces = prodsInCat.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
      const val = prodsInCat.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);
      return { name: c.name, pieces, val };
    });

    return `
      <div class="admin__stats">
        <div class="admin__stat"><span>Ventas Totales</span><b>${money(f.totalSales)}</b></div>
        <div class="admin__stat"><span>Pedidos Totales</span><b>${f.totalOrders}</b></div>
        <div class="admin__stat"><span>Ticket Promedio</span><b>${money(f.averageTicket)}</b></div>
        <div class="admin__stat"><span>Valor Inventario</span><b>${money(f.inventoryValue)}</b></div>
      </div>

      <!-- Comparativa detallada por Método de Pago (Transferencia vs Efectivo) -->
      <div class="admin__card">
        <div class="admin__bar">
          <div>
            <h3 style="margin:0 0 2px">Pedidos por Método de Pago</h3>
            <small style="color:var(--color-text-muted)">Comparativa exclusiva entre Transferencia y Efectivo</small>
          </div>
          ${morePopular !== 'Sin datos' ? `<span class="admin__badge admin__badge--warn">Canal con más pedidos: <b>${morePopular}</b></span>` : ''}
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:var(--space-4);margin-top:var(--space-4)">
          <!-- Transferencia -->
          <div style="background:var(--color-bg);padding:var(--space-4);border:1px solid ${transferCount >= cashCount && transferCount > 0 ? 'var(--gold-2)' : 'var(--color-border)'};border-radius:var(--radius)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
              <b style="color:var(--gold-1);letter-spacing:0.12em;text-transform:uppercase;font-size:0.85rem">Transferencia</b>
              ${transferCount > cashCount ? '<span class="admin__badge admin__badge--ok">Más Pedidos</span>' : ''}
            </div>
            <div style="font-size:1.9rem;font-weight:var(--fw-medium);color:var(--color-text)">${transferCount} <small style="font-size:0.85rem;color:var(--color-text-muted);font-weight:normal">pedidos</small></div>
            <div style="font-size:1.15rem;color:var(--gold-1);margin-top:var(--space-1)">${money(transferTotal)}</div>
            <div style="margin-top:var(--space-3);background:rgba(255,255,255,0.08);height:6px;border-radius:3px;overflow:hidden">
              <div style="background:var(--gold);height:100%;width:${totalPaymentsCount ? Math.round((transferCount / totalPaymentsCount) * 100) : 0}%"></div>
            </div>
            <small style="display:block;margin-top:6px;color:var(--color-text-muted);font-size:0.75rem">${totalPaymentsCount ? Math.round((transferCount / totalPaymentsCount) * 100) : 0}% del volumen de compras</small>
          </div>

          <!-- Efectivo -->
          <div style="background:var(--color-bg);padding:var(--space-4);border:1px solid ${cashCount > transferCount ? 'var(--gold-2)' : 'var(--color-border)'};border-radius:var(--radius)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
              <b style="color:var(--gold-1);letter-spacing:0.12em;text-transform:uppercase;font-size:0.85rem">Efectivo</b>
              ${cashCount > transferCount ? '<span class="admin__badge admin__badge--ok">Más Pedidos</span>' : ''}
            </div>
            <div style="font-size:1.9rem;font-weight:var(--fw-medium);color:var(--color-text)">${cashCount} <small style="font-size:0.85rem;color:var(--color-text-muted);font-weight:normal">pedidos</small></div>
            <div style="font-size:1.15rem;color:var(--gold-1);margin-top:var(--space-1)">${money(cashTotal)}</div>
            <div style="margin-top:var(--space-3);background:rgba(255,255,255,0.08);height:6px;border-radius:3px;overflow:hidden">
              <div style="background:#4ade80;height:100%;width:${totalPaymentsCount ? Math.round((cashCount / totalPaymentsCount) * 100) : 0}%"></div>
            </div>
            <small style="display:block;margin-top:6px;color:var(--color-text-muted);font-size:0.75rem">${totalPaymentsCount ? Math.round((cashCount / totalPaymentsCount) * 100) : 0}% del volumen de compras</small>
          </div>
        </div>
      </div>

      <div class="admin__card">
        <div class="admin__bar">
          <h3>Valorización de Inventario por Categoría</h3>
          <small style="color:var(--color-text-muted)">Unidades disponibles en vitrina</small>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:var(--space-3)">
          ${catBreakdown.map((cb) => `
            <div style="background:var(--color-bg);padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius)">
              <b style="display:block;font-size:0.85rem;color:var(--gold-1);text-transform:uppercase;letter-spacing:0.1em">${esc(cb.name)}</b>
              <span style="font-size:1.15rem;font-weight:var(--fw-medium);display:block;margin:var(--space-1) 0">${money(cb.val)}</span>
              <small style="color:var(--color-text-muted)">${cb.pieces} piezas en stock</small>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="admin__card">
        <div class="admin__bar">
          <h3>Historial de Ventas y Pedidos (${sales.length})</h3>
          <div class="admin__acts" style="display:flex;gap:var(--space-2);flex-wrap:wrap">
            <button class="button button--primary admin__sm" data-a="fin-exp-csv">Descargar Informe Detallado (Excel)</button>
            <button class="button button--ghost admin__sm" data-a="fin-print">Imprimir / Guardar PDF</button>
            <button class="button button--ghost admin__sm" data-a="load-seed">Cargar Datos de Prueba</button>
            ${sales.length ? `<button class="button button--ghost admin__sm admin__danger" data-a="fin-clear">Vaciar Historial</button>` : ''}
          </div>
        </div>

        ${sales.length ? `
          <div class="admin__list">
            ${sales.map((s) => {
              const cl = s.client || {};
              const dateStr = s.date ? new Date(s.date).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'Fecha no registrada';
              const cleanPhone = (cl.phone || '').replace(/\D/g, '');
              const isCash = (cl.payment || '').toLowerCase().includes('efect') || (cl.payment || '').toLowerCase().includes('contra');
              const paymentLabel = isCash ? 'Efectivo' : 'Transferencia';
              const isPending = s.status === 'pending';
              const isCancelled = s.status === 'cancelled';
              const statusBadge = isPending
                ? '<span class="admin__badge admin__badge--warn">POR CONFIRMAR (STOCK NO DESCONTADO)</span>'
                : isCancelled
                ? '<span class="admin__badge admin__badge--danger">CANCELADO</span>'
                : '<span class="admin__badge admin__badge--ok">COMPRA CONFIRMADA</span>';

              return `
                <article class="admin__card" style="margin-bottom:var(--space-3);background:var(--color-bg);border:1px solid ${isPending ? 'var(--gold-2)' : 'var(--color-border)'}">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:var(--space-2);border-bottom:1px solid var(--color-border);padding-bottom:var(--space-2);margin-bottom:var(--space-3)">
                    <div>
                      <b style="font-size:1.15rem;color:var(--gold-1);letter-spacing:0.05em">${money(s.total)}</b>
                      <span style="display:block;font-size:0.75rem;color:var(--color-text-muted);margin-top:2px">${esc(dateStr)} · ID: #${esc((s.id || '').slice(0, 6).toUpperCase())}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap">
                      ${statusBadge}
                      <span class="admin__badge ${isCash ? 'admin__badge--ok' : 'admin__badge--warn'}">Pago: ${paymentLabel}</span>
                      ${(cl.advisorLabel || cl.advisorLine) ? `<span class="admin__badge" style="background:rgba(212,175,55,0.15);color:var(--gold-1);border:1px solid var(--gold-2)">Atendido: ${esc(cl.advisorLabel || `Línea ${cl.advisorLine}`)}</span>` : ''}
                      <button class="button button--ghost admin__sm admin__danger" data-a="fin-del" data-id="${esc(s.id)}" title="Eliminar este registro">Eliminar</button>
                    </div>
                  </div>

                  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-3);margin-bottom:var(--space-3);font-size:0.8125rem">
                    <div>
                      <small style="color:var(--color-text-muted);display:block;text-transform:uppercase;letter-spacing:0.1em;font-size:0.65rem">Cliente</small>
                      <b>${esc(cl.name || 'Cliente WhatsApp')}</b>
                      ${cl.phone ? `<div style="margin-top:4px"><a href="https://wa.me/${cleanPhone}" target="_blank" rel="noopener" style="color:var(--gold-1);text-decoration:underline">${esc(cl.phone)}</a></div>` : ''}
                    </div>
                    <div>
                      <small style="color:var(--color-text-muted);display:block;text-transform:uppercase;letter-spacing:0.1em;font-size:0.65rem">Destino y Pago</small>
                      <div>${esc(cl.address || 'Entrega a convenir')}</div>
                      <small style="color:var(--gold-1)">Método: <b>${paymentLabel}</b></small>
                    </div>
                  </div>

                  <div style="background:var(--color-surface);padding:var(--space-2) var(--space-3);border-radius:var(--radius);font-size:0.8125rem">
                    <small style="color:var(--color-text-muted);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.1em;font-size:0.65rem">Joyas solicitadas</small>
                    <ul style="margin:0;padding-left:18px;color:var(--color-text)">
                      ${(s.items || []).map((it) => `
                        <li>
                          <b>${esc(it.name)}</b> ${it.size ? `(Talla: ${esc(it.size)})` : ''} 
                          × <b>${it.qty || 1}</b> — <span style="color:var(--gold-1)">${money(it.subtotal || it.price * (it.qty || 1))}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>

                  ${isPending ? `
                    <div style="display:flex;gap:var(--space-3);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px dashed var(--color-border);align-items:center;flex-wrap:wrap">
                      <button class="button button--primary admin__sm" data-a="order-confirm" data-id="${esc(s.id)}" style="background:var(--gold);color:#000;font-weight:var(--fw-bold)">Confirmar compra y descontar stock</button>
                      <button class="button button--ghost admin__sm admin__danger" data-a="order-cancel" data-id="${esc(s.id)}">Rechazar pedido</button>
                      <small style="color:var(--color-text-muted);font-size:0.75rem">El stock de la tienda permanecerá intacto hasta que toques "Confirmar compra".</small>
                    </div>
                  ` : ''}
                </article>`;
            }).join('')}
          </div>
        ` : `
          <div class="admin__empty">
            <p>Aún no hay compras registradas en el sistema.</p>
            <button class="button button--primary admin__sm" data-a="load-seed" style="margin-top:var(--space-3)">Cargar Datos de Prueba</button>
          </div>
        `}
      </div>`;
  };
  const list = () => `<div class="admin__bar"><p>${db.prods.length} joyas registradas</p><div style="display:flex;gap:var(--space-2)"><button class="button button--ghost admin__sm" data-a="load-seed">Cargar datos de prueba</button><button class="button button--primary admin__sm" data-a="new">Nueva joya</button></div></div>
    <div class="admin__list">${db.prods.map((p) => `<article class="admin__item">
      <div class="admin__thumb" ${p.img ? `data-zoom-img="${esc(p.img)}" data-zoom-title="${esc(p.name)}" data-zoom-desc="${esc(p.desc || '')}" data-zoom-price="${Number(p.price) || 0}" style="cursor:pointer" title="Toca para ampliar y detallar foto"` : ''}>${p.img ? `<img src="${esc(p.img)}" alt="">` : svg('p')}</div>
      <div class="admin__meta"><b>${esc(p.name)}</b><small>${esc(F.catName(p.cat))} · ${money(p.price)} · Stock: <b>${p.stock ?? 0}</b>${p.on ? '' : ' · Oculta'}</small></div>
      <div class="admin__acts"><button class="button button--ghost admin__sm" data-a="ep" data-id="${esc(p.id)}">Editar</button><button class="button button--ghost admin__sm admin__danger" data-a="dp" data-id="${esc(p.id)}">Eliminar</button></div>
    </article>`).join('') || '<div class="admin__card" style="text-align:center;padding:var(--space-6)"><p class="admin__empty" style="margin-bottom:var(--space-3)">Aún no hay joyas registradas en la tienda.</p><button class="button button--primary" data-a="load-seed">Cargar catálogo de muestra con fotos reales</button></div>'}</div>`;
  const form = () => {
    const e = db.prods.find((p) => p.id == edit) || {}, prev = pend || e.img;
    return `<form class="admin__form" data-prod autocomplete="off">
      <div class="admin__field"><label for="f-n">Nombre</label><input id="f-n" maxlength="80" required value="${esc(e.name)}"></div>
      <div class="admin__field"><label for="f-p">Precio (COP)</label><input id="f-p" type="number" min="0" step="1000" required value="${esc(e.price ?? '')}"></div>
      <div class="admin__field"><label for="f-c">Categoría</label><select id="f-c">${db.cats.map((c) => `<option value="${esc(c.id)}" ${e.cat == c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="admin__field"><label for="f-st">Stock disponible (unidades)</label><input id="f-st" type="number" min="0" required value="${esc(e.stock ?? 3)}"></div>
      <div class="admin__field"><label for="f-t">Etiqueta (opcional)</label><input id="f-t" maxlength="24" placeholder="Nuevo, Más vendido…" value="${esc(e.tag)}"></div>
      <div class="admin__field"><label for="f-s">Tallas o medidas, separadas por coma</label><input id="f-s" placeholder="Ej: 6,7,8,9 · vacío si es talla única" value="${esc(e.sizes)}"></div>
      <div class="admin__field admin__field--full"><label for="f-d">Descripción</label><textarea id="f-d" rows="3" maxlength="300">${esc(e.desc)}</textarea></div>
      <div class="admin__field admin__field--full"><label for="f-f">Foto</label><div class="admin__photo"><div class="admin__thumb" id="f-prev">${prev ? `<img src="${esc(prev)}" alt="">` : svg('p')}</div><input id="f-f" type="file" accept="image/*"></div></div>
      <label class="admin__check admin__field--full"><input id="f-v" type="checkbox" ${e.on !== 0 ? 'checked' : ''}> Visible en la tienda</label>
      <div class="admin__row-actions admin__field--full"><button class="button button--primary" type="submit">${edit === 'new' ? 'Registrar joya' : 'Guardar cambios'}</button><button class="button button--ghost" type="button" data-a="back">Cancelar</button></div>
    </form>`;
  };
  const cats = () => `<form class="admin__card admin__inline" data-cat autocomplete="off"><div class="admin__field"><label for="c-n">Nueva categoría</label><input id="c-n" maxlength="30" placeholder="Ej: Dijes, Tobilleras" required></div><button class="button button--primary" type="submit">Crear</button></form>
    <div class="admin__list">${db.cats.map((c) => `<article class="admin__item admin__item--cat"><div class="admin__meta"><b>${esc(c.name)}</b><small>${db.prods.filter((p) => p.cat == c.id).length} joyas</small></div>
      <div class="admin__acts"><button class="button button--ghost admin__sm" data-a="rc" data-id="${esc(c.id)}">Renombrar</button><button class="button button--ghost admin__sm admin__danger" data-a="dc" data-id="${esc(c.id)}">Eliminar</button></div></article>`).join('')}</div>`;
  const settings = () => `<form class="admin__form" data-set autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
    <input type="text" style="display:none" aria-hidden="true" tabindex="-1">
    <input type="password" style="display:none" aria-hidden="true" tabindex="-1">

    <div class="admin__card admin__field--full" style="border:1px solid var(--gold-2);background:rgba(212,175,55,0.06);padding:var(--space-4);border-radius:var(--radius)">
      <h3 style="color:var(--gold-1);margin:0 0 6px;font-size:0.95rem;letter-spacing:0.12em;text-transform:uppercase">Configuración de los 2 Botones de WhatsApp</h3>
      <p style="margin:0;font-size:0.85rem;color:var(--color-text-muted);line-height:1.5">
        Configura los números de tus dos líneas de atención. Estos dos botones aparecerán directamente flotando en pantalla, en la sección de contacto y en el carrito de compras.
      </p>
    </div>

    <div class="admin__field">
      <label for="s-w">Botón 1: WhatsApp Línea 1 (Con indicativo sin signos, ej: 573116240316)</label>
      <input id="s-w" name="fynx_wa_val" type="tel" inputmode="numeric" required value="${esc(db.cfg.wa || '')}">
    </div>
    <div class="admin__field">
      <label for="s-wl">Texto del Botón 1</label>
      <input id="s-wl" maxlength="40" placeholder="Ej: Línea 1 · Asesoría" value="${esc(db.cfg.waLabel || 'Línea 1 · Asesoría')}">
    </div>

    <div class="admin__field">
      <label for="s-w2">Botón 2: WhatsApp Línea 2 (Con indicativo sin signos, ej: 573001234567)</label>
      <input id="s-w2" name="fynx_wa2_val" type="tel" inputmode="numeric" placeholder="Ej: 573001234567" value="${esc(db.cfg.wa2 || '')}">
    </div>
    <div class="admin__field">
      <label for="s-w2l">Texto del Botón 2</label>
      <input id="s-w2l" maxlength="40" placeholder="Ej: Línea 2 · Pedidos" value="${esc(db.cfg.wa2Label || 'Línea 2 · Pedidos')}">
    </div>

    <div class="admin__field"><label for="s-e">Correo para pedidos y mensajes (opcional)</label><input id="s-e" name="fynx_em_val" type="text" inputmode="email" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="${esc(db.cfg.email)}"></div>
    <div class="admin__field"><label for="s-p">Nuevo PIN (4 a 8 números)</label><input id="s-p" name="fynx_np_val" type="text" class="admin__pin-field" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Vacío = no cambiar" value="" readonly onfocus="this.removeAttribute('readonly')"></div>
    <div class="admin__row-actions admin__field--full"><button class="button button--primary" type="submit">Guardar ajustes</button><button class="button button--ghost" type="button" data-a="ex">Descargar respaldo</button><label class="button button--ghost admin__file">Restaurar respaldo<input type="file" accept="application/json" data-im hidden></label></div>
  </form>`;
  const view = () => (sec === 'home' ? home() : sec === 'p' ? (edit ? form() : list()) : sec === 'st' ? stockView() : sec === 'fin' ? finView() : sec === 'c' ? cats() : settings());

  function draw() {
    if (!authed) {
      root.innerHTML = `<div class="admin__login"><form class="admin__card admin__loginbox" data-login autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"><img src="icon-192.png" alt="" width="64" height="64"><h2>Panel de administración</h2><p>Ingresa tu PIN para continuar</p><input id="adm-pin" name="fynx_adm_pin" type="text" class="admin__pin-field" inputmode="numeric" pattern="[0-9]*" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="PIN" placeholder="••••" readonly onfocus="this.removeAttribute('readonly')"><p class="admin__err" data-err role="alert"></p><button class="button button--primary" type="submit">Entrar</button><button class="button button--ghost" type="button" data-a="hide">Volver a la tienda</button></form></div>`;
      root.append(toastEl);
      setTimeout(() => { const i = $('#adm-pin', root); if (i) { i.removeAttribute('readonly'); i.focus(); } }, 30);
      return;
    }
    const nav = ['home', 'p', 'st', 'fin', 'c', 's'].map((k) => `<button class="admin__link" type="button" data-a="go" data-k="${k}" ${sec === k ? 'aria-current="page"' : ''}>${svg(k)}${TITLES[k]}</button>`).join('');
    root.innerHTML = `<aside class="admin__side" aria-label="Navegación del panel"><div class="admin__brand"><img src="icon-192.png" alt="" width="40" height="40"><div><b>Fynx Dorado</b><small>Panel</small></div></div><nav class="admin__nav">${nav}</nav><button class="admin__link admin__link--out" type="button" data-a="logout">${svg('out')}Cerrar sesión</button></aside>
      <div class="admin__scrim" data-a="menu"></div>
      <div class="admin__main"><header class="admin__top"><button class="admin__burger" type="button" data-a="menu" aria-label="Abrir menú"><span class="nav-toggle__bar" aria-hidden="true"></span></button><h2>${TITLES[sec]}</h2><button class="button button--ghost admin__sm" data-a="hide" style="margin-left:auto">Ver tienda</button></header><div class="admin__content">${view()}</div></div>`;
    root.append(toastEl);
    const pinInp = $('#s-p', root);
    if (pinInp) pinInp.value = '';
  }

  /* ---- Acciones ---- */
  function compress(file) {
    return new Promise((res) => {
      const i = new Image(), u = URL.createObjectURL(file);
      i.onload = () => {
        const k = Math.min(1, 800 / Math.max(i.width, i.height)), c = document.createElement('canvas');
        c.width = i.width * k; c.height = i.height * k;
        c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', 0.82));
      };
      i.onerror = () => { URL.revokeObjectURL(u); res(''); };
      i.src = u;
    });
  }
  function saveProd() {
    const name = $('#f-n', root).value.trim(), cat = $('#f-c', root).value;
    if (!name || !cat) return toast('Falta nombre o categoría');
    const old = db.prods.find((p) => p.id == edit) || {};
    const o = {
      id: old.id || F.uid(), name, cat, price: Math.max(0, Math.round(+$('#f-p', root).value || 0)),
      stock: Math.max(0, parseInt($('#f-st', root).value, 10) || 0),
      tag: $('#f-t', root).value.trim(), desc: $('#f-d', root).value.trim(),
      sizes: [...new Set($('#f-s', root).value.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 14).join(','),
      img: pend || old.img || '', on: $('#f-v', root).checked ? 1 : 0
    };
    db.prods = old.id ? db.prods.map((p) => (p.id == o.id ? o : p)) : [o, ...db.prods];
    edit = null; pend = null; commit('Joya guardada');
  }
  async function importBackup(file) {
    try {
      const d = JSON.parse(await file.text());
      const ok = d && Array.isArray(d.cats) && Array.isArray(d.prods) && d.cats.every((c) => c && c.id && typeof c.name === 'string') && d.prods.every((p) => p && p.id && typeof p.name === 'string' && p.cat !== undefined);
      if (!ok) return toast('Respaldo inválido');
      if (!confirm('Esto reemplazará las joyas y categorías actuales. ¿Continuar?')) return;
      db.cats = d.cats.map((c) => ({ id: String(c.id), name: String(c.name).slice(0, 30) }));
      db.prods = d.prods.map((p) => ({ id: String(p.id), name: String(p.name).slice(0, 80), price: Math.max(0, +p.price || 0), cat: String(p.cat), tag: String(p.tag || '').slice(0, 24), sizes: String(p.sizes || '').slice(0, 120), desc: String(p.desc || '').slice(0, 300), img: typeof p.img === 'string' && /^(data:image\/|https:)/.test(p.img) ? p.img : '', on: p.on === 0 ? 0 : 1 }));
      commit('Respaldo restaurado');
    } catch (e) { toast('No se pudo leer el archivo'); }
  }

  function exportDetailedReport() {
    const fin = F.getFinances();
    const sales = db.sales || [];
    const prods = db.prods || [];
    const cats = db.cats || [];
    const fmt = (n) => String(Math.round(Number(n) || 0));

    // Archivo CSV con UTF-8 BOM (\uFEFF) y delimitador ; para apertura directa y limpia en Microsoft Excel
    let csv = '\uFEFF';
    csv += 'JOYERÍA FYNX DORADO — INFORME DETALLADO DE FINANZAS E INVENTARIO\r\n';
    csv += `Fecha y Hora de Emisión;${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}\r\n`;
    csv += `WhatsApp Oficial;+${String(db.cfg.wa || '').replace(/\D/g, '')}\r\n\r\n`;

    csv += '=== RESUMEN EJECUTIVO FINANCIERO ===\r\n';
    csv += 'Concepto;Valor / Monto;Unidad\r\n';
    csv += `Ventas Confirmadas Totales;${fmt(fin.totalSales)};COP\r\n`;
    csv += `Pedidos Concretados;${fin.totalOrders};Pedidos\r\n`;
    csv += `Ticket Promedio de Venta;${fmt(fin.averageTicket)};COP\r\n`;
    csv += `Pedidos Pendientes por Confirmar;${fin.pendingCount};Pedidos\r\n`;
    csv += `Valor Pendiente por Confirmar;${fmt(fin.pendingTotal)};COP\r\n`;
    csv += `Valorización Total de Inventario en Bodega;${fmt(fin.inventoryValue)};COP\r\n`;
    csv += `Total Unidades Físicas en Stock;${fin.totalPieces};Piezas\r\n`;
    csv += `Joyas con Stock Bajo (<= 2 piezas);${fin.lowStockCount};Referencias\r\n`;
    csv += `Joyas Agotadas (0 piezas);${fin.outOfStockCount};Referencias\r\n\r\n`;

    const transferOrders = sales.filter((s) => (s.client?.payment || '').toLowerCase().includes('transf'));
    const cashOrders = sales.filter((s) => (s.client?.payment || '').toLowerCase().includes('efect') || (s.client?.payment || '').toLowerCase().includes('contra'));
    const transferTotal = transferOrders.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const cashTotal = cashOrders.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const morePopular = transferOrders.length > cashOrders.length ? 'Transferencia' : cashOrders.length > transferOrders.length ? 'Efectivo' : (transferOrders.length > 0 ? 'Empate' : 'Sin datos');

    csv += '=== BALANCE POR MÉTODO DE PAGO ===\r\n';
    csv += 'Método de Pago;Nro. Pedidos;Total Recaudado (COP);Canal Mayoritario\r\n';
    csv += `Transferencia Bancaria;${transferOrders.length};${fmt(transferTotal)};${morePopular === 'Transferencia' ? 'SÍ (Mayor volumen)' : 'NO'}\r\n`;
    csv += `Efectivo / Contraentrega;${cashOrders.length};${fmt(cashTotal)};${morePopular === 'Efectivo' ? 'SÍ (Mayor volumen)' : 'NO'}\r\n\r\n`;

    csv += '=== HISTORIAL DETALLADO DE VENTAS Y PEDIDOS ===\r\n';
    csv += 'Fecha;Hora;ID Pedido;Estado;Método Pago;Cliente;Teléfono;Dirección Entrega;Joyas Solicitadas;Total Pagado (COP)\r\n';
    if (!sales.length) {
      csv += 'Sin pedidos registrados;;;;;;;;;\r\n';
    } else {
      sales.forEach((s) => {
        const d = s.date ? new Date(s.date) : new Date();
        const fFec = d.toLocaleDateString('es-CO');
        const fHor = d.toLocaleTimeString('es-CO');
        const est = s.status === 'pending' ? 'Por Confirmar' : s.status === 'cancelled' ? 'Cancelado' : 'Confirmado';
        const clName = `"${String(s.client?.name || 'Cliente WhatsApp').replace(/"/g, '""')}"`;
        const clTel = `"${String(s.client?.phone || '').replace(/"/g, '""')}"`;
        const clDir = `"${String(s.client?.address || 'Entrega convenida').replace(/"/g, '""')}"`;
        const items = `"${(s.items || []).map((it) => `${it.name}${it.size ? ` (Talla: ${it.size})` : ''} x${it.qty || 1} [${fmt(it.subtotal || it.price * (it.qty || 1))} COP]`).join(' | ').replace(/"/g, '""')}"`;
        csv += `${fFec};${fHor};${s.id || ''};${est};${s.client?.payment || 'Transferencia'};${clName};${clTel};${clDir};${items};${fmt(s.total)}\r\n`;
      });
    }
    csv += '\r\n';

    csv += '=== INVENTARIO DETALLADO DE JOYAS ===\r\n';
    csv += 'Categoría;Nombre de la Joya;Stock Físico;Estado Stock;Precio Unitario (COP);Valor Total en Bodega (COP);Tallas;En Tienda\r\n';
    prods.forEach((p) => {
      const cName = cats.find((c) => c.id == p.cat)?.name || 'General';
      const st = Number(p.stock) || 0;
      const estSt = st <= 0 ? 'Agotado' : st <= 2 ? 'Stock Bajo' : 'En Stock';
      const val = st * (Number(p.price) || 0);
      const tallas = `"${String(p.sizes || 'Única').replace(/"/g, '""')}"`;
      csv += `"${cName}";"${String(p.name).replace(/"/g, '""')}";${st};${estSt};${fmt(p.price)};${fmt(val)};${tallas};${p.on ? 'Visible' : 'Oculto'}\r\n`;
    });

    const b = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fynx_Dorado_Informe_Detallado_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Informe detallado en Excel (.csv) descargado');
  }

  function printExecutiveReport() {
    const fin = F.getFinances();
    const sales = db.sales || [];
    const prods = db.prods || [];
    const w = window.open('', '_blank');
    if (!w) return toast('Ventana emergente bloqueada por el navegador');

    w.document.write(`<!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Informe Oficial · Joyería Fynx Dorado</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #111; background: #fff; line-height: 1.4; }
          .header { border-bottom: 2px solid #d4af37; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: bold; color: #111; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
          .sub { color: #666; font-size: 13px; margin-top: 4px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { border: 1px solid #ddd; padding: 12px 14px; border-radius: 4px; background: #fafafa; }
          .card span { font-size: 11px; text-transform: uppercase; color: #777; letter-spacing: 1px; display: block; }
          .card b { font-size: 19px; color: #a37d1e; display: block; margin-top: 4px; }
          h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #222; margin: 24px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
          th { background: #f2f2f2; text-align: left; padding: 7px 9px; border: 1px solid #ddd; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
          td { padding: 7px 9px; border: 1px solid #ddd; vertical-align: top; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .badge-ok { background: #e6f7ed; color: #1e7e34; }
          .badge-warn { background: #fff8e6; color: #b78103; }
          .badge-danger { background: #fde8e8; color: #c81e1e; }
          @media print { body { margin: 10mm; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Joyería Fynx Dorado</h1>
            <div class="sub">Informe Oficial Detallado de Finanzas e Inventario</div>
          </div>
          <div style="text-align:right">
            <div class="sub">Emisión: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</div>
            <button class="no-print" onclick="window.print()" style="margin-top:8px;padding:6px 14px;background:#d4af37;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold">Imprimir / Guardar PDF</button>
          </div>
        </div>

        <div class="grid">
          <div class="card"><span>Ventas Confirmadas</span><b>${money(fin.totalSales)}</b></div>
          <div class="card"><span>Pedidos Totales</span><b>${fin.totalOrders}</b></div>
          <div class="card"><span>Valor Inventario</span><b>${money(fin.inventoryValue)}</b></div>
          <div class="card"><span>Unidades Físicas</span><b>${fin.totalPieces}</b></div>
        </div>

        <h2>Historial de Pedidos y Ventas</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th><th>ID</th><th>Cliente</th><th>Teléfono</th><th>Pago</th><th>Estado</th><th>Joyas</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${sales.map((s) => `
              <tr>
                <td>${s.date ? new Date(s.date).toLocaleDateString('es-CO') : ''}</td>
                <td>#${(s.id || '').slice(0, 6).toUpperCase()}</td>
                <td><b>${esc(s.client?.name || 'Cliente')}</b></td>
                <td>${esc(s.client?.phone || '')}</td>
                <td>${esc(s.client?.payment || 'Transferencia')}</td>
                <td><span class="badge ${s.status === 'pending' ? 'badge-warn' : s.status === 'cancelled' ? 'badge-danger' : 'badge-ok'}">${s.status === 'pending' ? 'Por confirmar' : s.status === 'cancelled' ? 'Cancelado' : 'Confirmado'}</span></td>
                <td>${(s.items || []).map((it) => `${esc(it.name)} ${it.size ? `(${esc(it.size)})` : ''} x${it.qty || 1}`).join(', ')}</td>
                <td><b>${money(s.total)}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Inventario Físico de Joyas</h2>
        <table>
          <thead>
            <tr>
              <th>Categoría</th><th>Joya</th><th>Stock</th><th>Estado</th><th>Precio Unitario</th><th>Valor Total</th><th>Tallas</th>
            </tr>
          </thead>
          <tbody>
            ${prods.map((p) => `
              <tr>
                <td>${esc(F.catName(p.cat))}</td>
                <td><b>${esc(p.name)}</b></td>
                <td>${p.stock ?? 0}</td>
                <td><span class="badge ${p.stock <= 0 ? 'badge-danger' : p.stock <= 2 ? 'badge-warn' : 'badge-ok'}">${p.stock <= 0 ? 'Agotado' : p.stock <= 2 ? 'Stock Bajo' : 'En Stock'}</span></td>
                <td>${money(p.price)}</td>
                <td>${money((p.stock ?? 0) * (p.price ?? 0))}</td>
                <td>${esc(p.sizes || 'Única')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>`);
    w.document.close();
  }

  function onClick(e) {
    const t = e.target.closest('[data-a]');
    if (!t) return;
    const a = t.dataset.a, id = t.dataset.id;
    if (a === 'close' || a === 'hide') return hide();
    if (a === 'logout') return logout();
    if (a === 'menu') return root.classList.toggle('is-menu');
    if (a === 'go') { sec = t.dataset.k; edit = null; pend = null; root.classList.remove('is-menu'); return draw(); }
    if (a === 'new') { sec = 'p'; edit = 'new'; pend = null; return draw(); }
    if (a === 'ep') { edit = id; pend = null; return draw(); }
    if (a === 'back') { edit = null; pend = null; return draw(); }
    if (a === 'dp') { if (confirm('¿Eliminar esta joya?')) { db.prods = db.prods.filter((p) => p.id != id); commit('Joya eliminada'); } return; }
    if (a === 'rc') { const c = db.cats.find((x) => x.id == id), n = c && (prompt('Nuevo nombre', c.name) || '').trim().slice(0, 30); if (n) { c.name = n; commit('Categoría renombrada'); } return; }
    if (a === 'dc') { if (db.prods.some((p) => p.cat == id)) return toast('Mueve o elimina sus joyas primero'); db.cats = db.cats.filter((c) => c.id != id); return commit('Categoría eliminada'); }
    if (a === 'st-filter') { stockFilter = t.dataset.val; return draw(); }
    if (a === 'st-inc') {
      const p = db.prods.find((x) => x.id == id);
      if (p) { p.stock = (Number(p.stock) || 0) + 1; commit(`Stock de ${p.name}: ${p.stock} uds.`); }
      return;
    }
    if (a === 'st-dec') {
      const p = db.prods.find((x) => x.id == id);
      if (p) { p.stock = Math.max(0, (Number(p.stock) || 0) - 1); commit(`Stock de ${p.name}: ${p.stock} uds.`); }
      return;
    }
    if (a === 'st-restock') {
      let count = 0;
      db.prods.forEach((p) => { if ((Number(p.stock) || 0) <= 0) { p.stock = 3; count++; } });
      if (count > 0) commit(`${count} joyas agotadas reabastecidas a 3 uds.`);
      else toast('No hay joyas agotadas');
      return;
    }
    if (a === 'order-confirm') {
      const order = db.sales.find((s) => s.id == id);
      const res = F.confirmOrder(id);
      if (res.ok) {
        commit(res.msg);
        // Ofrecer confirmarle al cliente directamente por WhatsApp
        if (order && order.client && order.client.phone) {
          const clientTel = String(order.client.phone).replace(/\D/g, '');
          const cleanClientTel = clientTel.length === 10 ? ('57' + clientTel) : clientTel;
          if (confirm(`¿Deseas abrir WhatsApp para confirmarle la compra a ${order.client.name}?`)) {
            const msg = `Hola ${order.client.name}, te confirmamos que tu pedido #${(order.id || '').slice(0, 6).toUpperCase()} en Joyería Fynx Dorado ha sido aprobado con éxito. El stock de tus piezas ha sido apartado y estamos alistando tu envío.`;
            window.open(`https://api.whatsapp.com/send?phone=${cleanClientTel}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
          }
        }
      } else {
        toast(res.msg);
      }
      return;
    }
    if (a === 'order-cancel') {
      if (confirm('¿Rechazar o cancelar este pedido? El stock permanecerá sin cambios.')) {
        const res = F.cancelOrder(id);
        if (res.ok) commit(res.msg);
      }
      return;
    }
    if (a === 'enable-notifs') {
      // 1. Probar campanilla sonora dorada siempre
      if (F.playChime) F.playChime();

      // 2. Probar banner visual en pantalla
      if (F.showOrderBanner) {
        F.showOrderBanner({
          id: 'test',
          total: 480000,
          client: { name: 'Prueba de Notificación', payment: 'Transferencia' }
        });
      }

      // 3. Probar o solicitar Notificaciones del sistema
      if (typeof window !== 'undefined' && 'Notification' in window) {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            toast('¡Alertas y notificaciones activas!');
            if (navigator.serviceWorker && navigator.serviceWorker.ready) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification('Joyería Fynx Dorado', {
                  body: 'Notificaciones activas. Recibirás alertas inmediatas cuando un cliente envíe un pedido por WhatsApp.',
                  icon: 'icon-192.png',
                  badge: 'icon-192.png'
                });
              });
            }
          } else {
            toast('Permiso de notificaciones del sistema no concedido en este navegador');
          }
          draw();
        });
      } else {
        const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isIos) {
          toast('Alertas sonoras y en pantalla activas. En iPhone, agrega la app a la Pantalla de Inicio para notificaciones con pantalla bloqueada.');
        } else {
          toast('Alertas sonoras y en pantalla activas. Las notificaciones del sistema requieren conexión segura (HTTPS).');
        }
      }
      return;
    }
    if (a === 'load-seed') {
      if (confirm('¿Cargar datos de prueba completos en todas las categorías (Anillos, Collares, Pulseras, Aretes) y ventas de ejemplo?')) {
        F.loadSeedData();
        commit('Datos de prueba cargados con éxito');
      }
      return;
    }
    if (a === 'fin-del') {
      if (confirm('¿Eliminar este registro de venta?')) { F.deleteSale(id); commit('Venta eliminada'); }
      return;
    }
    if (a === 'fin-clear') {
      if (confirm('¿Seguro de vaciar todo el historial de ventas?')) { F.clearSales(); commit('Historial vaciado'); }
      return;
    }
    if (a === 'fin-exp' || a === 'fin-exp-csv') {
      exportDetailedReport();
      return;
    }
    if (a === 'fin-print') {
      printExecutiveReport();
      return;
    }
    if (a === 'ex') {
      const l = document.createElement('a');
      l.href = URL.createObjectURL(new Blob([JSON.stringify({ cfg: db.cfg, cats: db.cats, prods: db.prods }, null, 2)], { type: 'application/json' }));
      l.download = `fynx-respaldo-${new Date().toISOString().slice(0, 10)}.json`; l.click(); URL.revokeObjectURL(l.href);
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    const f = e.target;
    if (f.matches('[data-login]')) {
      const input = $('#adm-pin', root), err = await login(input.value);
      if (err) { $('[data-err]', root).textContent = err; input.value = ''; input.focus(); }
    } else if (f.matches('[data-prod]')) saveProd();
    else if (f.matches('[data-cat]')) {
      const n = $('#c-n', root).value.trim();
      if (n) { db.cats.push({ id: F.uid(), name: n.slice(0, 30) }); commit('Categoría creada'); }
    } else if (f.matches('[data-set]')) {
      const wa = $('#s-w', root).value.replace(/\D/g, '');
      const waLabel = $('#s-wl', root).value.trim();
      const wa2 = $('#s-w2', root).value.replace(/\D/g, '');
      const wa2Label = $('#s-w2l', root).value.trim();
      const em = $('#s-e', root).value.trim(), pin = $('#s-p', root).value.trim();
      if (wa.length < 8 || wa.length > 15) return toast('WhatsApp Línea 1 inválido');
      if (wa2 && (wa2.length < 8 || wa2.length > 15)) return toast('WhatsApp Línea 2 inválido');
      if (em && !F.validEmail(em)) return toast('Correo inválido');
      if (pin && !/^\d{4,8}$/.test(pin)) return toast('PIN: de 4 a 8 números');
      db.cfg.wa = wa;
      db.cfg.waLabel = waLabel || 'Línea 1 · Asesoría';
      db.cfg.wa2 = wa2;
      db.cfg.wa2Label = wa2Label || 'Línea 2 · Pedidos';
      db.cfg.email = em;
      if (pin) { db.cfg.pinHash = await H(pin); delete db.cfg.pin; defaultPin = false; }
      commit('Ajustes guardados');
      if (F.updateWaButtons) F.updateWaButtons();
    }
  }

  /* ---- Apertura / cierre / persistencia ---- */
  function build() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'admin'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Panel de administración');
    toastEl = document.createElement('div'); toastEl.className = 'admin__toast'; toastEl.setAttribute('role', 'status');
    document.body.append(root);
    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('change', async (e) => {
      const el = e.target;
      if (el.matches('[data-st-input]')) {
        const id = el.dataset.stInput, val = Math.max(0, parseInt(el.value, 10) || 0);
        const p = db.prods.find((x) => x.id == id);
        if (p) {
          p.stock = val;
          commit(`Stock de ${p.name}: ${val} uds.`);
        }
      } else if (el.id === 'f-f' && el.files[0]) {
        pend = await compress(el.files[0]);
        const p = $('#f-prev', root);
        if (p && pend) p.innerHTML = `<img src="${esc(pend)}" alt="">`;
      } else if (el.matches('[data-im]') && el.files[0]) importBackup(el.files[0]);
    });
    ['click', 'keydown', 'touchstart'].forEach((ev) => root.addEventListener(ev, bump, { passive: true }));
  }
  function open() {
    build();
    authed = localStorage.getItem(AUTH_KEY) === 'true'; // Mantiene la sesión abierta en PWA permanentemente
    sec = 'home'; edit = null; pend = null;
    root.classList.remove('is-menu'); root.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    draw();
  }
  function hide() {
    // Minimiza o vuelve a la tienda SIN cerrar la sesión del administrador
    if (root) root.hidden = true;
    document.documentElement.style.overflow = '';
  }
  function logout() {
    // Cierre voluntario de sesión: elimina el token de autenticación
    localStorage.removeItem(AUTH_KEY);
    authed = false;
    clearTimeout(idleT);
    if (root) root.hidden = true;
    document.documentElement.style.overflow = '';
    toast('Sesión de administrador cerrada');
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !root || root.hidden) return;
    if (root.classList.contains('is-menu')) root.classList.remove('is-menu');
    else if (!authed) hide();
  });

  // Clics sobre el pie de página (2026):
  // Si ya tiene la sesión abierta, 1 solo clic abre el panel de inmediato sin pedir PIN.
  // Si no está autenticado, 4 clics abren la caja de login.
  let n = 0, t0;
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-secret]')) {
      e.preventDefault();
      if (localStorage.getItem(AUTH_KEY) === 'true') {
        open();
        return;
      }
      clearTimeout(t0);
      n++;
      if (n >= 4) {
        n = 0;
        open();
      } else {
        t0 = setTimeout(() => { n = 0; }, 2500);
      }
    }
  });

  // Alternativa directa: #admin en la URL
  const hash = () => {
    if (window.location && window.location.hash === '#admin') {
      open();
    }
  };

  // Si el administrador ya había iniciado sesión y cerró la app / navegador,
  // al volver a abrir la aplicación entra DIRECTO al panel admin
  function checkAutoOpenAdmin() {
    if (localStorage.getItem(AUTH_KEY) === 'true') {
      open();
    }
  }

  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkAutoOpenAdmin);
    } else {
      checkAutoOpenAdmin();
    }
    window.addEventListener('hashchange', hash);
    hash();
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }
})();
