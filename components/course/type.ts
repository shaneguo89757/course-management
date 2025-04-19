import { create } from "zustand";

export interface Course {
    id: number;
    name: string;
    categoryId: number;
    }
  
export interface CourseCategory {
    id: number;
    name: string;
}

interface CourseState {
    courses: Course[];
    courseCategories: CourseCategory[];
    addCourse: (course: Course) => Promise<void>;
    addCourseCategory: (courseCategory: CourseCategory) => Promise<void>;
}

  
export const courseCategoriesFake = [{id:1, name:"證照"}, {id:2, name:"風格培訓"}];
export const courseItemsFake = [{id:1, name:"高級", categoryId:1}, {id:2, name:"中級", categoryId:1}, {id:3, name:"初級", categoryId:1}, {id:4, name:"花籃", categoryId:2}, {id:5, name:"捧花", categoryId:2}];

export const useCourseStore = create<CourseState>((set, get) => ({
    courses: courseItemsFake,
    courseCategories: courseCategoriesFake,
    addCourse: async (course: Course) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
       set((state) => ({ courses: [...state.courses, course] }));
    },
    addCourseCategory: async (courseCategory: CourseCategory) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        set((state) => ({ courseCategories: [...state.courseCategories, courseCategory] }));
    },
}));