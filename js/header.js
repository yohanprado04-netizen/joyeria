// PBI-1 · Header con logo y menú (#4) · PBI-7 · Navegación móvil (#10)
// - Menú móvil a pantalla completa: bloquea el scroll del fondo y lleva el foco al primer enlace
// - Se cierra con Escape, al tocar un enlace, al tocar fuera de la lista o al pasar a escritorio
// - Marca el enlace de la sección visible (aria-current)
// - Sombra del header al hacer scroll
(() => {
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!header || !toggle || !nav) return;

  const label = toggle.querySelector('.visually-hidden');
  const list = nav.querySelector('ul');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const desktop = window.matchMedia('(min-width: 768px)');

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open, { returnFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    root.classList.toggle('is-nav-open', open);
    if (label) label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    if (open && links[0]) links[0].focus({ preventScroll: true });
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));

  // Tocar el espacio vacío del panel (fuera de la lista) lo cierra
  nav.addEventListener('click', (event) => {
    if (isOpen() && list && !list.contains(event.target)) setOpen(false, { returnFocus: true });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });

  // Sombra al hacer scroll
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Enlace activo según la sección visible
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
})();
