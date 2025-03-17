import { createContext, useContext, ReactNode } from "react"
import { IDataStore } from "../types"
import { ZustandStore } from "./zustandStore"

// 創建數據存儲上下文
const StoreContext = createContext<IDataStore | null>(null)

// 創建數據存儲工廠
export class StoreFactory {
  static createStore(type: "zustand" = "zustand"): IDataStore {
    switch (type) {
      case "zustand":
        return new ZustandStore()
      default:
        throw new Error(`Unsupported store type: ${type}`)
    }
  }
}

// 創建 Store Provider 組件
interface StoreProviderProps {
  children: ReactNode
  store: IDataStore
}

export function StoreProvider({ children, store }: StoreProviderProps) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

// 創建 useStore hook
export function useStore(): IDataStore {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return store
} 