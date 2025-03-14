"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Instagram } from "lucide-react"

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

export function useStudentColumns(): ColumnDef<Student>[] {
  const isMobile = useMediaQuery("(max-width: 640px)")

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

        return (
          <div>
            <div className="font-medium">{name}</div>
            {isMobile && ig && (
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Instagram className="h-3 w-3 mr-1" />
                {ig}
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
              <DropdownMenuItem onClick={() => table.options.meta?.onEdit(student)}>編輯</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.options.meta?.onToggleStatus(student.id)}
                className={student.active ? "text-destructive" : "text-primary"}
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

