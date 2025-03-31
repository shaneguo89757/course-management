const APP_VERSION = `v${Date.now()}`; // 每次發布更新時修改此版本號
const STATIC_CACHE_NAME = `course-management-static-${APP_VERSION}`;
const DYNAMIC_CACHE_NAME = `course-management-dynamic-${APP_VERSION}`;

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

// 安裝事件：快取靜態資源並立即激活
self.addEventListener('install', (event) => {
  // 跳過等待，立即激活新版本
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets for version', APP_VERSION);
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// 激活事件：清理舊的快取
self.addEventListener('activate', (event) => {
  // 接管所有開啟的頁面
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 刪除所有不屬於當前版本的緩存
          if (cacheName.startsWith('course-management-') &&
            !cacheName.includes(APP_VERSION)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // 接管所有打開的頁面
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

  // 處理導航請求 - 使用網路優先策略
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