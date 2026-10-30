// PBI-6 · Carrito de compras con selección previa de talla y checkout a yohanprado04@gmail.com
(() => {
  const esc = (s) => window.FYNX ? FYNX.esc(s) : String(s);
  const CART_STORAGE_KEY = 'fynx_cart_items';
  let cart = [];

  // Elementos DOM Carrito
  const cartToggleBtns = document.querySelectorAll('[data-cart-toggle]');
  const cartCloseBtn = document.querySelector('[data-cart-close]');
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const cartOverlay = document.querySelector('[data-cart-overlay]');
  const cartItemsContainer = document.querySelector('[data-cart-items]');
  const cartCountBadges = document.querySelectorAll('[data-cart-count]');
  const cartTotalAmount = document.querySelector('[data-cart-total]');
  const checkoutForm = document.querySelector('[data-cart-checkout-form]');
  const checkoutDetailsInput = document.querySelector('[data-cart-order-details]');
  const checkoutSubmitBtn = document.querySelector('[data-cart-submit]');
  const addButtons = document.querySelectorAll('[data-add-to-cart]');

  // Elementos DOM Modal de Tallas
  const sizeModalOverlay = document.querySelector('[data-size-modal-overlay]');
  const sizeModalImg = document.querySelector('[data-size-modal-img]');
  const sizeModalTitle = document.querySelector('[data-size-modal-title]');
  const sizeModalPrice = document.querySelector('[data-size-modal-price]');
  const sizeOptionsContainer = document.querySelector('[data-size-options]');
  const sizeModalCancelBtn = document.querySelector('[data-size-modal-cancel]');
  const sizeModalConfirmBtn = document.querySelector('[data-size-modal-confirm]');

  let currentPendingProduct = null;
  let selectedSize = null;

  // Mapa de tallas según categoría o producto
  const getSizesForProduct = (card) => (card.dataset.productSizes || '').split(',').map((s) => s.trim()).filter(Boolean);

  // Cargar carrito desde localStorage
  const loadCart = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
    renderCart();
  };

  const saveCart = () => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
    renderCart();
  };

  // Abrir y cerrar drawer del carrito
  const openCart = () => {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('is-active');
      cartOverlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeCart = () => {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('is-active');
      cartOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  };

  cartToggleBtns.forEach(btn => btn.addEventListener('click', openCart));
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Modal de tallas
  const openSizeModal = (product, availableSizes) => {
    currentPendingProduct = product;
    selectedSize = null;

    if (sizeModalImg) {
      sizeModalImg.src = product.image;
      sizeModalImg.alt = product.name;
    }
    if (sizeModalTitle) sizeModalTitle.textContent = product.name;
    if (sizeModalPrice) sizeModalPrice.textContent = formatCOP(product.price);

    if (sizeOptionsContainer) {
      sizeOptionsContainer.innerHTML = availableSizes.map(size => `
        <button type="button" class="size-btn" data-size="${esc(size)}">${esc(size)}</button>
      `).join('');
    }

    if (sizeModalConfirmBtn) {
      sizeModalConfirmBtn.disabled = true;
      sizeModalConfirmBtn.textContent = 'Selecciona una talla';
    }

    if (sizeModalOverlay) {
      sizeModalOverlay.classList.add('is-active');
    }
  };

  const closeSizeModal = () => {
    if (sizeModalOverlay) sizeModalOverlay.classList.remove('is-active');
    currentPendingProduct = null;
    selectedSize = null;
  };

  if (sizeModalCancelBtn) sizeModalCancelBtn.addEventListener('click', closeSizeModal);

  // Selección de talla en el modal
  if (sizeOptionsContainer) {
    sizeOptionsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-size]');
      if (!btn) return;

      sizeOptionsContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      selectedSize = btn.dataset.size;
      if (sizeModalConfirmBtn) {
        sizeModalConfirmBtn.disabled = false;
        sizeModalConfirmBtn.textContent = `Agregar (Talla ${selectedSize})`;
      }
    });
  }

  // Confirmar agregar al carrito con la talla seleccionada
  if (sizeModalConfirmBtn) {
    sizeModalConfirmBtn.addEventListener('click', () => {
      if (!currentPendingProduct || !selectedSize) return;

      const cartItemKey = `${currentPendingProduct.id}-${selectedSize}`;
      const existing = cart.find(i => i.cartKey === cartItemKey);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          cartKey: cartItemKey,
          id: currentPendingProduct.id,
          name: currentPendingProduct.name,
          size: selectedSize,
          price: currentPendingProduct.price,
          image: currentPendingProduct.image,
          quantity: 1
        });
      }

      saveCart();
      closeSizeModal();
      openCart();
    });
  }

  // Formateador de moneda colombiana COP
  const formatCOP = (num) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Renderizar carrito
  const renderCart = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadges.forEach(b => b.textContent = totalItems);

    const totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalAmount) cartTotalAmount.textContent = formatCOP(totalMoney);

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <img class="cart-empty__icon" src="icon-192.png" width="36" height="36" alt="" style="border-radius:50%">
          <p>Tu carrito está vacío.</p>
          <a href="#productos" class="button button--ghost" style="margin-top:1rem;" onclick="document.querySelector('[data-cart-close]').click()">Explorar catálogo</a>
        </div>
      `;
      if (checkoutForm) checkoutForm.style.display = 'none';
      return;
    }

    if (checkoutForm) checkoutForm.style.display = 'flex';

    cartItemsContainer.innerHTML = cart.map(item => `
      <article class="cart-item" data-cart-key="${esc(item.cartKey)}">
        <img class="cart-item__img" src="${esc(item.image)}" alt="${esc(item.name)}">
        <div class="cart-item__info">
          <h4 class="cart-item__title">${esc(item.name)}</h4>
          <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:var(--fw-medium); text-transform:uppercase;">
            Talla: <strong>${esc(item.size)}</strong>
          </span>
          <span class="cart-item__price">${formatCOP(item.price)}</span>
          <div class="cart-item__qty-controls">
            <button type="button" class="cart-item__qty-btn" data-qty-change="-1" aria-label="Disminuir">−</button>
            <span class="cart-item__qty-val">${item.quantity}</span>
            <button type="button" class="cart-item__qty-btn" data-qty-change="1" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button type="button" class="cart-item__remove" data-cart-remove aria-label="Eliminar ${esc(item.name)}">Eliminar</button>
      </article>
    `).join('');

    // Prellenar campos ocultos con resumen estructurado para FormSubmit
    if (checkoutDetailsInput) {
      const itemsList = cart.map((i, idx) => 
        `[${idx + 1}] ${i.name} (Talla: ${i.size}) | Cantidad: ${i.quantity} | Unitario: ${formatCOP(i.price)} | Subtotal: ${formatCOP(i.price * i.quantity)}`
      ).join('\n');
      checkoutDetailsInput.value = itemsList;
    }

    const orderTotalInput = document.querySelector('[data-cart-order-total]');
    if (orderTotalInput) {
      orderTotalInput.value = `${formatCOP(totalMoney)} COP`;
    }
  };

  // Eventos de cantidad y eliminar
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.cart-item');
      if (!itemEl) return;
      const key = itemEl.dataset.cartKey;
      const itemIndex = cart.findIndex(i => i.cartKey === key);
      if (itemIndex === -1) return;

      if (e.target.matches('[data-qty-change]')) {
        const delta = parseInt(e.target.dataset.qtyChange, 10);
        const prod = window.FYNX && FYNX.db.prods.find(p => p.id == cart[itemIndex].id);
        if (delta > 0 && prod && cart[itemIndex].quantity >= (prod.stock || 0)) {
          alert(`Solo hay ${prod.stock} piezas disponibles de esta joya.`);
          return;
        }
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
          cart.splice(itemIndex, 1);
        }
        saveCart();
      } else if (e.target.matches('[data-cart-remove]')) {
        cart.splice(itemIndex, 1);
        saveCart();
      }
    });
  }

  // Agregar al carrito (delegado: las tarjetas se generan desde el panel).
  // Con tallas/medidas pregunta primero; sin ellas agrega directo.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    const card = btn && btn.closest('[data-product]');
    if (!card) return;
    const product = {
      id: card.dataset.productId,
      name: card.dataset.productName,
      price: parseInt(card.dataset.productPrice, 10) || 0,
      image: card.dataset.productImage
    };
    const prodData = window.FYNX && FYNX.db.prods.find(p => p.id == product.id);
    if (prodData && Number(prodData.stock) <= 0) {
      alert('Esta pieza se encuentra agotada temporalmente.');
      return;
    }
    const inCart = cart.find(i => i.id == product.id);
    if (inCart && prodData && inCart.quantity >= (Number(prodData.stock) || 0)) {
      alert(`Has alcanzado el stock disponible (${prodData.stock} unidades).`);
      return;
    }
    const sizes = getSizesForProduct(card);
    if (sizes.length) return openSizeModal(product, sizes);
    currentPendingProduct = product;
    selectedSize = 'Única';
    sizeModalConfirmBtn.click();
  });

  // Checkout: arma el pedido, lo envía al correo (si está configurado) y abre WhatsApp
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!cart.length) return;
      const fd = new FormData(checkoutForm);
      const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const lines = cart.map((i, n) => `${n + 1}. *${i.name}* (Talla: ${i.size}) x${i.quantity} — ${formatCOP(i.price * i.quantity)}`).join('\n');
      const cliente = `*Nombre:* ${fd.get('Nombre del Cliente')}
