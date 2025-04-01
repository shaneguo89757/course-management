"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "next-auth/react";
import { createAuthClient } from "@/utils/supabase/client";

// 課程類型（本地模式保持不變，Supabase 模式從關聯表獲取 students）
interface Course {
    id: string;
    date: string;
    name: string;
    students: string[]; // 在 Supabase 模式中，從 course_student_rel 動態獲取
}

// 課程狀態管理
interface CourseState {
    courses: Course[];
    simplifiedAddMode: boolean;
    toggleSimplifiedAddMode: () => void;
    addCourse: (date: string, name: string) => Promise<void>;
    closeCourse: (id: string) => Promise<void>;
    addStudentToCourse: (courseId: string, studentId: string) => Promise<void>;
    addMultipleStudentsToCourse: (courseId: string, studentIds: string[]) => Promise<void>;
    removeStudentFromCourse: (courseId: string, studentId: string) => Promise<void>;
    batchUpdateCourses: (datesToAdd: string[], datesToRemove: string[]) => Promise<void>;
    hasCourse: (date: string) => boolean;
    courseHasStudents: (date: string) => boolean;
    fetchCourses: () => Promise<void>; // 新增：從 Supabase 獲取課程
}

// 本地儲存鍵名
const LOCAL_STORAGE_COURSES_KEY = "courses";

