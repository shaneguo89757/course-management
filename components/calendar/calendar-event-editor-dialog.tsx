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
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoCreate } from "react-icons/io5";
import { CalendarEvent } from "./type";

export default function CalendarEventEditorDialog({ defaultDate, onSubmit }: { defaultDate?: Date, onSubmit:(event:CalendarEvent)=>Promise<void> }) {
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
        <Button variant="outline" className="h-8"> 安排學員</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">安排學員</DialogTitle>
        </DialogHeader>
        
        {/* Body */}
        <div className="grid gap-4 py-4">
          <EventDateSection selectedDate={selectedDate} />
          <StudentInfoSection onStudentSelectId={setSelectedStudentId} />
          <CourseCategorySection onCourseSelectId={setSelectedCourseId} />
        </div>
        
        {/* Footer */}
        <DialogFooter className="flex justify-end gap-2">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>取消</Button>
            <Button type="submit" disabled={disableToSave} onClick={handleConfirm} loading={isSaving}>確認</Button>
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
          <IoCalendarNumberOutline className="h-6 w-6" /> 日期：
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

interface Student {
  id: number;
  name: string;
}

const STUDENTS: Student[] = [
  { id: 10, name: "張三1" },
  { id: 11, name: "李四1" },
  { id: 12, name: "王五1" },
  { id: 13, name: "張三1" },
  { id: 14, name: "李四1" },
  { id: 15, name: "王五1" },
  { id: 16, name: "張三1" },
  { id: 17, name: "李四1" },
  { id: 18, name: "王五1" },
  { id: 19, name: "張三1" },
  { id: 20, name: "李四1" },
  { id: 21, name: "王五1" }
];

function StudentInfoSection({onStudentSelectId}:{onStudentSelectId:(id:number|null)=>void}) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);

  // Update search results when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = STUDENTS.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery]);

  const handlePickSearchResult = (student:Student) => {
    setSelectedStudent(student);
    setIsSwitching(false);
    onStudentSelectId(student.id);
    setSearchQuery("");
    setSearchResults([]);
  }

  const showSelectedStudent = selectedStudent != null && !isSwitching;
  const openSearchView = isSwitching || !selectedStudent;

  return (
    <div>
      <div className="inline-block mb-2">
        <h4 className="event-editor-title">
          <User className="h-6 w-6" />學生：
        </h4>
      </div>
      {showSelectedStudent && <StudentInfoContent selectedStudent={selectedStudent} onSwitch={()=>setIsSwitching(true)} />}
      {openSearchView && <StudentSearchContent searchResults={searchResults} onSearch={setSearchQuery} onPick={handlePickSearchResult} />}
    </div>
  )
}

function StudentInfoContent({selectedStudent, onSwitch}:{selectedStudent:Student, onSwitch:()=>void}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium border-gray-600 border rounded-md px-2 py-1">{selectedStudent.name}</span>
        <Button
          variant="default"
          size="sm"
          onClick={onSwitch}
        >
          替換
        </Button>
      </div>
    </div>
  )
}
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
function StudentSearchContent({searchResults, onSearch, onPick}:{searchResults:Student[], onSearch:(query:string)=>void, onPick:(student:Student)=>void}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query:string) => {
    if (query.trim() === "") {
      return; 
    }
    setSearchQuery(query);
    onSearch(query);
  }

  const hasInput = searchQuery.trim() !== ""; 

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋學生姓名"
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
        { hasInput && <p className="absolute right-2 top-2.5 text-sm text-muted-foreground">搜尋結果：{searchResults.length}</p>}
      </div>
      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md">
          {searchResults.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => onPick(student)}
            >
              <span>{student.name}</span>
            </div>
          ))}
        </div>
      )}
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
            <Swatches /> 課程名稱：
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
