# diario_viajes

Diario de viajes: fotos tipo polaroid, notas de voz, ubicación y texto manuscrito,
todo guardado en el propio teléfono. Funciona sin conexión y se puede instalar
como una app.

## Instalarlo en el móvil

Con la app abierta en el navegador:

- **Android (Chrome):** aparece un botón **⤋ Instal·lar** en la cabecera. Si no
  sale, menú ⋮ → *Añadir a pantalla de inicio*.
- **iPhone (Safari):** botón *Compartir* → *Añadir a pantalla de inicio*. iOS no
  ofrece el botón automático, hay que hacerlo desde ahí.

Una vez instalada arranca sin barra de navegador y **sin necesidad de cobertura**:
la app entera queda guardada en el teléfono la primera vez que se abre.

Lo único que pide red es el nombre del lugar donde se hizo la foto (se consulta a
OpenStreetMap) y, la primera vez, la exportación a PDF. Sin red, la ubicación se
guarda igual en coordenadas y el PDF sale por el diálogo de impresión.

## Los datos

Se guardan en IndexedDB, en el teléfono, y no salen de ahí. **No hay copia en
ningún servidor**, así que conviene usar de vez en cuando **⤓ Exportar** para
guardar un JSON de respaldo; **⤒ Importar** lo restaura y siempre añade, nunca
sobrescribe.

## Desarrollo

Todo vive en `index.html`, sin framework ni bundler. En `assets/` están las
dependencias vendorizadas: las fuentes (Caveat y Cormorant Garamond, SIL OFL 1.1),
jsPDF (MIT) y el CSS de Tailwind ya compilado.

Tailwind **no** se carga por CDN. Si tocas clases en el HTML hay que regenerar el CSS:

```bash
npx tailwindcss@3 -c tailwind.config.js -i tailwind.in.css -o assets/tailwind.css --minify
```

Al publicar una versión nueva, sube `VERSION` en `sw.js`: es lo que hace que los
móviles se descarguen los archivos nuevos en vez de seguir con los cacheados.

Para probarlo en local hace falta servirlo por HTTP; con `file://` el navegador no
deja registrar el service worker:

```bash
python3 -m http.server 8766 --directory .
```
