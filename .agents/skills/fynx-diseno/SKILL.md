---
name: fynx-diseno
description: Pautas de diseño visual, dirección de arte y experiencia de usuario (UI/UX) móvil para Joyería Fynx Dorado. Sistema Dark Luxury en Negro Obsidiana y Oro Metálico, optimizado para smartphones y PWA.
---

# Joyería Fynx Dorado — Dirección de Arte Mobile-First
> Dark Luxury & Alta Joyería en Oro · Experiencia Nativa para Smartphones

**Tema:** Dark Gold (Negro Obsidiana y Oro Metálico)

La tienda está diseñada primordialmente para navegación en dispositivos móviles (smartphones) y visualización como Progressive Web App (PWA).

## 1. Tokens de Color

| Nombre | Valor | Token | Rol |
|--------|-------|-------|-----|
| Obsidian Black | `#070707` | `--bg-obsidian` | Fondo maestro de la aplicación |
| Carbon Surface | `#111114` | `--surface-card` | Superficie de tarjetas de producto y contenedores |
| Elevated Dark | `#18181c` | `--surface-elevated` | Inputs, modales y hojas inferiores |
| Hairline Gold | `rgba(212, 175, 55, 0.18)` | `--border-gold` | Bordes ultrafinos elegantes |
| Gold Flash | `#fae7a5` | `--gold-1` | Destellos, textos protagonistas, acento brillante |
| Pure Gold | `#d4af37` | `--gold-2` | Oro principal, botones de acción, iconos |
| Antique Gold | `#8a6a1e` | `--gold-3` | Sombras, degradados profundos |
| Ivory White | `#f5f2ea` | `--text-main` | Texto principal de alta legibilidad |
| Warm Muted | `#9e988a` | `--text-muted` | Categorías, subtítulos y precios secundarios |
| Emerald Green | `#25d366` | `--wa-green` | Acentos de contacto y conversión WhatsApp |

**Gradiente Oro:** `linear-gradient(135deg, #fae7a5 0%, #d4af37 45%, #9b7622 100%)`

## 2. Pautas Mobile-First (Celulares)
- **Viewport Ergonómico:** El contenido relevante (catálogo, categorías, CTA) debe ser visible en el primer scroll sin que el logotipo ocupe toda la pantalla.
- **Grilla de Productos:** 2 columnas en celulares (`gap: 12px`), optimizando el espacio visual para mostrar varias piezas simultáneamente con fotos 1:1.
- **Áreas Táctiles:** Mínimo 44px para botones, chips y controles de cierre.
- **Botón Flotante de Compra (WhatsApp):** Ubicado en la zona del pulgar (esquina inferior derecha) con indicador de actividad en vivo.
- **Modales en Celular:** Hojas de diálogo que emergen desde el fondo o modales centrados compactos con cierre rápido.
