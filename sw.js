// Service Worker for Quran App - Offline Support
const CACHE_NAME = 'quran-karim-v1';
const STATIC_CACHE = 'quran-static-v1';
const API_CACHE = 'quran-api-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// API endpoints to cache
const API_PATTERNS = [
    /api\.alquran\.cloud/,
    /api\.quran\.com/,
    /verses\.mp3/,
    /cdn\.cdnfonts\.com/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Check if it's an API request
    const isApiRequest = API_PATTERNS.some((pattern) => pattern.test(url.href));

    if (isApiRequest) {
        // Network first, then cache for API requests
        event.respondWith(
            caches.open(API_CACHE).then((cache) => {
                return fetch(request)
                    .then((response) => {
                        // Cache the new response
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return cached response if offline
                        return cache.match(request);
                    });
            })
        );
    } else {
        // Cache first for static assets
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) {
                    return cached;
                }
                return fetch(request).then((response) => {
                    // Clone response BEFORE using it to avoid "Response body is already used" error
                    if (response.ok && url.origin === self.location.origin) {
                        const responseToCache = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                });
            })
        );
    }
});

// Message handler for cache management
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_SURAH') {
        // Pre-cache a specific surah
        const surahNumber = event.data.surah;
        const urls = [
            `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`,
            `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.muyassar`,
        ];

        caches.open(API_CACHE).then((cache) => {
            urls.forEach((url) => {
                fetch(url).then((response) => {
                    if (response.ok) {
                        cache.put(url, response);
                    }
                });
            });
        });
    }
});
