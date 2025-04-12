import { useCourseStore } from "./course";
import { useStudentStore } from "./student";

export const useStudents = () => {
    return useStudentStore();
};

export const useCourses = () => {
    return useCourseStore();
};