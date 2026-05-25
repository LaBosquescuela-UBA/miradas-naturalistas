# Miradas Naturalistas — Diseño Responsive

La aplicación implementa una estrategia responsive de **tres niveles** que transforma radicalmente el paradigma de navegación según el dispositivo, pasando de scroll horizontal editorial (desktop) a scroll vertical nativo (tablet/mobile).

---

## 1. Breakpoints

| Nivel | Rango | Paradigma | Archivo |
|---|---|---|---|
| **Desktop** | > 1300px | Scroll horizontal · escenas lado a lado | `styles.css` (reglas base) |
| **Tablet** | 720px – 1300px | Scroll vertical · layouts de 2 columnas recuperados | `styles.css` líneas 1050–1268 |
| **Mobile** | < 720px | Scroll vertical · todo en 1 columna | `styles.css` líneas 837–1037 |

La detección en JavaScript usa `window.matchMedia('(max-width: 1300px)')` a través de la función `isMobile()`, que se consulta en 9 puntos del código para alternar comportamientos.

---

## 2. Cambio de paradigma: horizontal → vertical

El cambio más significativo ocurre al cruzar los 1300px. En desktop, el `.stage-wrap` usa `overflow-x: scroll` con un `.stage` en `display: flex` (ancho `max-content`). Al pasar a mobile/tablet:

```
Desktop (> 1300px)                  Mobile/Tablet (≤ 1300px)
──────────────────                  ──────────────────────────
.stage-wrap                         .stage-wrap
  overflow-x: scroll                  overflow-x: hidden
  overflow-y: hidden                  overflow-y: auto
                                      height: 100dvh
.stage                                scroll-snap-type: y proximity
  display: flex                     .stage
  width: max-content                  display: block
  height: 100vh                       width: 100%
                                      height: auto
```

---

## 3. Transformación de escenas

Todas las variantes de ancho de escena (`scene--w-80`, `scene--w-100`, `scene--w-110`, `scene--w-130`) se normalizan en mobile:

| Propiedad | Desktop | Mobile (≤ 1300px) |
|---|---|---|
| `width` | 80vw / 100vw / 110vw / 130vw | `100% !important` |
| `height` | `100vh` | `auto`, `min-height: 92dvh` |
| `scroll-snap` | — | `scroll-snap-align: start` |
| Bordes | `border-right` entre escenas | `border-bottom: 1px solid` |

---

## 4. Transformación de layouts por breakpoint

### Mobile (< 720px) — Todo en columna

| Layout | Desktop | Mobile |
|---|---|---|
| `layout-split` | Grid 2 cols (`1.05fr 1fr`) | Flex column, imagen a `56vh` |
| `layout-course` | Grid 2 cols (`1fr 1fr`) | Flex column, imagen a `56vh` |
| `layout-diptych` | Grid 2 cols | Flex column, celdas `aspect-ratio: 4/3` |
| `layout-triptych` | Grid 3 cols | Grid 1 col, filas de `48vh` mínimo |
| `layout-manifesto` | Grid 2 cols (`1fr 1.4fr`) | Flex column |
| `layout-grid` | Grid 4 cols + header | Flex column |
| `layout-stack` | Grid 2 cols (`1.4fr 1fr`) | Flex column |
| `layout-credits` | Grid 2 cols | Flex column |
| `layout-image-only` | `100vh` | `88dvh` |
| `layout-cover` | `100vh` | `92dvh` |

### Tablet (720px – 1300px) — Recupera 2 columnas

El nivel tablet **sobrescribe los `!important` del nivel mobile** para recuperar layouts de dos columnas con proporciones ajustadas:

| Layout | Comportamiento tablet |
|---|---|
| `layout-split` | Grid 2 cols (`1.05fr 1fr`), `min-height: 78dvh` |
| `layout-course` | Grid 2 cols, `min-height: 80dvh`, número grande escalado |
| `layout-diptych` | Grid 2 cols, `min-height: 70dvh` |
| `layout-triptych` | Grid 3 cols mantenidas, `min-height: 70dvh` |
| `layout-manifesto` | Grid 2 cols (`1fr 1.4fr`), padding generoso |
| `layout-grid` | Restaura columnas originales por escena específica |
| `layout-stack` | Grid 2 cols (`1.4fr 1fr`), `min-height: 80dvh` |
| `layout-credits` | Grid 2 cols, `min-height: 82dvh` |
| `layout-image-only` | `78dvh` con caption reposicionado |
| `layout-cover` | `88dvh` con tipografía contenida |

---

## 5. Tipografía fluida por breakpoint

La escala tipográfica se ajusta progresivamente con `clamp()`:

