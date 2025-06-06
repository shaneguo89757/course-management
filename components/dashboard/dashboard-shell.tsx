import type React from "react"
import { cn } from "@/lib/utils"
import { MainNav } from "@/components/main-nav"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className="flex h-full flex-col">
      {/* <MainNav /> */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <div className={cn("mx-auto max-w-6xl", className)} {...props}>
          {children}
        </div>
      </main>
    </div>
  )
}

