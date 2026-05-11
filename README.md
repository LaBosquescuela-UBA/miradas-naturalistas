# Miradas Naturalistas — Micro-Cursos

## Overview
Sitio editorial de **scroll-storytelling** diseñado para **LaBosquescuela UBA**. El proyecto ofrece un recorrido inmersivo por el ecosistema de los Cerros Orientales de Bogotá a través de cinco micro-cursos, integrando fotografía de alta resolución, glosario interactivo y una bitácora personal para el visitante.

**Producción**: [micro-cursos.labosquescuela.org](https://micro-cursos.labosquescuela.org)

## Los Micro-cursos
El itinerario se divide en cinco ejes temáticos que exploran la inteligencia natural del bosque andino y el páramo:

1.  **01 Niebla**: Investiga la "precipitación horizontal" y el ciclo hidrológico continental (Ruta AAA). Presenta bioindicadores sensibles como la ranita bogotana y el colibrí entre la bruma.
2.  **02 Ericáceas**: El cinturón de matorrales de alta montaña. Estrategias de supervivencia como filtros solares (antocianinas), néctares tixotrópicos y flores diseñadas para polinizadores específicos.
3.  **03 Líquenes**: Un estudio sobre la simbiosis (holobiontes). Desde pioneros en la roca desnuda hasta tapices complejos que actúan como la piel protectora del ecosistema.
4.  **04 Hongos**: La red invisible del micelio y las alianzas subterráneas (micorrizas). Explora cómo las esporas microscópicas son verdaderas "hacedoras de lluvia".
5.  **05 Especies problema**: Reflexiones sobre la observación naturalista y las interconexiones interespecie, como la polinización por zumbido del abejorro *Bombus*.

## Stack Tecnológico
- **Core**: HTML5, CSS3 y JavaScript (ES Modules) vanilla. Sin frameworks de UI.
- **Build Tool**: [Vite 5](https://vitejs.dev/) para desarrollo rápido y optimización de assets.
- **Imágenes**: [sharp](https://sharp.pixelplumbing.com/) para la generación de variantes WebP optimizadas.

## Comandos Rápidos
```bash
npm install          # Instalar dependencias de desarrollo
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Generar bundle de producción en dist/
npm run deploy       # Build y despliegue a Firebase
```

## Estructura del Proyecto
- `index.html`: Marcado principal de las 65 escenas (incluyendo momentos de transición).
- `app.js`: Motor de navegación (scroll horizontal/vertical), gestión del glosario y bitácora.
- `styles.css`: Sistema visual completo, variables de diseño y adaptabilidad móvil.
- `glossary.js`: Base de datos de 31 términos técnicos y ecológicos.
- `assets/img/`: Fotografías originales y variantes WebP optimizadas.

## Diseño y Accesibilidad
- **Paletas Dinámicas**: Cada micro-curso adapta los acentos cromáticos del sitio según su bioma.
- **Interacción**: Tarjetas de glosario con efecto 3D y sistema de "favoritos" en la bitácora.
- **Accesibilidad**: Navegación por teclado, etiquetas ARIA completas y soporte para `prefers-reduced-motion`.

---
*Producción original de LaBosquescuela UBA - MangleRojo ORG · Mayo 2026*
