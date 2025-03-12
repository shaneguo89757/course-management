"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"

import { AddStudentDialog } from "@/components/add-student-dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { EditStudentDialog } from "@/components/edit-student-dialog"
import { useStudents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentsPage() {
  const { students, toggleStudentStatus } = useStudents()
  const [filter, setFilter] = useState<"active" | "inactive" | "all">("active")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<{
    id: string
    name: string
    ig?: string
  } | null>(null)

  const filteredStudents = students.filter((student) => {
    const matchesFilter =
      filter === "all" || (filter === "active" && student.active) || (filter === "inactive" && !student.active)

    // 搜尋條件：名稱或 IG 帳號包含搜尋詞
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.ig && student.ig.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="學員管理" description="管理學員資料和狀態" />
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[250px]">
              <Label htmlFor="search" className="sr-only">
                搜尋學員
              </Label>
              <Input
                id="search"
                placeholder="搜尋學員名稱或 IG 帳號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[150px]">
              <Label htmlFor="filter" className="sr-only">
                篩選狀態
              </Label>
              <Select value={filter} onValueChange={(value) => setFilter(value as "active" | "inactive" | "all")}>
                <SelectTrigger id="filter">
                  <SelectValue placeholder="篩選狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">啟用</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                  <SelectItem value="all">全部</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            新增學員
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>學員姓名</TableHead>
                <TableHead>IG 帳號</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    沒有找到符合條件的學員
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.ig || "-"}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          student.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.active ? "啟用" : "停用"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingStudent({
                              id: student.id,
                              name: student.name,
                              ig: student.ig,
                            })
                          }
                        >
                          編輯
                        </Button>
                        <Button
                          variant={student.active ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleStudentStatus(student.id)}
                        >
                          {student.active ? "停用" : "啟用"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddStudentDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => {
            if (!open) setEditingStudent(null)
          }}
        />
      )}
    </DashboardShell>
  )
}

