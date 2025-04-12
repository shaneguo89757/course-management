"use client"

import type { ColumnDef, TableMeta } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Instagram, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"

// 定義學員數據類型
export type Student = {
  id: string
  name: string
  active: boolean
  ig?: string
}

// 定義表格元數據類型
interface StudentTableMeta extends TableMeta<Student> {
  onEdit: (student: Student) => void
  onToggleStatus: (id: string) => Promise<void>
}

export function useStudentColumns(): ColumnDef<Student>[] {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const handleToggleStatus = async (studentId: string, onToggleStatus?: (id: string) => Promise<void>) => {
    if (!onToggleStatus) return
    
    setLoadingIds(prev => new Set(prev).add(studentId))
    try {
      await onToggleStatus(studentId)
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev)
        next.delete(studentId)
        return next
      })
    }
  }

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            學員姓名
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const name = row.getValue("name") as string
        const ig = row.original.ig
        const isLoading = loadingIds.has(row.original.id)

        return (
          <div>
            <div className="font-medium flex items-center gap-2">
              {name}
              {isLoading && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>處理中...</span>
                </div>
              )}
            </div>
            {isMobile && (
              <div className="text-xs text-muted-foreground flex items-center mt-1 min-h-[16px]">
                <Instagram className="h-3 w-3 mr-1" />
                {ig || '\u00A0'}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "ig",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Instagram 帳號
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("ig") || "-"}</div>,
      enableHiding: true,
    },
    {
      accessorKey: "active",
      header: "狀態",
      cell: ({ row }) => {
        const active = row.getValue("active") as boolean

        return (
          <Badge variant={active ? "default" : "destructive"} className="whitespace-nowrap">
            {active ? "啟用" : "停用"}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const student = row.original
        const isLoading = loadingIds.has(student.id)
        const meta = table.options.meta as StudentTableMeta | undefined
        const onToggleStatus = meta?.onToggleStatus
        const onEdit = meta?.onEdit

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">開啟選單</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(student)}>編輯</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(student.id, onToggleStatus)}
                className={student.active ? "text-destructive" : "text-primary"}
                disabled={isLoading}
              >
                {student.active ? "停用" : "啟用"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return columns
}

