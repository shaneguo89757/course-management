"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // 初始化匹配狀態
    setMatches(media.matches)

    // 監聽媒體查詢變化
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // 添加監聽器
    media.addEventListener("change", listener)

    // 清理監聽器
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

