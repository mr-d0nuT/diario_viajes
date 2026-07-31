// Service worker del diario.
// Al subir una versión nueva de la app hay que cambiar VERSION: es lo que
// invalida la caché anterior y hace que el móvil se baje los archivos nuevos.
const VERSION = 'diari-v3';

// Todo lo que la app necesita para arrancar sin red. jsPDF y los TTF no van
// aquí: solo hacen falta al exportar y son 700 KB que no toca pagar de entrada.
const ESENCIAL = [
    './',
    './index.html',
    './manifest.webmanifest',
    './assets/tailwind.css',
    './assets/fonts/caveat-latin.woff2',
    './assets/fonts/caveat-latin-ext.woff2',
    './assets/fonts/cormorant-latin.woff2',
    './assets/fonts/cormorant-latin-ext.woff2',
    './assets/icons/icon-192.png',
    './assets/icons/icon-180.png'
    // Los de 512 no: solo los pide el sistema al instalar, y eso pasa con red
];

self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
        const cache = await caches.open(VERSION);
        // addAll falla entero si un solo archivo falla; mejor uno a uno
        await Promise.all(ESENCIAL.map(url =>
            cache.add(url).catch(err => console.warn('No se pudo precachear', url, err))
        ));
        self.skipWaiting();
    })());
});

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        const nombres = await caches.keys();
        await Promise.all(nombres.filter(n => n !== VERSION).map(n => caches.delete(n)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if(req.method !== 'GET') return;

    const url = new URL(req.url);

    // Nominatim y cualquier otro dominio: directo a la red. Si no hay, que falle;
    // la app ya enseña las coordenadas cuando no puede resolver el nombre.
    if(url.origin !== self.location.origin) return;

    // La navegación va primero a la red para recoger cambios, y si no hay,
    // al index guardado. Así la app abre igual en un avión.
    if(req.mode === 'navigate') {
        e.respondWith((async () => {
            try {
                const red = await fetch(req);
                const cache = await caches.open(VERSION);
                cache.put('./index.html', red.clone());
                return red;
            } catch(err) {
                return (await caches.match('./index.html')) || Response.error();
            }
        })());
        return;
    }

    // El resto (CSS, fuentes, iconos, jsPDF): primero la caché, y lo que se
    // descargue por primera vez se guarda para la próxima.
    e.respondWith((async () => {
        const enCache = await caches.match(req);
        if(enCache) return enCache;
        try {
            const red = await fetch(req);
            if(red && red.ok && red.type === 'basic') {
                const cache = await caches.open(VERSION);
                cache.put(req, red.clone());
            }
            return red;
        } catch(err) {
            return Response.error();
        }
    })());
});