| Clase | Desktop | Tablet | Mobile |
|---|---|---|---|
| `.display--xl` | `clamp(56px, 8.5vw, 130px)` | `clamp(72px, 9vw, 120px)` | `clamp(44px, 11.5vw, 80px)` |
| `.display--lg` | `clamp(42px, 5.8vw, 92px)` | `clamp(56px, 7.5vw, 88px)` | `clamp(46px, 11vw, 80px)` |
| `.display--md` | `clamp(34px, 4.2vw, 72px)` | `clamp(40px, 5.5vw, 64px)` | `clamp(34px, 8.5vw, 60px)` |
| `.display--sm` | `clamp(26px, 3vw, 48px)` | `clamp(28px, 3.6vw, 42px)` | `clamp(26px, 6.5vw, 38px)` |
| `.num-big` | `clamp(120px, 15vw, 240px)` | `clamp(120px, 18vw, 200px)` | `clamp(96px, 30vw, 180px)` |
| `.momento-title` | `clamp(64px, 10vw, 160px)` | `clamp(72px, 11vw, 130px)` | `clamp(52px, 14vw, 96px)` |
| `.body-prose` | `clamp(17px, 1.1vw, 21px)` | `17px` | `17px` |
| `body font-size` | `16px` | `16px` | `15px` |

---

## 6. Navegación adaptativa

### Barra de capítulos (`.chapter-bar`)

| Aspecto | Desktop | Tablet | Mobile |
|---|---|---|---|
| Dirección | `flex-direction: row` | `row` (restaurada) | `column` |
| Progress track | Fila inline, `flex: 1` | Fila, `min-width: 120px` | `width: 100%`, margen vertical |
| Botones capítulo | Número + nombre corto | Número + nombre restaurados | Solo número (`.chap-short` oculto) |
| Tamaño touch | `padding: 7px 10px` | `padding: 10px 14px` | `min: 38×38px` (accesibilidad táctil) |

### Top nav

| Aspecto | Desktop | Tablet | Mobile |
|---|---|---|---|
| Padding | `18px 26px` | `14px 28px` | `12px 16px` |
| Marca | Visible completa | Visible, `12px` | Truncada, `max-width: 56vw` |
| Botones | `padding: 10px 16px` | `9px 14px` | `8px 12px`, `font-size: 10px` |

### Drawers

| Aspecto | Desktop | Tablet | Mobile |
|---|---|---|---|
| Ancho | `min(440px, 92vw)` | `min(560px, 88vw)` | `100%` (pantalla completa) |

---

## 7. Comportamiento JavaScript adaptativo

La función `isMobile()` controla 5 comportamientos diferenciados:

| Funcionalidad | Desktop (> 1300px) | Mobile/Tablet (≤ 1300px) |
|---|---|---|
| **Scroll con rueda** | `deltaY` → `scrollLeft` (×1.4) | Deshabilitado (scroll nativo vertical) |
| **Teclado** (←/→) | `scrollBy` horizontal | Deshabilitado |
| **Progreso** | `scrollLeft / scrollWidth` | `scrollTop / scrollHeight` |
| **Click en capítulo** | `scrollTo({ left: ... })` | `scrollTo({ top: ... })` |
| **Escena actual** | `offsetLeft` del probe | `offsetTop` del probe |
| **Favoritos → escena** | `scrollTo({ left: target.offsetLeft })` | `scrollTo({ top: target.offsetTop })` |

---

## 8. Elementos específicos responsive

### Grid de cursos (portada)

| Breakpoint | Columnas | Gap |
|---|---|---|
| Desktop | 5 items en fila (`flex-wrap`) | `column-gap: 28px` |
| Tablet (≤ 1300px) | 3 por fila (`33.33% - 14px`) | `column-gap: 20px` |
| Mobile (< 720px) | 2 por fila (`50% - 10px`) | `column-gap: 12px` |

### Captions flotantes

| Breakpoint | Posición | Tamaño |
|---|---|---|
| Desktop | `left: var(--gutter)`, `bottom: var(--gutter)`, `max-width: 380px` | Padding `18px 22px` |
| Tablet | `left: 32px`, `bottom: 32px`, `max-width: 360px` | Padding `22px 26px` |
| Mobile | `inset: auto 16px 16px 16px` (pegado a bordes) | Padding `16px`, full-width |

### Tarjetas de glosario

| Breakpoint | Grid columnas | Aspect ratio |
|---|---|---|
| Desktop | Lista vertical con búsqueda | — |
| Mobile < 720px | `1fr` | `16/9` |

---

## 9. Unidades viewport y scroll-snap

La aplicación usa **`dvh` (dynamic viewport height)** en lugar de `vh` para mobile, resolviendo el problema clásico de la barra de navegación del navegador:

- `100dvh` para el stage-wrap
- `92dvh` como `min-height` de escenas
- `88dvh` para covers e image-only en tablet
- `scroll-snap-type: y proximity` en el stage para snap suave entre escenas

---

## 10. Soporte `prefers-reduced-motion`

Para usuarios que prefieren movimiento reducido, la aplicación:

- Reduce la duración de **todas** las animaciones y transiciones a `0.01ms`
- Fuerza `animation-iteration-count: 1`
- Cambia `scroll-behavior` a `auto` (sin suavizado)
- Desactiva específicamente: flip de tarjetas del glosario, transición del splash, drawers, y popover del glosario

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

*Miradas Naturalistas · LaBosquescuela UBA · Mayo 2026*
