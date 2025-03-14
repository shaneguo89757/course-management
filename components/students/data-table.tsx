"use client"

import { useEffect, useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onEdit: (student: TData) => void
  onToggleStatus: (id: string) => void
}

// 自定義全局搜尋過濾器
const globalFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  // 如果沒有搜尋值，返回所有行
  if (!value) return true

  const searchValue = value.toLowerCase()

  // 檢查名稱欄位
  const name = row.getValue("name") as string
  if (name && name.toLowerCase().includes(searchValue)) return true

  // 檢查 IG 欄位
  const ig = row.getValue("ig") as string | undefined
  if (ig && ig.toLowerCase().includes(searchValue)) return true

  // 如果都不匹配，返回 false
  return false
}

export function DataTable<TData, TValue>({ columns, data, onEdit, onToggleStatus }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const isMobile = useMediaQuery("(max-width: 640px)")

  // 設置手機模式下的列可見性
  useEffect(() => {
    if (isMobile) {
      setColumnVisibility({ ig: false })
    } else {
      setColumnVisibility({})
    }
  }, [isMobile])

  // 初始化時設置狀態篩選為啟用
  useEffect(() => {
    updateStatusFilter("active")
  }, [])

  // 根據狀態篩選設置列篩選器
  const updateStatusFilter = (value: string) => {
    setStatusFilter(value)

    if (value === "all") {
      setColumnFilters(columnFilters.filter((filter) => filter.id !== "active"))
    } else {
      const newFilters = columnFilters.filter((filter) => filter.id !== "active")
      newFilters.push({
        id: "active",
        value: value === "active" ? [true] : [false],
      })
      setColumnFilters(newFilters)
    }
  }

  const table = useReactTable({
    data,
    columns,
    meta: {
      onEdit,
      onToggleStatus,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 7, // 設置每頁顯示 5 行，你可以根據需要調整這個數字
      },
    },
    globalFilterFn: globalFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      {/* 修改搜尋和篩選區域的佈局 */}
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <Input
            placeholder="搜尋學員名稱或 IG 帳號..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full"
          />
        </div>
        <div className="min-w-[70px]">
          <Select value={statusFilter} onValueChange={updateStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="篩選狀態" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="active">啟用</SelectItem>
              <SelectItem value="inactive">停用</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-[45px]" // 減少行高約10%
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  沒有找到符合條件的學員
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">共 {table.getFilteredRowModel().rows.length} 位學員</div>
        <div className="flex items-center space-x-2 hidden md:flex">
          <span className="text-sm text-muted-foreground">每頁顯示</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">行</span>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一頁
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            下一頁
          </Button>
        </div>
      </div>
    </div>
  )
}

