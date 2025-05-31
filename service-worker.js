// اسم التخزين المؤقت
const CACHE_NAME = 'quran-app-cache-v2';

// الموارد التي سيتم تخزينها مؤقتاً
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/fonts/kitab-base.woff2',
  '/assets/fonts/kitab-base-b.woff2',
  '/assets/fonts/yousef-regular.woff2',
  '/assets/fonts/yousef-regular.woff',
  '/assets/fonts/yousef-regular.ttf',
  '/assets/fonts/yousef-Bold.woff2',
  '/assets/fonts/yousef-Bold.woff',
  '/assets/fonts/yousef-Bold.ttf',
  '/fallback-data/reciters.json',
  '/fallback-data/athkar.json',
  '/fallback-data/duas.json',
  '/fallback-data/prayer-times.json',
  '/fallback-data/reciter-audio.json',
  '/fallback-data/quran.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
  );
});

// استراتيجية التخزين المؤقت: Network First, fallback to Cache
self.addEventListener('fetch', event => {
  // تجاهل طلبات chrome-extension وغيرها من المخططات غير المدعومة
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  // إذا كان الطلب لبيانات القرآن الكريم، استخدم استراتيجية Cache First
  if (event.request.url.includes('api.alquran.cloud/v1/quran') || 
      event.request.url.includes('quran.com/api/v4/quran')) {
    event.respondWith(
      caches.match('/fallback-data/quran.json')
        .then(response => {
          if (response) {
            // استخدام النسخة المخزنة مؤقتاً أولاً
            return response;
          }
          // إذا لم تكن هناك نسخة مخزنة، استخدم الشبكة
          return fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    try {
                      cache.put(event.request, responseToCache);
                    } catch (error) {
                      console.log('خطأ في تخزين بيانات القرآن:', error);
                    }
                  });
              }
              return networkResponse;
            });
        })
    );
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // تخزين الاستجابة الجديدة في التخزين المؤقت
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              try {
                cache.put(event.request, responseToCache);
              } catch (error) {
                console.log('خطأ في تخزين الاستجابة:', error);
              }
            });
        }
        return response;
      })
      .catch(() => {
        // استخدام النسخة المخزنة مؤقتاً إذا كانت متوفرة
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // للطلبات API، استخدم البيانات الاحتياطية المناسبة
            if (event.request.url.includes('/api/proxy/reciters')) {
              return caches.match('/fallback-data/reciters.json');
            }
            if (event.request.url.includes('/api/proxy/athkar')) {
              return caches.match('/fallback-data/athkar.json');
            }
            if (event.request.url.includes('/api/proxy/duas')) {
              return caches.match('/fallback-data/duas.json');
            }
            if (event.request.url.includes('/api/proxy/prayer-times')) {
              return caches.match('/fallback-data/prayer-times.json');
            }
            if (event.request.url.includes('/api/proxy/reciter-audio')) {
              return caches.match('/fallback-data/reciter-audio.json');
            }
            if (event.request.url.includes('api.alquran.cloud/v1/quran') || 
                event.request.url.includes('quran.com/api/v4/quran')) {
              return caches.match('/fallback-data/quran.json');
            }
            
            // إذا كان الطلب لتحميل صوت، استخدم مصدر بديل
            if (event.request.url.includes('.mp3')) {
              // محاولة استخدام مصدر صوتي بديل
              const ayahNumber = extractAyahNumber(event.request.url);
              if (ayahNumber) {
                const alternateAudioUrl = getAlternateAudioUrl(ayahNumber);
                return fetch(alternateAudioUrl)
                  .catch(() => {
                    // في حالة فشل المصدر البديل أيضاً، عرض رسالة خطأ
                    return new Response(
                      JSON.stringify({ error: 'لا يمكن تحميل الصوت، يرجى التحقق من الاتصال بالإنترنت' }),
                      { headers: { 'Content-Type': 'application/json' } }
                    );
                  });
              }
            }
            
            // بالنسبة للصفحات، عرض صفحة عدم الاتصال
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            
            // إذا لم يكن هناك نسخة مخزنة مؤقتاً، عرض رسالة خطأ
            return new Response(
              JSON.stringify({ error: 'غير متصل بالإنترنت', offline: true }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
      })
  );
});

// تحديث التخزين المؤقت عند تثبيت نسخة جديدة
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// استخراج رقم الآية من URL
function extractAyahNumber(url) {
  // مثال: https://everyayah.com/data/AbdulSamad_64kbps/001001.mp3
  const match = url.match(/(\d{6})\.mp3$/);
  if (match) {
    return match[1];
  }
  
  // مثال: https://download.quranicaudio.com/quran/abdul_basit_murattal/001.mp3
  const surahMatch = url.match(/\/(\d{3})\.mp3$/);
  if (surahMatch) {
    return surahMatch[1] + '001'; // افتراض الآية الأولى
  }
  
  return null;
}

// الحصول على URL بديل للصوت
function getAlternateAudioUrl(ayahNumber) {
  if (ayahNumber.length === 6) {
    const surah = ayahNumber.substring(0, 3);
    const ayah = ayahNumber.substring(3);
    
    // قائمة بمصادر بديلة
    const alternativeSources = [
      `https://everyayah.com/data/AbdulSamad_64kbps/${ayahNumber}.mp3`,
      `https://everyayah.com/data/Alafasy_64kbps/${ayahNumber}.mp3`,
      `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${parseInt(surah)}${parseInt(ayah)}.mp3`,
      `https://verse.mp3quran.net/arabic/maher_almuaiqly/${parseInt(surah)}${parseInt(ayah)}.mp3`
    ];
    
    // اختيار مصدر عشوائي
    return alternativeSources[Math.floor(Math.random() * alternativeSources.length)];
  }
  
  return `https://everyayah.com/data/AbdulSamad_64kbps/001001.mp3`; // الفاتحة كاحتياطي
} 