// Datos compartidos de la tienda y el panel (localStorage). Se carga primero.
(() => {
  const KEY = 'fynx_v4';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
  const seed = () => ({
    version: 4,
    cfg: {
      wa: '573116240316',
      waLabel: 'Línea 1 · Asesoría y Ventas',
      wa2: '',
      wa2Label: 'Línea 2 · Atención y Pedidos',
      waMode: 'balance', // 'balance' (50/50), 'select' (menú cliente), 'line1', 'line2'
      email: ''
    },
    cats: [
      { id: 'a', name: 'Anillos' },
      { id: 'b', name: 'Collares' },
      { id: 'c', name: 'Pulseras' },
      { id: 'd', name: 'Aretes' },
      { id: 'm', name: 'Mayorista' }
    ],
    prods: [
      // Anillos
      {
        id: 'a1',
        name: 'Anillo Fénix Dorado',
        price: 480000,
        stock: 4,
        cat: 'a',
        tag: 'Nuevo',
        sizes: '6,7,8,9,10,11,12',
        desc: 'Grabado de alas de fénix con acabado pulido brillante en oro 18K.',
        img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'a2',
        name: 'Solitario Corona Real',
        price: 620000,
        stock: 2,
        cat: 'a',
        tag: 'Exclusivo',
        sizes: '6,7,8,9',
        desc: 'Montura alta con engaste artesanal y destello supremo en oro 18K.',
        img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'a3',
        name: 'Anillo Sello Emperador',
        price: 540000,
        stock: 0,
        cat: 'a',
        tag: '',
        sizes: '9,10,11',
        desc: 'Sello macizo de línea clásica y presencia imponente en oro macizo.',
        img: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      // Collares
      {
        id: 'b1',
        name: 'Cadena Imperial Maciza',
        price: 890000,
        stock: 3,
        cat: 'b',
        tag: 'Más vendido',
        sizes: '45 cm,50 cm,55 cm,60 cm',
        desc: 'Eslabones macizos de presencia imponente, tejido reforzado.',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'b2',
        name: 'Gargantilla Luz Eterna',
        price: 730000,
        stock: 1,
        cat: 'b',
        tag: 'Última pieza',
        sizes: '40 cm,45 cm',
        desc: 'Diseño sutil con destellos de oro fino, elegancia atemporal.',
        img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'b3',
        name: 'Cadena Figaro Oro 18K',
        price: 980000,
        stock: 0,
        cat: 'b',
        tag: '',
        sizes: '50 cm,60 cm',
        desc: 'Tejido Figaro tradicional con broche de seguridad de alta orfebrería.',
        img: 'https://images.unsplash.com/photo-1611591475870-7a7187449b49?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      // Pulseras
      {
        id: 'c1',
        name: 'Pulsera Renacer',
        price: 390000,
        stock: 5,
        cat: 'c',
        tag: 'Destacado',
        sizes: '17 cm,18 cm,19 cm,20 cm',
        desc: 'Inspirada en el fuego y el renacimiento continuo en oro pulido.',
        img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'c2',
        name: 'Manilla Cubana Diamantada',
        price: 520000,
        stock: 2,
        cat: 'c',
        tag: '',
        sizes: '18 cm,20 cm',
        desc: 'Cortes en diamante para máxima refracción y brillo de autor.',
        img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'c3',
        name: 'Pulsera Eslabón Fénix',
        price: 460000,
        stock: 0,
        cat: 'c',
        tag: '',
        sizes: '19 cm,21 cm',
        desc: 'Diseño geométrico de eslabones entrelazados de porte exclusivo.',
        img: 'https://images.unsplash.com/photo-1611591475870-7a7187449b49?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      // Aretes
      {
        id: 'd1',
        name: 'Candongas Fuego Sagrado',
        price: 310000,
        stock: 6,
        cat: 'd',
        tag: 'Tendencia',
        sizes: '',
        desc: 'Aros medianos labrados a mano con cierre de clic extra seguro.',
        img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'd2',
        name: 'Aretes Destello de Llama',
        price: 260000,
        stock: 2,
        cat: 'd',
        tag: '',
        sizes: '',
        desc: 'Livianos y cómodos, acabado espejo para el día a día o de gala.',
        img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'd3',
        name: 'Topos Botón Imperial',
        price: 210000,
        stock: 0,
        cat: 'd',
        tag: '',
        sizes: '',
        desc: 'Clásicos topos discretos en oro macizo pulido, mariposa reforzada.',
        img: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      // Kits y Lotes Mayoristas
      {
        id: 'm1',
        name: 'Kit Emprendedor Fénix (12 Joyas Surtidas)',
        price: 2890000,
        stock: 4,
        cat: 'm',
        tag: 'Más vendido',
        sizes: '',
        desc: 'Pack mayorista de máxima rotación: 4 anillos surtidos, 3 collares, 3 pulseras y 2 aretes en oro 18K garantizado con estuches de lujo.',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'm2',
        name: 'Lote Mayorista Solitarios Corona (6 Unidades)',
        price: 1950000,
        stock: 3,
        cat: 'm',
        tag: 'Exclusivo',
        sizes: '6,7,8,9',
        desc: 'Docena media de anillos Solitario Corona Real con engaste alto artesanal y tallas comerciales surtidas.',
        img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'm3',
        name: 'Kit Cadenas & Dijes Macizos (5 Conjuntos)',
        price: 3450000,
        stock: 2,
        cat: 'm',
        tag: 'Destacado',
        sizes: '45 cm,50 cm,55 cm',
        desc: 'Lote de 5 cadenas de tejido italiano reforzado y dijes clásicos en oro macizo. Presentación prémium para vitrina.',
        img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'm4',
        name: 'Docena Aretes & Candongas Fuego (12 Pares)',
        price: 1680000,
        stock: 5,
        cat: 'm',
        tag: 'Tendencia',
        sizes: '',
        desc: 'Surtido de 12 pares de candongas medianas y topos botón en oro 18K pulido espejo, broches de seguridad reforzados.',
        img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
        on: 1
      },
      {
        id: 'm5',
        name: 'Pack Pulseras & Manillas Cubanas (6 Unidades)',
        price: 2150000,
        stock: 3,
        cat: 'm',
        tag: 'Nuevo',
        sizes: '18 cm,19 cm,20 cm',
        desc: 'Selección de 6 manillas y pulseras diamantadas con broche de caja, tejido tupido de alto impacto visual.',
        img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
        on: 1
      }
    ],
    sales: [
      {
        id: 'v106',
        date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        status: 'pending',
        total: 480000,
        client: { name: 'Mariana Duarte', phone: '573105556677', address: 'Bogotá, Chicó Reservado', payment: 'Transferencia' },
        items: [{ id: 'a1', name: 'Anillo Fénix Dorado', size: '8', qty: 1, price: 480000, subtotal: 480000 }]
      },
      {
        id: 'v101',
        date: '2026-10-28T14:20:00.000Z',
        status: 'confirmed',
        total: 890000,
        client: { name: 'Juan Carlos Pérez', phone: '573112223344', address: 'Bogotá, Cra 7 #72-10', payment: 'Transferencia' },
        items: [{ id: 'b1', name: 'Cadena Imperial Maciza', size: '50 cm', qty: 1, price: 890000, subtotal: 890000 }]
      },
      {
        id: 'v102',
        date: '2026-10-28T18:45:00.000Z',
        status: 'confirmed',
        total: 480000,
        client: { name: 'Carolina Gómez', phone: '573154445566', address: 'Medellín, El Poblado', payment: 'Transferencia' },
        items: [{ id: 'a1', name: 'Anillo Fénix Dorado', size: '7', qty: 1, price: 480000, subtotal: 480000 }]
      },
      {
        id: 'v103',
        date: '2026-10-29T11:15:00.000Z',
        status: 'confirmed',
        total: 650000,
        client: { name: 'Andrés Rueda', phone: '573206667788', address: 'Cali, San Fernando', payment: 'Efectivo' },
        items: [
          { id: 'c1', name: 'Pulsera Renacer', size: '18 cm', qty: 1, price: 390000, subtotal: 390000 },
          { id: 'd2', name: 'Aretes Destello de Llama', size: '', qty: 1, price: 260000, subtotal: 260000 }
        ]
      },
      {
        id: 'v104',
        date: '2026-10-29T15:30:00.000Z',
        status: 'confirmed',
        total: 620000,
        client: { name: 'Valentina Morales', phone: '573008889900', address: 'Barranquilla, Alto Prado', payment: 'Transferencia' },
        items: [{ id: 'a2', name: 'Solitario Corona Real', size: '8', qty: 1, price: 620000, subtotal: 620000 }]
      },
      {
        id: 'v105',
        date: '2026-10-29T17:10:00.000Z',
        status: 'confirmed',
        total: 310000,
        client: { name: 'David Castro', phone: '573181112233', address: 'Bucaramanga, Cabecera', payment: 'Efectivo' },
        items: [{ id: 'd1', name: 'Candongas Fuego Sagrado', size: '', qty: 1, price: 310000, subtotal: 310000 }]
      }
    ]
  });

  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
  // Auto-actualizar a versión 4 con fotos de alta resolución y catálogo completo en todas las categorías
  if (!db || !Array.isArray(db.cats) || !Array.isArray(db.prods) || db.prods.length === 0 || db.version !== 4) {
    db = seed();
    try {
      const prev = JSON.parse(localStorage.getItem('fynx_v1'));
      if (prev && prev.cfg) db.cfg = Object.assign(db.cfg, prev.cfg);
    } catch (e) {}
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }
  db.cfg = Object.assign({
    wa: '573116240316',
    waLabel: 'Línea 1 · Asesoría',
    wa2: '573001234567',
    wa2Label: 'Línea 2 · Pedidos',
    email: ''
  }, db.cfg);
  if (!Array.isArray(db.sales)) db.sales = [];
  db.prods.forEach(p => { if (typeof p.stock === 'undefined') p.stock = 3; });
  // Asegurar la categoría Mayorista en la colección
  const catM = db.cats.find(c => c.id === 'm' || c.name.toLowerCase().includes('mayorista'));
  if (catM) {
    catM.name = 'Mayorista';
  } else {
    db.cats.push({ id: 'm', name: 'Mayorista' });
  }

  // Cargar automáticamente los kits en la categoría Mayorista si no existen en el almacenamiento actual
  if (!db.prods.some(p => p.cat === 'm')) {
    const s = seed();
    const mayoristaKits = s.prods.filter(p => p.cat === 'm');
    db.prods.push(...mayoristaKits);
  }

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  };

  const cleanWaNumber = (n) => {
    let num = String(n || '').replace(/\D/g, '');
    if (num.length === 10 && !num.startsWith('57')) {
      num = '57' + num;
    }
    return num || '573116240316';
  };

  const hasTwoLines = () => Boolean(db.cfg.wa2 && String(db.cfg.wa2).replace(/\D/g, '').length >= 8);

  const getNextWa = (prefLine) => {
    const two = hasTwoLines();
    const l1 = { num: cleanWaNumber(db.cfg.wa), label: db.cfg.waLabel || 'Línea 1 · Asesoría y Ventas', line: 1 };
    const l2 = two ? { num: cleanWaNumber(db.cfg.wa2), label: db.cfg.wa2Label || 'Línea 2 · Atención y Pedidos', line: 2 } : l1;

    if (prefLine === 2 && two) return l2;
    if (prefLine === 1 || !two) return l1;

    const mode = db.cfg.waMode || 'balance';
    if (mode === 'line2' && two) return l2;
    if (mode === 'line1' || !two) return l1;

    // Balanceo inteligente 50/50: alternar turno round-robin
    try {
      const turn = localStorage.getItem('fynx_wa_turn') || '1';
      const nextTurn = turn === '1' ? '2' : '1';
      localStorage.setItem('fynx_wa_turn', nextTurn);
      return turn === '1' ? l1 : l2;
    } catch (e) {
      return l1;
    }
  };

  // Sonido de campanilla dorada sintetizado (Web Audio API: funciona en iOS, Android y PC sin archivos externos)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.28);
      
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch (e) {}
  };

  // Banner visual de alerta inmediata en pantalla (In-App)
  let orderBannerEl = null;
  let orderBannerTimer = null;
  const showOrderBanner = (order) => {
    if (!document.body) return;
    if (!orderBannerEl) {
      orderBannerEl = document.createElement('div');
      orderBannerEl.className = 'fynx-order-banner';
      orderBannerEl.innerHTML = `
        <div class="fynx-order-banner__icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div class="fynx-order-banner__content">
          <div class="fynx-order-banner__title">Nuevo Pedido Recibido</div>
          <p class="fynx-order-banner__desc" data-banner-desc></p>
        </div>
        <button type="button" class="fynx-order-banner__btn" data-banner-open>Ver Pedido</button>
        <button type="button" class="fynx-order-banner__close" data-banner-close aria-label="Cerrar">&times;</button>
      `;
      document.body.appendChild(orderBannerEl);

      orderBannerEl.addEventListener('click', (e) => {
        if (e.target.closest('[data-banner-close]')) {
          orderBannerEl.classList.remove('is-visible');
          clearTimeout(orderBannerTimer);
        } else if (e.target.closest('[data-banner-open]') || e.target.closest('.fynx-order-banner__content')) {
          orderBannerEl.classList.remove('is-visible');
          clearTimeout(orderBannerTimer);
          if (window.location) window.location.hash = '#admin';
        }
      });
    }

    const descEl = orderBannerEl.querySelector('[data-banner-desc]');
    if (descEl) {
      descEl.textContent = `${(order.client && order.client.name) || 'Cliente WhatsApp'} · ${money(order.total)} (${(order.client && order.client.payment) || 'Transferencia'})`;
    }

    orderBannerEl.classList.add('is-visible');
    clearTimeout(orderBannerTimer);
    orderBannerTimer = setTimeout(() => {
      orderBannerEl.classList.remove('is-visible');
    }, 9000);
  };

  // Canal de difusión en tiempo real entre pestañas y dispositivos
  let bc = null;
  try {
    bc = new BroadcastChannel('fynx_orders_channel');
    bc.onmessage = (ev) => {
      if (ev.data && ev.data.type === 'NEW_ORDER' && ev.data.order) {
        playChime();
        showOrderBanner(ev.data.order);
        if (window.FYNX && FYNX.renderAdmin) FYNX.renderAdmin();
      }
    };
  } catch (e) {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'fynx_last_order_broadcast') {
      try {
        playChime();
        const d = JSON.parse(e.newValue);
        const ord = db.sales.find((s) => s.id === d.id) || db.sales[0];
        if (ord) showOrderBanner(ord);
        if (window.FYNX && FYNX.renderAdmin) FYNX.renderAdmin();
      } catch (err) {}
    }
  });

  window.FYNX = {
    db, esc, money, save,
    uid: () => Math.random().toString(36).slice(2, 9),
    hasTwoLines,
    getNextWa,
    cleanWaNumber,
    playChime,
    showOrderBanner,
    waUrl: (m, prefLine) => {
      const target = getNextWa(prefLine);
      return `https://wa.me/${target.num}?text=${encodeURIComponent(m)}`;
    },
    openWaAdvisorModal: (msg) => {
      let modalOverlay = document.getElementById('waAdvisorModal');
      if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'waAdvisorModal';
        modalOverlay.className = 'wa-modal-overlay';
        modalOverlay.setAttribute('role', 'dialog');
        modalOverlay.setAttribute('aria-modal', 'true');
        document.body.appendChild(modalOverlay);
      }

      const two = hasTwoLines();
      const l1 = {
        num: String(db.cfg.wa || '573116240316').replace(/\D/g, ''),
        label: db.cfg.waLabel || 'Línea 1 · Asesoría y Ventas'
      };
      const l2 = {
        num: String(db.cfg.wa2 || '').replace(/\D/g, ''),
        label: db.cfg.wa2Label || 'Línea 2 · Atención y Pedidos'
      };
      const textMsg = encodeURIComponent(msg || 'Hola Joyería Fynx Dorado, deseo asesoría personalizada.');

      modalOverlay.innerHTML = `
        <div class="wa-modal">
          <button type="button" class="wa-modal__close" aria-label="Cerrar modal">&times;</button>
          <h3 class="wa-modal__title">Atención Personalizada</h3>
          <p class="wa-modal__desc">Elige con cuál de nuestras líneas de atención deseas comunicarte vía WhatsApp:</p>
          <div class="wa-modal__options">
            <a class="wa-modal__btn" href="https://wa.me/${l1.num}?text=${textMsg}" target="_blank" rel="noopener">
              <div class="wa-modal__btn-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.4 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/></svg>
              </div>
              <div class="wa-modal__btn-info">
                <b>${esc(l1.label)}</b>
                <small>+${l1.num}</small>
              </div>
            </a>

            ${two ? `
              <a class="wa-modal__btn" href="https://wa.me/${l2.num}?text=${textMsg}" target="_blank" rel="noopener">
                <div class="wa-modal__btn-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.4 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/></svg>
                </div>
                <div class="wa-modal__btn-info">
                  <b>${esc(l2.label)}</b>
                  <small>+${l2.num}</small>
                </div>
              </a>
            ` : ''}
          </div>
        </div>
      `;

      modalOverlay.classList.add('is-active');

      const closeHandler = (e) => {
        if (e.target.closest('.wa-modal__close') || e.target === modalOverlay || e.target.closest('.wa-modal__btn')) {
          modalOverlay.classList.remove('is-active');
          modalOverlay.removeEventListener('click', closeHandler);
        }
      };
      modalOverlay.addEventListener('click', closeHandler);
    },
    validEmail: (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e || ''),
    catName: (id) => (db.cats.find((c) => c.id == id) || {}).name || '',
    
    // Conteo de stock acumulado por categoría
    getCategoryStock: (catId) => {
      return db.prods
        .filter((p) => p.on && (catId === 'todo' || p.cat == catId))
        .reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    },

    // Registra pedido pendiente por confirmar (NO descuenta stock) y alerta al admin
    registerPendingOrder: (soldItems, clientData = {}) => {
      let totalAmount = 0;
      soldItems.forEach((item) => {
        totalAmount += (Number(item.price) || 0) * (Number(item.qty) || 1);
      });
      const order = {
        id: (window.FYNX ? window.FYNX.uid() : Math.random().toString(36).slice(2, 9)),
        date: new Date().toISOString(),
        status: 'pending',
        items: soldItems,
        total: totalAmount,
        client: {
          name: clientData.name || 'Cliente WhatsApp',
          phone: clientData.phone || '',
          address: clientData.address || '',
          payment: clientData.payment || 'Transferencia',
          advisorLine: clientData.advisorLine || 1,
          advisorLabel: clientData.advisorLabel || ''
        }
      };
      db.sales.unshift(order);
      save();

      // 1. Alerta sonora y visual inmediata (In-App)
      playChime();
      showOrderBanner(order);

      // 2. Difusión a todas las pestañas y ventanas abiertas
      try {
        if (bc) bc.postMessage({ type: 'NEW_ORDER', order });
        localStorage.setItem('fynx_last_order_broadcast', JSON.stringify({ id: order.id, time: Date.now() }));
      } catch (e) {}

      // 3. Notificación de sistema (Service Worker Push) si está disponible en este dispositivo
      const title = 'Nuevo Pedido · Fynx Dorado';
      const body = `${order.client.name} envió un pedido por ${money(order.total)} (${order.client.payment}). Toca para confirmar compra.`;
      
      if (typeof window !== 'undefined') {
        if ('Notification' in window && Notification.permission === 'granted') {
          if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: 'icon-192.png',
                badge: 'icon-192.png',
                vibrate: [200, 100, 200, 100, 200],
                tag: 'order-' + order.id,
                renotify: true,
                data: { url: './#admin', orderId: order.id }
              }).catch(() => {});
            });
          } else {
            try { new Notification(title, { body, icon: 'icon-192.png' }); } catch (e) {}
          }
        }
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'NOTIFY',
            title,
            body,
            id: order.id
          });
        }
      }
      return order;
    },

    // Confirmar la compra: descuenta el stock de la tienda y confirma en finanzas
    confirmOrder: (orderId) => {
      const order = db.sales.find((s) => s.id == orderId);
      if (!order || order.status === 'confirmed') return { ok: false, msg: 'Pedido no encontrado o ya confirmado' };

      // Descontar las unidades reales del stock
      (order.items || []).forEach((item) => {
        const prod = db.prods.find((p) => p.id == item.id);
        if (prod) {
          prod.stock = Math.max(0, (Number(prod.stock) || 0) - (Number(item.qty) || 1));
        }
      });
      order.status = 'confirmed';
      order.confirmedAt = new Date().toISOString();
      save();
      return { ok: true, msg: '¡Compra confirmada! Stock descontado de la tienda.' };
    },

    // Rechazar / Cancelar pedido: no altera el stock
    cancelOrder: (orderId) => {
      const order = db.sales.find((s) => s.id == orderId);
      if (!order) return { ok: false };
      order.status = 'cancelled';
      order.cancelledAt = new Date().toISOString();
      save();
      return { ok: true, msg: 'Pedido cancelado. El stock permanece intacto.' };
    },

    // Actualiza directamente el stock de una joya
    updateStock: (id, newStock) => {
      const p = db.prods.find((x) => x.id == id);
      if (p) {
        p.stock = Math.max(0, parseInt(newStock, 10) || 0);
        save();
        return p.stock;
      }
      return null;
    },

    // Eliminar una venta del historial financiero
    deleteSale: (saleId) => {
      db.sales = db.sales.filter((s) => s.id != saleId);
      save();
    },

    // Limpiar todo el historial de ventas
    clearSales: () => {
      db.sales = [];
      save();
    },

    // Restablecer / Cargar datos de prueba completos en todas las categorías
    loadSeedData: () => {
      const s = seed();
      db.version = s.version;
      db.cats = s.cats;
      db.prods = s.prods;
      db.sales = s.sales;
      save();
      return true;
    },

    // Métricas financieras completas distinguiendo confirmadas vs pendientes
    getFinances: () => {
      const confirmedSales = db.sales.filter((s) => s.status === 'confirmed' || (!s.status && s.status !== 'cancelled'));
      const pendingSales = db.sales.filter((s) => s.status === 'pending');
      const totalSales = confirmedSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
      const pendingTotal = pendingSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
      const totalOrders = confirmedSales.length;
      const averageTicket = totalOrders ? Math.round(totalSales / totalOrders) : 0;
      const inventoryValue = db.prods.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);
      const totalPieces = db.prods.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
      const lowStockCount = db.prods.filter((p) => p.stock > 0 && p.stock <= 2).length;
      const outOfStockCount = db.prods.filter((p) => (Number(p.stock) || 0) <= 0).length;
      return {
        totalSales,
        totalOrders,
        pendingCount: pendingSales.length,
        pendingTotal,
        averageTicket,
        inventoryValue,
        totalPieces,
        lowStockCount,
        outOfStockCount,
        sales: db.sales
      };
    }
  };
})();
