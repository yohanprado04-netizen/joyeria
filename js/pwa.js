// Manejador de instalación de la aplicación (PWA) e instrucciones para iPhone / iOS
(() => {
  let deferredPrompt = null;
  const isIos = () => {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  };

  const isStandalone = () => {
    return ('standalone' in window.navigator && window.navigator.standalone) || 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches;
  };

  const hideInstallButtons = () => {
    document.querySelectorAll('[data-pwa-install]').forEach((btn) => {
      btn.style.display = 'none';
      btn.setAttribute('hidden', '');
    });
  };

  function init() {
    // Si la app se ejecuta desde la pantalla de inicio o ya fue instalada previamente
    if (isStandalone() || localStorage.getItem('fynx_pwa_installed') === 'true') {
      hideInstallButtons();
    }

    try {
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
        if (e.matches) hideInstallButtons();
      });
    } catch (_) {}

    const modal = document.querySelector('[data-ios-modal]');
    const openIosModal = () => {
      if (modal) {
        modal.hidden = false;
        requestAnimationFrame(() => modal.classList.add('is-open'));
        document.documentElement.style.overflow = 'hidden';
      }
    };

    const closeIosModal = () => {
      if (modal) {
        modal.classList.remove('is-open');
        setTimeout(() => {
          modal.hidden = true;
          document.documentElement.style.overflow = '';
        }, 250);
      }
    };

    // Botones de cierre del modal
    document.querySelectorAll('[data-ios-modal-close]').forEach((btn) => {
      btn.addEventListener('click', closeIosModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
        closeIosModal();
      }
    });

    // Guardar evento de instalación de Android / Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Actualizar texto si se desea
      document.querySelectorAll('[data-pwa-install]').forEach((btn) => {
        btn.classList.add('pwa-ready');
      });
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      try {
        localStorage.setItem('fynx_pwa_installed', 'true');
      } catch (_) {}
      hideInstallButtons();
    });

    // Clic en los botones "Descargar App" / "Instalar App"
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-pwa-install]');
      if (!btn) return;
      e.preventDefault();

      if (isStandalone()) {
        alert('Joyería Fynx Dorado ya está instalada y ejecutándose en tu pantalla de inicio.');
        return;
      }

      // Si es iPhone o iPad: Mostrar guía con animación e instrucciones de Safari
      if (isIos()) {
        openIosModal();
        return;
      }

      // Si es Android o Desktop con soporte nativo de instalación
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          deferredPrompt = null;
        }
        return;
      }

      // Si el navegador no soporta beforeinstallprompt (ej. Firefox o Safari en Mac/PC)
      openIosModal();
    });

    // Pantalla de carga con logo y barra dorada: se muestra de entrada al ingresar al sitio
    const splashEl = document.getElementById('pwa-splash');
    if (splashEl) {
      if (localStorage.getItem('fynx_admin_authed') === 'true') {
        splashEl.style.display = 'none';
        splashEl.setAttribute('hidden', '');
      } else {
        setTimeout(() => {
          splashEl.classList.add('is-hidden');
          setTimeout(() => {
            splashEl.setAttribute('hidden', '');
            splashEl.style.display = 'none';
          }, 450);
        }, 1250);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
