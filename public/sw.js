const CACHE_NAME = 'course-management-v1';
const STATIC_CACHE_NAME = 'course-management-static-v1';
const DYNAMIC_CACHE_NAME = 'course-management-dynamic-v1';

// 靜態資源：應用核心文件
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 忽略的路徑
const IGNORED_PATHS = [
  '/api/auth',
  '/auth',
  'supabase.co',
];

// 檢查請求是否應該被忽略
function shouldIgnoreRequest(url) {
  return IGNORED_PATHS.some(path => url.includes(path));
}

// 安裝事件：快取靜態資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// 激活事件：清理舊的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 攔截請求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 忽略認證相關和 Supabase 請求
  if (shouldIgnoreRequest(url.toString())) {
    return;
  }

  // 處理 API 請求 (如果不是認證或 Supabase)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 處理導航請求
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  // 處理靜態資源 (CSS, JS, 圖片等)
  if (event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'font' ||
    event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              return caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
    );
    return;
  }

  // 其他請求使用網絡優先策略
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 複製響應
        const responseToCache = response.clone();

        // 僅快取成功的 GET 請求
        if (event.request.method === 'GET' && response.status === 200) {
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
}); 