// 本地儲存工具函數
const loadFromLocalStorage = (key: string): any[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

const saveToLocalStorage = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// 獲取 Supabase JWT
const getSupabaseJWT = async () => {
    const session = await getSession();
    if (!session || !session.supabaseJWT) throw new Error("No valid Supabase JWT found");
    return session.supabaseJWT as string;
};

// 檢查是否登入
const isLoggedIn = async () => {
    const session = await getSession();
    return !!session && !!session.supabaseJWT;
};

// 課程狀態管理
export const useCourseStore = create<CourseState>((set, get) => ({
    courses: [],
    simplifiedAddMode: true,
    toggleSimplifiedAddMode: () =>
        set((state) => ({ simplifiedAddMode: !state.simplifiedAddMode })),
    fetchCourses: async () => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                // 獲取課程及其學生關聯
                const { data: courses, error: courseError } = await supabase
                    .from("course")
                    .select("*");
                if (courseError) throw courseError;

                const { data: relations, error: relError } = await supabase
                    .from("course_student_rel")
                    .select("course_id, student_id");
                if (relError) throw relError;

                // 組合課程資料
                const courseMap = new Map<string, Course>();
                courses.forEach((course: any) => {
                    courseMap.set(course.id, {
                        id: course.id,
                        date: course.date,
                        name: course.name,
                        students: []
                    });
                });

                relations.forEach((rel: any) => {
                    const course = courseMap.get(rel.course_id);
                    if (course) {
                        course.students.push(rel.student_id);
                    }
                });

                set({ courses: Array.from(courseMap.values()) });
            } catch (e) {
                console.error("Failed to fetch courses from Supabase:", e);
            }
        } else {
            set({ courses: loadFromLocalStorage(LOCAL_STORAGE_COURSES_KEY) });
        }
    },
    addCourse: async (date, name = "基礎課程") => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const session = await getSession();
                const teacherId = session?.supabaseId as string;
                const newCourse = { date, name, teacher_id: teacherId };
                const { data, error } = await supabase
                    .from("course")
                    .insert(newCourse)
                    .select()
                    .single();
                if (error) throw error;
                set((state) => ({
                    courses: [...state.courses, { ...data, students: [] }]
                }));
            } catch (e) {
                console.error("Failed to add course to Supabase:", e);
            }
        } else {
            const newCourse: Course = { id: uuidv4(), date, name, students: [] };
            set((state) => {
                const updatedCourses = [...state.courses, newCourse];
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedCourses);
                return { courses: updatedCourses };
            });
        }
    },
    closeCourse: async (id) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const { error } = await supabase
                    .from("course")
                    .delete()
                    .eq("id", id);
                if (error) throw error;
                set((state) => ({
                    courses: state.courses.filter((c) => c.id !== id)
                }));
            } catch (e) {
                console.error("Failed to close course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedCourses = state.courses.filter((c) => c.id !== id);
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedCourses);
                return { courses: updatedCourses };
            });
        }
    },
    addStudentToCourse: async (courseId, studentId) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const { error } = await supabase
                    .from("course_student_rel")
                    .insert([{ course_id: courseId, student_id: studentId }]);
                if (error) throw error;
                set((state) => ({
                    courses: state.courses.map((c) =>
                        c.id === courseId ? { ...c, students: [...c.students, studentId] } : c
                    )
                }));
            } catch (e) {
                console.error("Failed to add student to course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedCourses = state.courses.map((c) =>
                    c.id === courseId ? { ...c, students: [...c.students, studentId] } : c
                );
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedCourses);
                return { courses: updatedCourses };
            });
        }
    },
    addMultipleStudentsToCourse: async (courseId, studentIds) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const relations = studentIds.map((studentId) => ({
                    course_id: courseId,
                    student_id: studentId
                }));
                const { error } = await supabase.from("course_student_rel").insert(relations);
                if (error) throw error;
                set((state) => ({
                    courses: state.courses.map((c) =>
                        c.id === courseId
                            ? { ...c, students: [...new Set([...c.students, ...studentIds])] }
                            : c
                    )
                }));
            } catch (e) {
                console.error("Failed to add multiple students to course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedCourses = state.courses.map((c) =>
                    c.id === courseId
                        ? { ...c, students: [...new Set([...c.students, ...studentIds])] }
                        : c
                );
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedCourses);
                return { courses: updatedCourses };
            });
        }
    },
    removeStudentFromCourse: async (courseId, studentId) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const { error } = await supabase
                    .from("course_student_rel")
                    .delete()
                    .eq("course_id", courseId)
                    .eq("student_id", studentId);
                if (error) throw error;
                set((state) => ({
                    courses: state.courses.map((c) =>
                        c.id === courseId
                            ? { ...c, students: c.students.filter((id) => id !== studentId) }
                            : c
                    )
                }));
            } catch (e) {
                console.error("Failed to remove student from course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedCourses = state.courses.map((c) =>
                    c.id === courseId
                        ? { ...c, students: c.students.filter((id) => id !== studentId) }
                        : c
                );
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedCourses);
                return { courses: updatedCourses };
            });
        }
    },
    batchUpdateCourses: async (datesToAdd, datesToRemove) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const session = await getSession();
                const teacherId = session?.supabaseId as string;

                // 添加課程
                const coursesToAdd = datesToAdd
                    .filter((date) => !get().courses.some((c) => c.date === date))
                    .map((date) => ({
                        date,
                        name: "基礎課程",
                        teacher_id: teacherId
                    }));
                if (coursesToAdd.length > 0) {
                    const { data: addedCourses, error: addError } = await supabase
                        .from("course")
                        .insert(coursesToAdd)
                        .select();
                    if (addError) throw addError;
                    set((state) => ({
                        courses: [
                            ...state.courses,
                            ...addedCourses.map((c: any) => ({ ...c, students: [] }))
                        ]
                    }));
                }

                // 移除課程（僅限無學生的課程）
                const coursesToRemove = get()
                    .courses.filter(
                        (c) => datesToRemove.includes(c.date) && c.students.length === 0
                    )
                    .map((c) => c.id);
                if (coursesToRemove.length > 0) {
                    const { error: removeError } = await supabase
                        .from("course")
                        .delete()
                        .in("id", coursesToRemove);
                    if (removeError) throw removeError;
                    set((state) => ({
                        courses: state.courses.filter((c) => !coursesToRemove.includes(c.id))
                    }));
                }
            } catch (e) {
                console.error("Failed to batch update courses in Supabase:", e);
            }
        } else {
            set((state) => {
                let updatedCourses = [...state.courses];
                datesToAdd.forEach((date) => {
                    if (!updatedCourses.some((c) => c.date === date)) {
                        updatedCourses.push({
                            id: uuidv4(),
                            date,
                            name: "基礎課程",
                            students: []
                        });
                    }
                });
                datesToRemove.forEach((date) => {
                    updatedCourses = updatedCourses.filter(
                        (c) => !(c.date === date && c.students.length === 0)
                    );
                });
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedCourses);
                return { courses: updatedCourses };
            });
        }
    },
    hasCourse: (date) => get().courses.some((c) => c.date === date),
    courseHasStudents: (date) => {
        const course = get().courses.find((c) => c.date === date);
        return course ? course.students.length > 0 : false;
    }
}));
