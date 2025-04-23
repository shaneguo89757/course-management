"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Swatches } from "@mynaui/icons-react"

import { cn } from "@/lib/utils"
import { Course, CourseCategory, courseCategoriesFake, courseItemsFake, useCourseStore } from "./type";

import CreateCourseDialog from "./course-create-dialog";
import CreateCourseCategoryDialog from "./course-category-create-dialog";

function BadgeItem({item, selectedItemId, onItemSelect}:{item:any, selectedItemId:number|null, onItemSelect:any}) {
  return (
    <Badge
      className="h-6 cursor-pointer font-normal border-gray-900 transition-all duration-200 active:scale-95"
      variant={item.id === null || item.id === -1 || selectedItemId != item.id ? 'outline' : 'default'}
      onClick={() => onItemSelect(item)}
    >
      {item.name}
    </Badge>
  )
}

export function CourseCategoryList({courseCategories, selectedCategoryId, onCategorySelect}:{courseCategories:any[], selectedCategoryId:number|null, onCategorySelect:any}) {
  return (
    <div className="course-category-list flex flex-wrap gap-2">
      {courseCategories.map((item, i) => (
        <BadgeItem key={i} item={item} selectedItemId={selectedCategoryId} onItemSelect={onCategorySelect} />
      ))}
    </div>
  )
}

export function CourseList({courseItems, selectedCourseId, onCourseSelect}:{courseItems:any[]|undefined, selectedCourseId:number|null, onCourseSelect:any}) {
  return (
      <div className="course-list-item-list flex flex-wrap gap-2">
        {courseItems && courseItems.map((item, i) => (
          <BadgeItem key={i} item={item} selectedItemId={selectedCourseId} onItemSelect={onCourseSelect} />
        ))}
      </div>
  )
}

export default function ManageCourseView() {
  // 資源.
  const { courses, courseCategories, addCourseCategory, addCourse } = useCourseStore();

  // 課程分類
  const [selectedCategoryId, setSelectedCategoryId] = useState<number|null>(0);

  // 新增課程分類對話框
  const [isCreateCourseCategoryDialogOpen, setIsCreateCourseCategoryDialogOpen] = useState<boolean>(false);

  // 課程
  const [currentCourses, setCurrentCourses] = useState<Course[]|undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<number|null>(null);

  // 新增課程對話框
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState<boolean>(false);

  /** item.id -1 代表新增課程分類, 0 代表全部分類, 其他代表選擇課程分類 */
  const handleCategorySelect = (item:CourseCategory) => {
    // -1: 新增課程分類
    if (item.id == -1) {
      setIsCreateCourseCategoryDialogOpen(true);
      return;
    }

    if (item.id == selectedCategoryId) {
      return;
    }
    
    setSelectedCategoryId(item.id);
    setSelectedCourseId(null);
  }

  /** item.id -1 代表新增課程, 其他代表選擇課程 */
  const handleCourseSelect = (item:Course) => {
    // -1: 新增課程
    if (selectedCategoryId != 0 && item.id == -1) {
      setIsCreateCourseDialogOpen(true);
      return;
    }

    setSelectedCourseId(item.id);
  }

  useEffect(() => {
    if (selectedCategoryId === null) {
      setCurrentCourses(undefined);
    } else if (selectedCategoryId === 0) {
      setCurrentCourses(courses);
    } else {
      setCurrentCourses(courses.filter((item) => item.categoryId === selectedCategoryId));
    }
  }, [selectedCategoryId, courses]);

  const handleCourseCreated = async (course:Course): Promise<boolean> => {
    await addCourse(course);
    return true;
  }

  const handleCourseCategoryCreated = async (courseCategory:CourseCategory): Promise<boolean> => {
    await addCourseCategory(courseCategory);
    return true;
  }

  return (
    <div className="ManageCourseView">
      <div>
      <Card>  
        <CardHeader className="pb-3">
          <CardTitle>
            <div className="inline-block">
              <h4 className="text-[#98A2B3] text-base border-b border-[#EAECF0] pb-1 flex items-center gap-2">
                <Swatches className="h-6 w-6" /> 課程分類
              </h4>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          <CourseCategoryList 
            courseCategories={[{id:-1, name:"+Add"}, {id:0, name:"All"}, ...courseCategories]} 
            selectedCategoryId={selectedCategoryId} 
            onCategorySelect={handleCategorySelect} 
          />
        </CardContent>
        <div className="p-2" />
        <CardHeader className="text-lg pb-3 pt-2">
          <CardTitle>
            <div className="inline-block">
              <h4 className="text-[#98A2B3] text-base border-b border-[#EAECF0] pb-1 flex items-center gap-2">
                <Swatches className="h-6 w-6" /> 課程名稱
              </h4>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CourseList 
            courseItems={currentCourses === undefined ? [{id:null, name:"先選擇課程類別"}] : [ {id:-1, name:"+ Add"}, ...currentCourses]}
            selectedCourseId={selectedCourseId}
            onCourseSelect={handleCourseSelect}
          />
        </CardContent>
      </Card>
      </div>

      <CreateCourseDialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen} selectedCategoryId={selectedCategoryId!} onCreated={handleCourseCreated} />
      <CreateCourseCategoryDialog open={isCreateCourseCategoryDialogOpen} onOpenChange={setIsCreateCourseCategoryDialogOpen} onCreated={handleCourseCategoryCreated} />
    </div>
  )
}