*Teléfono:* ${fd.get('Telefono de Contacto')}
*Dirección:* ${fd.get('Direccion de Envio')}
*Pago:* ${fd.get('Metodo de Pago')}`;
      if (FYNX.validEmail(FYNX.db.cfg.email)) {
        fetch('https://formsubmit.co/ajax/' + FYNX.db.cfg.email, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ _subject: 'Nuevo pedido · Fynx Dorado', _captcha: 'false', Pedido: lines, Total: formatCOP(total), Cliente: cliente })
        }).catch(() => {});
      }
      // Selección de línea elegida en el carrito (Línea 1 o Línea 2 configuradas en Ajustes)
      const selectedLine = fd.get('advisor_line') === '2' ? 2 : 1;
      const cleanNumHelper = (n) => {
        let num = String(n || '').replace(/\D/g, '');
        if (num.length === 10 && !num.startsWith('57')) num = '57' + num;
        return num || '573116240316';
      };
      const targetPhone = selectedLine === 2 
        ? cleanNumHelper(FYNX.db.cfg.wa2 || '573001234567')
        : cleanNumHelper(FYNX.db.cfg.wa || '573116240316');
      const targetLabel = selectedLine === 2
        ? (FYNX.db.cfg.wa2Label || 'Línea 2 · Pedidos')
        : (FYNX.db.cfg.waLabel || 'Línea 1 · Asesoría y Ventas');

      // Registra el pedido como PENDIENTE (NO descuenta el stock aún).
      // Envía notificación al celular del administrador para que confirme la compra.
      if (window.FYNX && FYNX.registerPendingOrder) {
        FYNX.registerPendingOrder(
          cart.map(i => ({
            id: i.id,
            name: i.name,
            size: i.size,
            qty: i.quantity,
            price: i.price,
            subtotal: i.price * i.quantity
          })),
          {
            name: fd.get('Nombre del Cliente') || 'Cliente WhatsApp',
            phone: fd.get('Telefono de Contacto') || '',
            address: fd.get('Direccion de Envio') || '',
            payment: fd.get('Metodo de Pago') || 'Transferencia',
            advisorLine: selectedLine,
            advisorLabel: targetLabel
          }
        );
      }

      const waMsg = `Hola Joyería Fynx Dorado, quiero hacer este pedido:

