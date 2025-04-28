import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react";
import { CalendarEvent, fakeEventStudents } from "./type";
import EventDateSection from "./components/event-date-section";
import StudentInfoSection from "./components/student-info-section";
import CourseCategorySection from "./components/course-category-section";
import { useCourseStore } from "../course/type";

export default function CalendarEventEditorDialog({ 
  event, 
  onSubmit,
  onDelete,
  open,
  onOpenChange
}: { 
  event: CalendarEvent, 
  onSubmit:(event:CalendarEvent)=>Promise<void>,
  onDelete:(eventId:number)=>Promise<void>,
  open: boolean,
  onOpenChange: (open: boolean) => void
}) {
  const {courses} = useCourseStore();

  const [selectedDate, setSelectedDate] = useState<Date>(event.date);
  const [selectedStudentId, setSelectedStudentId] = useState<number|null>(event.studentId);
  const [selectedCourseId, setSelectedCourseId] = useState<number|null>(event.courseId);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const disableToSave = selectedCourseId == null || selectedStudentId == null;

  // 處理取消按鈕點擊
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await onDelete(event.id);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      onOpenChange(false);
      setIsDeleting(false);
    }
  };

  // 處理確認按鈕點擊
  const handleConfirm = async () => {
    if (disableToSave) return;
    
    try {
      setIsSaving(true);
      await onSubmit({
        id: event.id,
        date: selectedDate,
        studentId: selectedStudentId,
        courseId: selectedCourseId,
      });
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
      // 成功後關閉 dialog
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">編輯課堂行程</DialogTitle>
        </DialogHeader>
        
        {/* Body */}
        <div className="grid gap-4 py-4">
          <EventDateSection selectedDate={selectedDate} />
          <StudentInfoSection initStudentId={selectedStudentId} onStudentSelectId={setSelectedStudentId} disabled={true}/>
          <CourseCategorySection initialCourseId={selectedCourseId} onCourseSelectId={setSelectedCourseId} disabled={true}/>
        </div>
        
        {/* Footer */}
        <DialogFooter className="flex justify-end gap-2">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>取消</Button>
            <DeleteAlertDialog onDelete={handleDelete} isDeleting={isDeleting} />
            <Button type="submit" disabled={disableToSave} onClick={handleConfirm} loading={isSaving}>確認</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteAlertDialog({
  onDelete,
  isDeleting
}: {
  onDelete: () => void,
  isDeleting: boolean
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" loading={isDeleting}>刪除</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認刪除</AlertDialogTitle>
          <AlertDialogDescription>
            確認刪除課堂行程嗎？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 hover:bg-red-400" onClick={onDelete}>確認</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
