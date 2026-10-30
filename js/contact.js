// PBI-4 · Formulario de contacto (#7)
// Envío: por correo (FormSubmit) si hay correo configurado en el panel; si no, por WhatsApp
(() => {
  const form = document.querySelector('[data-contact-form]');
  const alertBox = document.querySelector('[data-contact-alert]');
  const submitBtn = document.querySelector('[data-contact-submit]');
  if (!form || !alertBox || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validación básica de campos requeridos
    if (!form.checkValidity()) {
      alertBox.textContent = 'Por favor, completa los campos obligatorios (*) antes de enviar.';
      alertBox.className = 'contact__alert contact__alert--error';
      alertBox.style.display = 'block';
      return;
    }

    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando mensaje...';

    alertBox.style.display = 'none';

    if (!window.FYNX || !FYNX.validEmail(FYNX.db.cfg.email)) {
      const d = new FormData(form);
      window.open(FYNX.waUrl(`Hola Joyería Fynx Dorado, soy ${d.get('nombre')} (${d.get('telefono') || d.get('email')}). Motivo: ${d.get('asunto')}.\n\n${d.get('mensaje')}`), '_blank', 'noopener');
      alertBox.textContent = '¡Gracias! Te llevamos a WhatsApp para enviar tu mensaje.';
      alertBox.className = 'contact__alert contact__alert--success';
      alertBox.style.display = 'block';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      return;
    }

    try {
      const formData = new FormData(form);
      const response = await fetch('https://formsubmit.co/ajax/' + FYNX.db.cfg.email, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        alertBox.textContent = '¡Gracias por escribirnos! Tu mensaje ha sido enviado directamente a nuestro equipo.';
        alertBox.className = 'contact__alert contact__alert--success';
        alertBox.style.display = 'block';
        form.reset();
      } else {
        // En caso de que se requiera la confirmación inicial de FormSubmit
        alertBox.textContent = 'No pudimos enviar tu mensaje. Escríbenos por WhatsApp.'; alertBox.className = 'contact__alert contact__alert--error'; alertBox.style.display = 'block';
      }
    } catch (err) {
      // Si falla la petición fetch por red o CORS, recurrir al envío tradicional POST
      alertBox.textContent = 'No pudimos enviar tu mensaje. Escríbenos por WhatsApp.'; alertBox.className = 'contact__alert contact__alert--error'; alertBox.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      setTimeout(() => {
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  });
})();
