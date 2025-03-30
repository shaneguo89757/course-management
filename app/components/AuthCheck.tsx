'use client';

import { useTokenRefresh } from '../hooks/useTokenRefresh';

export function AuthCheck() {
  useTokenRefresh();
  return null;
} 