"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Swatches } from "@mynaui/icons-react"

import { cn } from "@/lib/utils"
import { Course, CourseCategory, courseCategoriesFake, courseItemsFake, useCourseStore } from "./type";

import CreateCourseDialog from "./course-create-dialog";
import CreateCourseCategoryDialog from "./course-category-create-dialog";

function SelectItem({item, selectedItemId, onItemSelect, active = true}:{item:any, selectedItemId:number|null, onItemSelect:any, active?:boolean}) {

  return (
    <Badge
      className={cn("cursor-pointer font-normal transition-all duration-200 active:scale-95", active ? undefined : 'bg-gray-200')}
      variant={item.id === null || item.id === -1 || selectedItemId != item.id ? 'outline' : 'default'}
      onClick={() => onItemSelect(item)}
    >
      {item.name}
    </Badge>
  )
}

function CourseCategoryList({courseCategories, selectedCategoryId, onCategorySelect}:{courseCategories:any[], selectedCategoryId:number|null, onCategorySelect:any}) {
  return (
    <div className="course-category">
    <div className="course-category-list flex flex-wrap gap-2">
      <SelectItem item={{id:-1, name:"+ Add"}} selectedItemId={selectedCategoryId} onItemSelect={onCategorySelect} />
      <SelectItem item={{id:0, name:"All"}} selectedItemId={selectedCategoryId} onItemSelect={onCategorySelect} />
      {courseCategories.map((item, i) => (
        <SelectItem key={i} item={item} selectedItemId={selectedCategoryId} onItemSelect={onCategorySelect} />
      ))}
    </div>
    </div>
  )
}

function CourseList({courseItems, selectedCourseId, onCourseSelect}:{courseItems:any[]|undefined, selectedCourseId:number|null, onCourseSelect:any}) {
  return (
    <>
    <div className="course-list">
      <div className="course-list-item-list flex flex-wrap gap-2">
        {courseItems === undefined && (
          <SelectItem item={{id:null, name:"先選擇課程類別"}} selectedItemId={null} onItemSelect={onCourseSelect} />
        )}
        
        {courseItems && (
          <SelectItem item={{id:-1, name:"+ Add"}} selectedItemId={selectedCourseId} onItemSelect={onCourseSelect} />
        )}
        
        {courseItems && courseItems.map((item, i) => (
          <SelectItem key={i} item={item} selectedItemId={selectedCourseId} onItemSelect={onCourseSelect} />
        ))}
      </div>
    </div>
    </>
  )
}

export default function ManageCourseView() {
  // 課程分類
  const { courses,courseCategories, addCourseCategory, addCourse } = useCourseStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number|null>(0);

  // 新增課程分類對話框
  const [isCreateCourseCategoryDialogOpen, setIsCreateCourseCategoryDialogOpen] = useState<boolean>(false);

  // 課程
  const [currentCourses, setCurrentCourses] = useState<Course[]|undefined>(undefined);
  const [selecteCourseId, setSelectedCourseId] = useState<number|null>(null);

  // 新增課程對話框
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState<boolean>(false);

  /** item.id -1 代表新增課程分類, 0 代表全部分類, 其他代表選擇課程分類 */
  const handleCategorySelect = (item:CourseCategory) => {
    // -1: 新增課程分類
    if (item.id == -1) {
      setIsCreateCourseCategoryDialogOpen(true);
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
                <Swatches className="h-6 w-6" />
                Course Categories & Items
              </h4>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          <CourseCategoryList courseCategories={courseCategories} selectedCategoryId={selectedCategoryId} onCategorySelect={handleCategorySelect} />
        </CardContent>

        <CardHeader className="text-lg pb-3 pt-2">
          <CardTitle className="text-[#98A2B3] text-base border-b pb-1 flex items-center gap-2">
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CourseList courseItems={currentCourses} selectedCourseId={selecteCourseId} onCourseSelect={handleCourseSelect} />
        </CardContent>
      </Card>
      </div>

      <CreateCourseDialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen} selectedCategoryId={selectedCategoryId!} onCreated={handleCourseCreated} />
      <CreateCourseCategoryDialog open={isCreateCourseCategoryDialogOpen} onOpenChange={setIsCreateCourseCategoryDialogOpen} onCreated={handleCourseCategoryCreated} />
    </div>
  )
}