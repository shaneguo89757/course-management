"use client"

import { useState, useEffect } from "react"
import { Check, Instagram, PlusCircle, Search, LogOut, X } from "lucide-react"
import { useCourses, useStudents } from "@/lib/data/index"
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
  const { findCourseById, removeStudentFromCourse, addMultipleStudentsToCourse, closeCourse } = useCourses()
  const { students, fetchStudents } = useStudents()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  const course = findCourseById(courseId)
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

  // 獲取學生資料
  useEffect(() => {
    fetchStudents()
  }, [])

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
  const handleAddSelectedStudents = async () => {
    if (selectedStudentIds.length > 0) {
      // 添加多個學生到課程
      await addMultipleStudentsToCourse(courseId, selectedStudentIds)
      setSelectedStudentIds([])
    }
  }

  // 獲取學生資料
  const getStudent = (studentId: string) => {
    return students.find((s) => s.id === studentId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95%] sm:max-w-[500px] p-0 rounded-lg [&>button]:h-10 [&>button]:w-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button>svg]:h-6 [&>button>svg]:w-6"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <CourseHeader course={course} formatDate={formatDate} />
        
        <div>
          <div className="px-6 space-y-4">
            <StudentSearchSection 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              availableStudents={availableStudents}
              selectedStudentIds={selectedStudentIds}
              toggleStudentSelection={toggleStudentSelection}
              handleAddSelectedStudents={handleAddSelectedStudents}
              getStudent={getStudent}
            />
          </div>
          
          <Separator className="mt-2"/>

          <div className="px-6 pb-4">
            <EnrolledStudentsSection 
              course={course}
              courseId={courseId}
              onOpenChange={onOpenChange}
              closeCourse={closeCourse}
              getStudent={getStudent}
              removeStudentFromCourse={removeStudentFromCourse}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Course Header Component
function CourseHeader({ 
  course, 
  formatDate 
}: { 
  course: any
  formatDate: (dateString: string) => string
}) {
  return (
    <div className="pt-6 px-6">
      <DialogHeader className="flex justify-between">
        <DialogTitle className="text-left flex items-center gap-2">
          <span>{course.name}</span>
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
  )
}