${lines}

*Total:* ${formatCOP(total)}

${cliente}`;

      const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(waMsg)}`;

      // Feedback visual inmediato en el carrito
      if (checkoutSubmitBtn) {
        checkoutSubmitBtn.disabled = true;
        checkoutSubmitBtn.textContent = 'Abriendo WhatsApp...';
      }

      // 1. Abrir WhatsApp inmediatamente mediante enlace seguro contra bloqueadores de popups
      const waAnchor = document.createElement('a');
      waAnchor.href = waUrl;
      waAnchor.target = '_blank';
      waAnchor.rel = 'noopener noreferrer';
      document.body.appendChild(waAnchor);
      waAnchor.click();
      setTimeout(() => { try { waAnchor.remove(); } catch (err) {} }, 150);

      // 2. Si es dispositivo móvil o PWA, asegurar apertura directa sin restricción de popups
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if (isMobile) {
        setTimeout(() => {
          window.location.href = waUrl;
        }, 400);
      }

      // 3. Limpiar carrito y resetear formulario tras despacho
      setTimeout(() => {
        cart = [];
        saveCart();
        checkoutForm.reset();
        if (checkoutSubmitBtn) {
          checkoutSubmitBtn.disabled = false;
          checkoutSubmitBtn.textContent = 'Comprar por WhatsApp';
        }
        closeCart();
      }, 1200);
    });
  }

  // Inicializar
  loadCart();
})();
