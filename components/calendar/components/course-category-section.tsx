import { Swatches } from "@mynaui/icons-react";
import { Course, CourseCategory, useCourseStore } from "@/components/course/type";
import { useEffect, useState } from "react";
import { CourseCategoryList, CourseList } from "@/components/course/manage-course-view";

export default function CourseCategorySection({
  onCourseSelectId,
  initialCourseId,
  editable = true
}: {
  onCourseSelectId: (id: number | null) => void;
  initialCourseId?: number | null;
  editable?: boolean;
}) {
  // 課程分類
  const { courses, courseCategories } = useCourseStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialCourseId 
      ? courses.find(course => course.id === initialCourseId)?.categoryId ?? courseCategories[0].id
      : courseCategories[0].id
  );

  const [currentCourses, setCurrentCourses] = useState<Course[] | undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(initialCourseId ?? null);

  const handleCategorySelect = (item: CourseCategory) => {
    if (item.id == selectedCategoryId) return;

    setSelectedCategoryId(item.id);
    setSelectedCourseId(null);
    onCourseSelectId(null);
  };

  useEffect(() => {
    setCurrentCourses(courses.filter((item) => item.categoryId === selectedCategoryId));
  }, [selectedCategoryId, courses]);

  const handleCourseSelect = (item: Course) => {
    if (item.id == selectedCourseId) return;
    setSelectedCourseId(item.id);
    onCourseSelectId(item.id);
  };

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
          editable={editable}
        />
      </div>

      <div>
        <div className="inline-block mb-2">
          <h4 className="event-editor-title">
            <Swatches /> 課程名稱：
          </h4>
        </div>
        <CourseList
          courseItems={
            currentCourses?.length == 0 ? [{ id: null, name: "先選擇課程類別" }] : currentCourses
          }
          selectedCourseId={selectedCourseId}
          onCourseSelect={handleCourseSelect}
          editable={editable}
        />
      </div>
    </div>
  );
}
