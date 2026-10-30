---
name: fynx-seguridad
description: Pautas de seguridad, validación de datos, sanitización XSS y protección de privacidad para la tienda y panel administrativo de Joyería Fynx Dorado.
---

# Directrices de Seguridad: Joyería Fynx Dorado

## 1. Protección contra Cross-Site Scripting (XSS)
- Todo dato proveniente de inputs de usuario, `localStorage` o APIs externas debe pasar por sanitización estricta antes de insertarse en el DOM (`esc()` para entidades HTML `&`, `<`, `>`, `"`, `'`).
- Se prefieren asignaciones mediante `.textContent` o elementos tipados sobre `.innerHTML` directo siempre que sea posible.
- Si se manejan enlaces externos (como WhatsApp o redes), incluir siempre `rel="noopener noreferrer"` y validar el protocolo (`https:`).

## 2. Acceso y Autenticación del Panel Administrativo
- El panel de administración `#admin` cuenta con un PIN de acceso.
- Evitar almacenar contraseñas en texto plano si el proyecto migra a un backend PHP/MySQL (`password_hash($pin, PASSWORD_BCRYPT)`).
- Bloqueo contra fuerza bruta local: limitar los intentos erróneos consecutivos con temporizador de espera.
- La sesión administrativa en memoria debe caducar tras inactividad o al cerrar el modal.

## 3. Integridad de Respaldos y Almacenamiento Local
- Las imágenes subidas desde el navegador se redimensionan en un `<canvas>` antes de persistirse en base64 para evitar saturar el límite de almacenamiento de `localStorage` (típicamente 5MB).
- En la función de exportación de respaldo JSON, validar que el esquema contenga la estructura íntegra (`cfg`, `cats`, `prods`) antes de permitir cualquier importación futura.

## 4. Transacciones y Privacidad del Cliente
- No se capturan datos sensibles de tarjetas ni información financiera directamente en la web estática; los cierres de venta se canalizan de forma segura mediante chat encriptado punto a punto por WhatsApp Business oficial.
