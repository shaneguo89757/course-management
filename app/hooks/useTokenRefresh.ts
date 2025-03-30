'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useTokenRefresh() {
  const router = useRouter();

  const checkAndRefreshToken = useCallback(async () => {
    try {
      const response = await fetch('/auth/google/check');
      const data = await response.json();

      if (data.error === "Token expired" && data.needsRefresh) {
        // 嘗試刷新 token
        const refreshResponse = await fetch('/auth/google/refresh', {
          method: 'POST'
        });
        
        if (!refreshResponse.ok) {
          // 刷新失敗，需要重新登入
          router.push('/auth/login');
          return;
        }

        await refreshResponse.json();
      }
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    // 立即執行第一次檢查
    checkAndRefreshToken();

    // 設置定期檢查
    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000); // 每 5 分鐘檢查一次

    return () => {
      clearInterval(interval);
    };
  }, [checkAndRefreshToken]);
} 