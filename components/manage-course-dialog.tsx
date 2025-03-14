"use client"

import { useState, useEffect } from "react"
import { Check, Instagram, PlusCircle, Search, X } from "lucide-react"

import { useCourses, useStudents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ManageCourseDialogProps {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageCourseDialog({ courseId, open, onOpenChange }: ManageCourseDialogProps) {
  const { courses, addStudentToCourse, removeStudentFromCourse, addMultipleStudentsToCourse } = useCourses()
  const { students } = useStudents()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  const course = courses.find((c) => c.id === courseId)
  const activeStudents = students.filter((s) => s.active)

  // 過濾掉已經在課程中的學生，並根據搜尋詞過濾（名稱或 IG 帳號）
  const availableStudents = activeStudents.filter(
    (student) =>
      !course?.students.includes(student.id) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.ig && student.ig.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  // 清除選擇的學生
  useEffect(() => {
    if (!open) {
      setSelectedStudentIds([])
      setSearchTerm("")
    }
  }, [open])

  if (!course) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 處理學生選擇
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  // 添加選中的學生
  const handleAddSelectedStudents = () => {
    if (selectedStudentIds.length > 0) {
      // 添加多個學生到課程
      addMultipleStudentsToCourse(courseId, selectedStudentIds)
      setSelectedStudentIds([])
    }
  }

  // 獲取學生資料
  const getStudent = (studentId: string) => {
    return students.find((s) => s.id === studentId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{course.title}</DialogTitle>
          <DialogDescription>{formatDate(course.date)} - 管理課程學員</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 搜尋和選擇區域 */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋學員名稱或 IG 帳號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                autoFocus={false}
                tabIndex={-1}
              />
            </div>

            {availableStudents.length > 0 ? (
              <ScrollArea className="h-[200px] border rounded-md">
                <div className="p-2">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer",
                        selectedStudentIds.includes(student.id) ? "bg-primary/10" : "hover:bg-muted",
                      )}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Instagram className="h-3 w-3 mr-1" />
                            {student.ig}
                          </span>
                      </div>
                      {selectedStudentIds.includes(student.id) && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center p-4 text-sm text-muted-foreground border rounded-md">
                {searchTerm ? "沒有符合搜尋條件的學員" : "沒有可用的學員"}
              </div>
            )}

            {/* 已選擇的學員 */}
            {selectedStudentIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedStudentIds.map((id) => {
                  const student = getStudent(id)
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {student?.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStudentSelection(id)
                        }}
                      />
                    </Badge>
                  )
                })}
              </div>
            )}

            <Button onClick={handleAddSelectedStudents} disabled={selectedStudentIds.length === 0} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              添加選中的學員 ({selectedStudentIds.length})
            </Button>
          </div>

          {/* 已登記學員列表 */}
          <div className="rounded-md border">
            <div className="p-4">
              <h3 className="font-medium">已登記學員 ({course.students.length})</h3>
            </div>
            {course.students.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">尚未有學員登記此課程</div>
            ) : (
              <ScrollArea className="h-[200px]">
                <ul className="divide-y">
                  {course.students.map((studentId) => {
                    const student = getStudent(studentId)
                    return (
                      <li key={studentId} className="flex items-center justify-between p-4">
                        <div className="flex flex-col">
                          <span>{student?.name}</span>
                          {student?.ig && (
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Instagram className="h-3 w-3 mr-1" />
                              {student.ig}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStudentFromCourse(courseId, studentId)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">移除學員</span>
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

