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
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Swatches } from '@mynaui/icons-react';
import { formatDate } from "date-fns"
import { Card, CardContent } from "../ui/card";
import { CourseCategoryList, CourseList } from "../course/manage-course-view";
import { Course, CourseCategory, useCourseStore } from "../course/type";
import { useEffect, useState } from "react";
import { PlusIcon } from "../icons/PlusIcon";
import { FlowerIcon } from "../icons/FlowerIcon";
import { RoseIcon } from "../icons/RoseIcon";

export default function CalendarEventEditorDialog({ defaultDate }: { defaultDate?: Date }) {
  const [open, setOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number|null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate!);
  
  const disableToSave = selectedCourseId == null;

  // 當 dialog 關閉時重置表單
  useEffect(() => {
    if (open) {
      setSelectedDate(defaultDate!);
      setSelectedCourseId(null);
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
      // TODO: 在這裡添加您的確認邏輯
      // 例如：保存事件到資料庫
      console.log('Saving event:', {
        date: selectedDate,
        courseId: selectedCourseId
      });
      
      // 成功後關閉 dialog
      setOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      // 可以在這裡添加錯誤處理邏輯
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8">安排學員</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Calendar Event</DialogTitle>
        </DialogHeader>
        
        {/* Body */}
        <div className="grid gap-4 py-4">
          <EventDateSection selectedDate={selectedDate} />
          <StudentInfoSection />
          <CourseCategorySection onCourseSelectId={setSelectedCourseId} />
        </div>
        
        {/* Footer */}
        <DialogFooter className="flex justify-end gap-2">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>取消</Button>
            <Button type="submit" disabled={disableToSave} onClick={handleConfirm}>確認</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EventDateSection({ selectedDate }: { selectedDate: Date }) {
  return(
    <div>
      <div className="inline-block mb-2">
        <h4 className="event-editor-title">
          <Calendar className="h-6 w-6" /> 日期：
        </h4>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="h-6 cursor-pointer font-normal border-gray-600 text-gray-600"
        >
          {selectedDate ? formatDate(selectedDate, "yyyy-MM-dd") : ""}
        </Badge>
      </div>
    </div>
  )
}

function StudentInfoSection() {
  return (
    <div>
      <div className="inline-block mb-2">
        <h4 className="event-editor-title">
          <User className="h-6 w-6" /> 學生：
        </h4>
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
        </CardContent>
      </Card>
    </div>
  )
}

function CourseCategorySection({onCourseSelectId}:{onCourseSelectId:(id:number|null)=>void}) {
  // 課程分類
  const { courses, courseCategories, addCourseCategory, addCourse } = useCourseStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number|null>(courseCategories[0].id);

  const [currentCourses, setCurrentCourses] = useState<Course[]|undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<number|null>(null);

  const handleCategorySelect = (item:CourseCategory) => {
    if (item.id == selectedCategoryId) return;

    setSelectedCategoryId(item.id);
  }

  useEffect(() => {
    setCurrentCourses(courses.filter((item) => item.categoryId === selectedCategoryId));
  }, [selectedCategoryId]);

  const handleCourseSelect = (item:Course) => {
    if (item.id == selectedCourseId) return;
    setSelectedCourseId(item.id);
    onCourseSelectId(item.id);
  }

  return (
    <div className="space-y-4">
      <div>
      <div className="inline-block mb-2">
        <h4 className="event-editor-title">
          <Swatches className="h-6 w-6" /> 課程分類：
        </h4>
      </div>
      <CourseCategoryList 
        courseCategories={courseCategories} 
        selectedCategoryId={selectedCategoryId} 
        onCategorySelect={handleCategorySelect} 
      />
      </div>

      <div>
        <div className="inline-block mb-2">
          <h4 className="event-editor-title">
            <Swatches className="h-6 w-6" /> 課程名稱：
          </h4>
        </div>
        <CourseList 
          courseItems={currentCourses?.length == 0 ? [{id:null, name:"先選擇課程類別"}] : currentCourses}
          selectedCourseId={selectedCourseId}
          onCourseSelect={handleCourseSelect}
        />
      </div>
    </div>
  )
}
