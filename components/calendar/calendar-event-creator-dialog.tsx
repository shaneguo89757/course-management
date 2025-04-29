import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react";
import { CalendarEvent } from "./type";
import EventDateSection from "./components/event-date-section";
import StudentInfoSection from "./components/student-info-section";
import CourseCategorySection from "./components/course-category-section";

export default function CalendarEventCreatorDialog({ defaultDate, onSubmit }: { defaultDate?: Date, onSubmit:(event:CalendarEvent)=>Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate!);
  const [selectedStudentId, setSelectedStudentId] = useState<number|null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number|null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const disableToSave = selectedCourseId == null || selectedStudentId == null;

  // 當 dialog 關閉時重置表單
  useEffect(() => {
    if (open) {
      setSelectedDate(defaultDate!);
      setSelectedCourseId(null);
      setSelectedStudentId(null);
    }
  }, [open]);

  // 處理取消按鈕點擊
  const handleCancel = () => {
    setOpen(false);
  };

  // 處理確認按鈕點擊
  const handleConfirm = async () => {
    if (disableToSave) return;
    
    try {
      setIsSaving(true);
      await onSubmit({
        id: Date.now(),
        date: selectedDate,
        studentId: selectedStudentId,
        courseId: selectedCourseId,
      });
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
      // 成功後關閉 dialog
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8">安排行程</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">安排行程</DialogTitle>
        </DialogHeader>
        
        {/* Body */}
        <div className="grid gap-4 py-4">
          <EventDateSection selectedDate={selectedDate} />
          <StudentInfoSection initStudentId={null} onStudentSelectId={setSelectedStudentId} />
          <CourseCategorySection onCourseSelectId={setSelectedCourseId} />
        </div>
        
        {/* Footer */}
        <DialogFooter className="flex justify-end gap-2">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>取消</Button>
            <Button type="submit" disabled={disableToSave} onClick={handleConfirm} loading={isSaving}>新增</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}