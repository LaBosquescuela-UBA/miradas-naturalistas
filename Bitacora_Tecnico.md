# Funcionamiento Técnico de la Bitácora

Este documento describe la arquitectura, implementación y lógica detrás de la **Bitácora del Visitante** en el proyecto *Miradas Naturalistas*.

## 1. Arquitectura General

La bitácora es una funcionalidad puramente *client-side*. No depende de una base de datos externa ni de un sistema de autenticación de usuarios. Toda la información se almacena localmente en el navegador del usuario utilizando la API de **LocalStorage**.

### Ventajas de este enfoque:
- **Privacidad**: Los datos nunca salen del dispositivo del usuario.
- **Offline**: Funciona sin conexión a internet una vez cargada la aplicación.
- **Velocidad**: El acceso a los datos es instantáneo.

## 2. Componentes del Almacenamiento

La bitácora se divide en tres subsistemas independientes, cada uno con su propia clave de almacenamiento:

| Funcionalidad | Clave LocalStorage | Descripción |
| :--- | :--- | :--- |
| **Anotaciones** | `mn_bitacora_v1` | Lista de reflexiones y observaciones del usuario. |
| **Favoritas** | `mn_favoritas_v1` | Galería de imágenes guardadas por el usuario. |
| **Progreso** | `mn_visited_v1` | Registro de escenas visitadas para el cálculo de avance. |

## 3. Lógica de Captura de Contexto

Uno de los pilares de la bitácora es su capacidad de "saber" dónde se encuentra el usuario al realizar una acción. Esto se logra mediante la función `currentScene()` en `app.js`.

### Detección de Escena Activa
La aplicación utiliza el desplazamiento (*scroll*) para determinar la escena central:
- En **móvil** (scroll vertical): Se calcula la posición `scrollTop` más la mitad de la altura de la ventana.
- En **escritorio** (scroll horizontal): Se calcula `scrollLeft` más la mitad del ancho de la ventana.
- Se compara este valor con los `offsetTop` o `offsetLeft` de cada elemento con la clase `.scene` para identificar cuál está bajo el "foco".

### Metadatos Capturados
Al crear una anotación, se guardan automáticamente:
- **Texto**: La observación del usuario (limitada a 600 caracteres).
- **Escena**: Una etiqueta legible compuesta por el capítulo y el título de la escena (`data-chapter-label` · `data-scene-title`).
- **Curso**: El identificador del micro-curso asociado (`data-course`).
- **Fecha**: Fecha en formato local de Colombia (`es-CO`).

## 4. Sistema de Favoritas

Las favoritas permiten al usuario coleccionar imágenes y usarlas como accesos directos para navegar por el curso.

### Extracción de Nombres Científicos
Para las leyendas de las fotos, se utiliza la función `extractScientific(alt)`, que intenta aislar el nombre científico del texto alternativo de la imagen mediante:
1. Búsqueda de separadores como ` — ` o ` · `.
2. Patrones de expresiones regulares que buscan palabras con mayúscula inicial seguidas de una palabra en minúscula (ej. *Amanita muscaria*).

### Navegación Inversa
Cada entrada en la lista de favoritas guarda el índice de la escena original (`sidx`). Al hacer clic en una miniatura, la aplicación ejecuta un *smooth scroll* automático hacia la posición exacta de esa escena en el eje correspondiente.

## 5. Seguimiento de Avance (Micro-cursos)

El sistema de progreso permite visualizar qué porcentaje de cada curso ha sido explorado.

1. **Marcado automático**: Al detenerse en una escena que posee el atributo `data-course`, su identificador se añade a un `Set` de escenas visitadas.
2. **Cálculo de estadísticas**: La función `courseStats()` escanea el DOM buscando todas las escenas de un curso específico y calcula la proporción entre escenas totales y escenas marcadas como visitadas en el `Set`.
3. **Persistencia**: El `Set` se serializa como un array JSON para guardarse en `LocalStorage`.

## 6. Interfaz de Usuario (UI)

La bitácora reside en un panel lateral (*drawer*) implementado con CSS y JS:
- **Tabs**: Permiten alternar entre "Mis Notas", "Galería" y "Mi Avance" sin recargar el panel.
- **Formularios**: El envío de notas utiliza el evento `submit` para validar el texto y refrescar la lista instantáneamente.
- **Interactividad**: Se incluyen botones para eliminar entradas individuales y una opción para reiniciar el progreso del curso mediante una confirmación del usuario.

---
*Nota: Al limpiar los datos de navegación del navegador, se perderá la información guardada en la bitácora, ya que LocalStorage está ligado al dominio y al perfil del navegador.*
