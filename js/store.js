// Datos compartidos de la tienda y el panel (localStorage). Se carga primero.
(() => {
  const KEY = 'fynx_v4';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
  const seed = () => ({
    version: 4,
    cfg: { wa: '573116240316', email: '' },
    cats: [
      { id: 'a', name: 'Anillos' },
      { id: 'b', name: 'Collares' },
      { id: 'c', name: 'Pulseras' },
      { id: 'd', name: 'Aretes' }
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
  db.cfg = Object.assign({ wa: '573116240316', email: '' }, db.cfg);
  if (!Array.isArray(db.sales)) db.sales = [];
  db.prods.forEach(p => { if (typeof p.stock === 'undefined') p.stock = 3; });

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  };

  window.FYNX = {
    db, esc, money, save,
    uid: () => Math.random().toString(36).slice(2, 9),
    waUrl: (m) => `https://wa.me/${String(db.cfg.wa).replace(/\D/g, '')}?text=${encodeURIComponent(m)}`,
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
          payment: clientData.payment || 'Transferencia'
        }
      };
      db.sales.unshift(order);
      save();

      // Enviar notificación al Service Worker y al móvil del administrador si la app está instalada
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
