# Juego de Gato — GitHub Pages

Juego de gato para dos jugadores en el mismo dispositivo. No requiere servidor ni base de datos.

## Funciones
- Ingreso opcional de nombres.
- Turnos X/O, detección de victoria y empate.
- Marcador acumulado de victorias, empates y partidas terminadas.
- Nueva partida sin perder el marcador.
- Reiniciar todo para volver a solicitar nombres.
- Persistencia local mediante `localStorage`.

## Publicar en GitHub Pages
1. Crear un repositorio público en GitHub.
2. Subir `index.html`, `style.css` y `script.js` a la raíz del repositorio.
3. Abrir **Settings → Pages → Build and deployment**.
4. Seleccionar **Deploy from a branch**, rama **main**, carpeta **/(root)** y guardar.
5. Esperar la publicación y abrir la dirección indicada por GitHub Pages.

## Uso local
Abrir `index.html` en el navegador.

> El marcador se guarda únicamente en el navegador del dispositivo. Dos personas juegan en la misma pantalla. Para partidas en línea entre dispositivos se requiere una solución adicional de sincronización.

- Al iniciar puedes desactivar «Llevar conteo» para jugar sin marcador.
