export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);

          // 檢查更新
          registration.addEventListener("updatefound", () => {
            // 有新的 Service Worker 正在安裝
            const newWorker = registration.installing;
            console.log("New service worker installing:", newWorker);

            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // 有新版本可用，顯示更新提示或自動更新
                  console.log("New version available!");
                  showUpdateUI();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });

      // 當 Service Worker 控制權變更，可能是新 Service Worker 接管
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        console.log(
          "New service worker activated, reloading page for fresh content..."
        );
        window.location.reload();
      });
    });
  }
}

// 顯示更新提示 UI
function showUpdateUI() {
  if (typeof document === "undefined") return; // 防止 SSR 報錯

  // 創建或獲取通知元素
  let updateNotification = document.getElementById("sw-update-notification");

  if (!updateNotification) {
    updateNotification = document.createElement("div");
    updateNotification.id = "sw-update-notification";
    updateNotification.style.position = "fixed";
    updateNotification.style.bottom = "20px";
    updateNotification.style.right = "20px";
    updateNotification.style.backgroundColor = "#4a5568";
    updateNotification.style.color = "white";
    updateNotification.style.padding = "10px 20px";
    updateNotification.style.borderRadius = "5px";
    updateNotification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    updateNotification.style.zIndex = "9999";
    updateNotification.innerHTML = `
      <p style="margin: 0 0 10px 0;">系統已更新，請重新整理獲取最新版本</p>
      <button id="sw-update-button" style="background-color: #38b2ac; border: none; color: white; padding: 5px 15px; border-radius: 3px; cursor: pointer;">立即更新</button>
    `;

    document.body.appendChild(updateNotification);

    document
      .getElementById("sw-update-button")
      ?.addEventListener("click", () => {
        window.location.reload();
      });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
