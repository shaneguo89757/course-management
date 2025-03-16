"use client"

import { useState, useEffect } from "react"
import { Check, Instagram, PlusCircle, Search, LogOut, X } from "lucide-react"
import { useCourses, useStudents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface ManageCourseDialogProps {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageCourseDialog({ courseId, open, onOpenChange }: ManageCourseDialogProps) {
  const { courses, removeStudentFromCourse, addMultipleStudentsToCourse, closeCourse } = useCourses()
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
      <DialogContent className="w-[95%] sm:max-w-[500px] p-0 rounded-lg [&>button]:h-10 [&>button]:w-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button>svg]:h-6 [&>button>svg]:w-6">
        <div className="pt-6 px-6">
          <DialogHeader className="flex justify-between">
            <DialogTitle className="text-left flex items-center gap-2">
              <span>{course.title}</span>
            </DialogTitle>
            <DialogDescription className="text-left flex items-center gap-2">
              <span>{formatDate(course.date)} - </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{course.students.length} 位學生上課</span>
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>
        <div>
          <div className="px-6 space-y-4">
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
                    {availableStudents.map((student, index) => (
                      <div key={student.id}>
                        <div
                          className={cn(
                            "flex items-center justify-between p-2 rounded-md cursor-pointer",
                            selectedStudentIds.includes(student.id) ? "bg-primary/10" : "hover:bg-muted",
                          )}
                          onClick={() => toggleStudentSelection(student.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Instagram className="h-3 w-3 mr-1" />
                              {student.ig}
                            </span>
                          </div>
                          {selectedStudentIds.includes(student.id) && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        {index < availableStudents.length - 1 && <Separator className="" />}
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
          </div>
          {/* 分隔線 */}
          <Separator className="mt-2"/>

          <div className="px-6 pb-4">
            {/* 已登記學員列表 */}
            <div className="rounded-md ">
              {course.students.length === 0 ? (
                <div className="">
                  <div className="p-2 pt-2 text-center text-sm text-muted-foreground">尚未有學員登記此日期</div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      closeCourse(courseId)
                      onOpenChange(false)
                    }} 
                    className="w-full transform transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    趁現在關閉課程
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <div className="p-0">
                    {course.students.map((studentId, index) => {
                      const student = getStudent(studentId)
                      return (
                        <div key={studentId}>
                          <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-4">
                              {/* 一條垂直的狀態線 */}
                              <div className="h-8 w-1 rounded-full bg-blue-200"/>

                              <div className="flex items-center gap-2">
                                <span className="font-medium">{student?.name}</span>
                                {student?.ig && (
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    <Instagram className="h-3 w-3 mr-1" />
                                    {student.ig}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ConfirmDialog
                              trigger={
                                <Button
                                  variant="secondary"
                                  className="h-8 w-8 -my-2 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <LogOut className="h-4 w-4" />
                                  <span className="sr-only">移除學員</span>
                                </Button>
                              }
                              title="確認移除學員"
                              description="確定要將此學員從這堂課程中移除嗎？"
                              confirmText="移除"
                              onConfirm={() => removeStudentFromCourse(courseId, studentId)}
                            >
                              {/* 移除的學生資訊元素 */}
                              <div className="mt-3">
                                <div className="flex items-center gap-4">
                                  <div className="h-8 w-1 rounded-full bg-blue-200"/>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{student?.name}</span>
                                    {student?.ig && (
                                      <span className="text-xs text-muted-foreground flex items-center">
                                        <Instagram className="h-3 w-3 mr-1" />
                                        {student.ig}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </ConfirmDialog>
                          </div>
                          {index < course.students.length - 1 && <Separator className="" />}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

