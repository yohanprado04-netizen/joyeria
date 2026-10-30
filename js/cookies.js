// PBI-10 · Política de cookies y bloqueo de navegación (#13)
// - Muestra el aviso si el usuario todavía no ha elegido (usa localStorage)
// - Si acepta: permite navegar, oculta los avisos y dispara eventos/dataset
// - Si rechaza: bloquea la pantalla e impide la navegación hasta que acepte
(() => {
  const STORAGE_KEY = 'fynx_cookies_choice';
  const LEGACY_KEY = 'fynx_cookies_accepted';
  const banner = document.querySelector('[data-cookie-banner]');
  const acceptBtn = document.querySelector('[data-cookie-accept]');
  const rejectBtn = document.querySelector('[data-cookie-reject]');
  const blockedOverlay = document.querySelector('[data-cookie-blocked]');
  const blockedAcceptBtn = document.querySelector('[data-cookie-blocked-accept]');

  if (!banner || !acceptBtn || !rejectBtn) return;

  // Si en la URL viene ?reset-cookies o #reset-cookies, limpiar la preferencia para pruebas
  if (window.location.search.includes('reset-cookies') || window.location.hash.includes('reset-cookies')) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KEY);
    } catch (e) {}
  }

  const applyChoice = (choice) => {
    document.documentElement.dataset.cookies = choice;
    document.dispatchEvent(new CustomEvent('fynx:cookies', { detail: { choice } }));
  };

  const setBlockedState = (isBlocked) => {
    if (isBlocked) {
      document.body.classList.add('is-cookies-blocked');
      if (blockedOverlay) blockedOverlay.removeAttribute('hidden');
    } else {
      document.body.classList.remove('is-cookies-blocked');
      if (blockedOverlay) blockedOverlay.setAttribute('hidden', '');
    }
  };

  const readChoice = () => {
    try {
      const choice = localStorage.getItem(STORAGE_KEY);
      if (choice === 'accepted' || choice === 'rejected') return choice;
      if (localStorage.getItem(LEGACY_KEY) === 'true') return 'accepted';
    } catch (e) {
      // localStorage no disponible
    }
    return null;
  };

  const acceptCookies = () => {
    banner.setAttribute('hidden', '');
    setBlockedState(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      localStorage.removeItem(LEGACY_KEY);
    } catch (e) {}
    applyChoice('accepted');
  };

  const rejectCookies = () => {
    banner.setAttribute('hidden', '');
    setBlockedState(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'rejected');
      localStorage.removeItem(LEGACY_KEY);
    } catch (e) {}
    applyChoice('rejected');
  };

  const saved = readChoice();
  if (saved === 'rejected') {
    applyChoice('rejected');
    setBlockedState(true);
    return;
  } else if (saved === 'accepted') {
    applyChoice('accepted');
    return;
  }

  // Si no ha elegido todavía: mostrar modal y bloquear scroll de la página
  document.body.classList.add('is-cookies-blocked');
  banner.removeAttribute('hidden');

  acceptBtn.addEventListener('click', acceptCookies);
  rejectBtn.addEventListener('click', rejectCookies);
  if (blockedAcceptBtn) blockedAcceptBtn.addEventListener('click', acceptCookies);

  // Utilidad global accesible desde la consola del navegador: FynxCookies.reset()
  window.FynxCookies = {
    reset() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_KEY);
      } catch (e) {}
      setBlockedState(false);
      banner.removeAttribute('hidden');
    },
    getChoice() {
      return readChoice();
    }
  };
})();