// Student Search Section Component
function StudentSearchSection({ 
  searchTerm,
  setSearchTerm,
  availableStudents,
  selectedStudentIds,
  toggleStudentSelection,
  handleAddSelectedStudents,
  getStudent
}: { 
  searchTerm: string
  setSearchTerm: (term: string) => void
  availableStudents: any[]
  selectedStudentIds: string[]
  toggleStudentSelection: (studentId: string) => void
  handleAddSelectedStudents: () => Promise<void>
  getStudent: (studentId: string) => any
}) {
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  
  const handleAddStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    
    setIsAddingStudents(true);
    try {
      await handleAddSelectedStudents();
    } finally {
      setIsAddingStudents(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <AvailableStudentsList 
        availableStudents={availableStudents}
        selectedStudentIds={selectedStudentIds}
        toggleStudentSelection={toggleStudentSelection}
        searchTerm={searchTerm}
      />
      
      <SelectedStudentsBadges 
        selectedStudentIds={selectedStudentIds}
        getStudent={getStudent}
        toggleStudentSelection={toggleStudentSelection}
      />
      
      <Button 
        onClick={handleAddStudents} 
        disabled={selectedStudentIds.length === 0 || isAddingStudents} 
        className="w-full"
        loading={isAddingStudents}
      >
        {isAddingStudents ? "正在新增學員..." : `添加選中的學員 (${selectedStudentIds.length})`}
      </Button>
    </div>
  )
}

// Search Input Component
function SearchInput({ 
  searchTerm, 
  setSearchTerm 
}: { 
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="搜尋學員名稱或 IG 帳號..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8"
        tabIndex={-1}
      />
    </div>
  )
}

// Available Students List Component
function AvailableStudentsList({ 
  availableStudents,
  selectedStudentIds,
  toggleStudentSelection,
  searchTerm
}: { 
  availableStudents: any[]
  selectedStudentIds: string[]
  toggleStudentSelection: (studentId: string) => void
  searchTerm: string
}) {
  if (availableStudents.length === 0) {
    return (
      <div className="text-center p-4 text-sm text-muted-foreground border rounded-md">
        {searchTerm ? "沒有符合搜尋條件的學員" : "沒有可用的學員"}
      </div>
    )
  }
  
  return (
    <ScrollArea className="h-[200px] border rounded-md py-1">
      <div className="mx-2">
        {availableStudents.map((student, index) => (
          <StudentListItem 
            key={student.id}
            student={student}
            isSelected={selectedStudentIds.includes(student.id)}
            onClick={() => toggleStudentSelection(student.id)}
            isLast={index === availableStudents.length - 1}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

// Student List Item Component
function StudentListItem({ 
  student, 
  isSelected, 
  onClick,
  isLast
}: { 
  student: any
  isSelected: boolean
  onClick: () => void
  isLast: boolean
}) {
  return (
    <div key={student.id} className="my-1">
      <div
        className={cn(
          "flex items-center justify-between p-2 rounded-md cursor-pointer",
          isSelected ? "bg-primary/10" : "hover:bg-muted",
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{student.name}</span>
          <span className="text-xs text-muted-foreground flex items-center">
            <Instagram className="h-3 w-3 mr-1" />
            {student.ig}
          </span>
        </div>
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </div>
      {!isLast && <Separator />}
    </div>
  )
}

// Selected Students Badges Component
function SelectedStudentsBadges({ 
  selectedStudentIds,
  getStudent,
  toggleStudentSelection
}: { 
  selectedStudentIds: string[]
  getStudent: (studentId: string) => any
  toggleStudentSelection: (studentId: string) => void
}) {
  if (selectedStudentIds.length === 0) {
    return null
  }
  
  return (
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
  )
}

// Enrolled Students Section Component
function EnrolledStudentsSection({ 
  course,
  courseId,
  onOpenChange,
  closeCourse,
  getStudent,
  removeStudentFromCourse
}: { 
  course: any
  courseId: string
  onOpenChange: (open: boolean) => void
  closeCourse: (courseId: string) => Promise<void>
  getStudent: (studentId: string) => any
  removeStudentFromCourse: (courseId: string, studentId: string) => void
}) {
  if (course.students.length === 0) {
    return <EmptyCourseView courseId={courseId} onOpenChange={onOpenChange} closeCourse={closeCourse} />
  }
  
  return (
    <ScrollArea className="h-[250px]">
      <div className="p-0">
        {course.students.map((studentId: string, index: number) => (
          <EnrolledStudentItem
            key={studentId}
            studentId={studentId}
            courseId={courseId}
            isLast={index === course.students.length - 1}
            getStudent={getStudent}
            removeStudentFromCourse={removeStudentFromCourse}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

// Empty Course View Component
function EmptyCourseView({ 
  courseId, 
  onOpenChange, 
  closeCourse 
}: { 
  courseId: string
  onOpenChange: (open: boolean) => void
  closeCourse: (courseId: string) => Promise<void>
}) {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleCloseCourse = async () => {
    setIsClosing(true);
    try {
      await closeCourse(courseId);
      onOpenChange(false);
    } finally {
      setIsClosing(false);
    }
  };
  
  return (
    <div className="">
      <div className="p-2 pt-2 text-center text-sm text-muted-foreground">尚未有學員登記此日期</div>
      <Button 
        variant="outline"
        onClick={handleCloseCourse}
        disabled={isClosing}
        loading={isClosing}
        className="w-full transform transition-transform duration-200 hover:scale-[1.02] active:scale-95"
      >
        {isClosing ? "正在關閉課程..." : "趁現在關閉課程"}
      </Button>
    </div>
  )
}

// Enrolled Student Item Component
function EnrolledStudentItem({ 
  studentId, 
  courseId, 
  isLast,
  getStudent,
  removeStudentFromCourse
}: { 
  studentId: string
  courseId: string
  isLast: boolean
  getStudent: (studentId: string) => any
  removeStudentFromCourse: (courseId: string, studentId: string) => void
}) {
  const student = getStudent(studentId)
  
  return (
    <div key={studentId}>
      <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-muted">
        <StudentInfo student={student} />
        <RemoveStudentButton 
          student={student} 
          courseId={courseId} 
          studentId={studentId}
          removeStudentFromCourse={removeStudentFromCourse} 
        />
      </div>
      {!isLast && <Separator />}
    </div>
  )
}

// Student Info Component
function StudentInfo({ student }: { student: any }) {
  return (
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
  )
}

// Remove Student Button Component
function RemoveStudentButton({ 
  student, 
  courseId, 
  studentId,
  removeStudentFromCourse
}: { 
  student: any
  courseId: string
  studentId: string
  removeStudentFromCourse: (courseId: string, studentId: string) => void
}) {
  return (
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
      <div className="mt-3">
        <StudentInfo student={student} />
      </div>
    </ConfirmDialog>
  )
}

