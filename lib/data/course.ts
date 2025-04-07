"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { getSession, signIn } from "next-auth/react";
import { createAuthClient } from "@/utils/supabase/client";

interface Course {
    id: string;
    date: number; // YYYYMMDD
    name: string;
    students: string[];
}

// 按年月組織的課程數據
interface CourseMonth {
    yearMonth: string; // e.g., "202504"
    courses: Course[];
    lastFetched?: number; // 可選：記錄最後獲取時間，用於緩存檢查
}

interface CourseState {
    courseMonths: CourseMonth[]; // 改為按年月存儲
    simplifiedAddMode: boolean;
    toggleSimplifiedAddMode: () => void;
    addCourse: (yyyyMMdd: number, name: string) => Promise<void>;
    closeCourse: (id: string) => Promise<void>;
    addStudentToCourse: (courseId: string, studentId: string) => Promise<void>;
    addMultipleStudentsToCourse: (courseId: string, studentIds: string[]) => Promise<void>;
    removeStudentFromCourse: (courseId: string, studentId: string) => Promise<void>;
    hasCourse: (yyyyMMdd: number) => boolean;
    courseHasStudents: (yyyyMMdd: number) => boolean;
    fetchCourses: (yyyyMM: string[]) => Promise<void>; // 修改為按年月獲取
    getCoursesForMonth: (yyyyMM: string) => Course[]; // 新增：獲取某年月的課程
    findCourseById: (id: string) => Course | undefined;
}

function getYearMonth(yyyyMMdd: number):string {
    return yyyyMMdd.toString().slice(0, 6);
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
    if (session?.error === "RefreshAccessTokenError") {
        signIn("google");
    }

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
    courseMonths: [],
    simplifiedAddMode: true,
    toggleSimplifiedAddMode: () =>
        set((state) => ({ simplifiedAddMode: !state.simplifiedAddMode })),
    fetchCourses: async (yearMonths: string[]) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);

                const expriedTime = Date.now() - 1000 * 60 * 60;
                
                // 找出需要獲取數據的年月
                const yearMonthsToFetch: string[] = [];
                let yearMonthsIndex = 0;
                console.log('yearMonths', yearMonths);
                // 遍歷 courseMonths 並檢查每個 yearMonth
                for (const cm of get().courseMonths) {
                    // 如果 yearMonths 已經遍歷完畢，跳出迴圈
                    if (yearMonthsIndex >= yearMonths.length) break;
                    
                    // 如果當前的 yearMonth 小於 courseMonth 的 yearMonth，推進索引
                    while (yearMonthsIndex < yearMonths.length && yearMonths[yearMonthsIndex] < cm.yearMonth) {
                        yearMonthsToFetch.push(yearMonths[yearMonthsIndex]);
                        yearMonthsIndex++;
                    }
                    
                    // 如果找到匹配的 yearMonth
                    if (yearMonthsIndex < yearMonths.length && yearMonths[yearMonthsIndex] === cm.yearMonth) {
                        // 檢查是否需要重新獲取
                        if (!cm.lastFetched || (expriedTime > cm.lastFetched)) {
                            yearMonthsToFetch.push(yearMonths[yearMonthsIndex]);
                        }
                        yearMonthsIndex++;
                    }
                }
                
                // 處理剩餘的 yearMonths
                while (yearMonthsIndex < yearMonths.length) {
                    yearMonthsToFetch.push(yearMonths[yearMonthsIndex]);
                    yearMonthsIndex++;
                }
                
                // 如果沒有需要獲取的年月，則直接返回
                if (yearMonthsToFetch.length === 0) {
                    return;
                }
                
                // 以下只對需要獲取的年月進行處理

                // 構建查詢條件
                let query = supabase
                    .from("course")
                    .select("*")
                    .order("date");
                
                if (yearMonthsToFetch.length === 1) {
                    // 如果只有一個年月，使用範圍查詢
                    const ym = yearMonthsToFetch[0];
                    const startDate = parseInt(ym + "00"); // 月初，例如 20250400
                    const endDate = parseInt(ym + "99");   // 月末，例如 20250499
                    query = query.gt("date", startDate).lt("date", endDate);
                } else if (yearMonthsToFetch.length > 1) {
                    // 如果有多個年月，使用 OR 條件
                    yearMonthsToFetch.sort((a, b) => a.localeCompare(b));
                    const startDate = parseInt(yearMonthsToFetch[0] + "00");
                    const endDate = parseInt(yearMonthsToFetch[yearMonthsToFetch.length - 1] + "99");
                    query = query.gt("date", startDate).lt("date", endDate);
                }
                
                // 執行查詢
                const { data: courses, error: courseError } = await query;
                
                console.log(courses);
                if (courseError) {
                    console.error("Failed to fetch courses from Supabase:", courseError);
                    throw courseError;
                }

                const courseIds = courses.map((c: any) => c.id);
                const { data: relations, error: relError } = await supabase
                    .from("course_student_rel")
                    .select("course_id, student_id")
                    .in("course_id", courseIds);
                if (relError) throw relError;

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
                    if (course) course.students.push(rel.student_id);
                });

                const newCourseMonths = yearMonthsToFetch.map((yearMonth) => ({
                    yearMonth,
                    courses: Array.from(courseMap.values()).filter((c) =>
                        c.date.toString().startsWith(yearMonth) // 可以優化檢索.
                    ),
                    lastFetched: Date.now()
                }));

                set((state) => {
                    const updatedCourseMonths =  [
                        ...state.courseMonths.filter((cm) => !yearMonthsToFetch.includes(cm.yearMonth)),
                        ...newCourseMonths
                    ];
                    updatedCourseMonths.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
                    return { courseMonths: updatedCourseMonths };
                });
            } catch (e) {
                console.error("Failed to fetch courses from Supabase:", e);
            }
        } else {
            const stored = loadFromLocalStorage(LOCAL_STORAGE_COURSES_KEY);
            const filtered = stored.filter((cm) => yearMonths.includes(cm.yearMonth));
            set((state) => ({
                courseMonths: [
                    ...state.courseMonths.filter((cm) => !yearMonths.includes(cm.yearMonth)),
                    ...filtered
                ]
            }));
        }
    },
    getCoursesForMonth: (yyyyMM: string) => {
        const monthData = get().courseMonths.find((cm) => cm.yearMonth === yyyyMM);
        return monthData ? monthData.courses : [];
    },
    addCourse: async (yyyyMMdd: number, name = "基礎課程") => {
        const yearMonth = getYearMonth(yyyyMMdd); // e.g., "202504"
        console.log('yearMonth', yearMonth);
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            // Supabase 邏輯保持不變
            const token = await getSupabaseJWT();
            const supabase = createAuthClient(token);
            const session = await getSession();
            const teacherId = session?.supabaseId as string;
            const newCourse = { date: yyyyMMdd, name, teacher_id: teacherId };
            const { data, error } = await supabase
                .from("course")
                .insert(newCourse)
                .select()
                .single();
            if (error) throw error;

            set((state) => {
                const monthIndex = state.courseMonths.findIndex((cm) => cm.yearMonth === yearMonth);
                const newCourseData = { ...data, students: [] };
                if (monthIndex === -1) {
                    return {
                        courseMonths: [
                            ...state.courseMonths,
                            { yearMonth, courses: [newCourseData] }
                        ]
                    };
                }
                const updatedMonths = [...state.courseMonths];
                updatedMonths[monthIndex].courses.push(newCourseData);
                return { courseMonths: updatedMonths };
            });
        } else {
            const newCourse: Course = { id: uuidv4(), date: yyyyMMdd, name, students: [] };
            set((state) => {
                const monthIndex = state.courseMonths.findIndex((cm) => cm.yearMonth === yearMonth);
                if (monthIndex === -1) {
                    const updated = [...state.courseMonths, { yearMonth, courses: [newCourse] }];
                    saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updated);
                    return { courseMonths: updated };
                }
                const updatedMonths = [...state.courseMonths];
                updatedMonths[monthIndex].courses.push(newCourse);
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedMonths);
                return { courseMonths: updatedMonths };
            });
        }
    },
    closeCourse: async (id) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const { error } = await supabase.from("course").delete().eq("id", id);
                if (error) throw error;

                set((state) => {
                    const updatedMonths = state.courseMonths.map((cm) => ({
                        ...cm,
                        courses: cm.courses.filter((c) => c.id !== id)
                    }));
                    return { courseMonths: updatedMonths.filter((cm) => cm.courses.length > 0) }; // 移除空的 yearMonth
                });
            } catch (e) {
                console.error("Failed to close course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedMonths = state.courseMonths.map((cm) => ({
                    ...cm,
                    courses: cm.courses.filter((c) => c.id !== id)
                }));
                const newState = {
                    courseMonths: updatedMonths.filter((cm) => cm.courses.length > 0)
                };
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, newState.courseMonths);
                return newState;
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

                set((state) => {
                    const updatedMonths = state.courseMonths.map((cm) => ({
                        ...cm,
                        courses: cm.courses.map((c) =>
                            c.id === courseId ? { ...c, students: [...c.students, studentId] } : c
                        )
                    }));
                    return { courseMonths: updatedMonths };
                });
            } catch (e) {
                console.error("Failed to add student to course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedMonths = state.courseMonths.map((cm) => ({
                    ...cm,
                    courses: cm.courses.map((c) =>
                        c.id === courseId ? { ...c, students: [...c.students, studentId] } : c
                    )
                }));
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedMonths);
                return { courseMonths: updatedMonths };
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

                set((state) => {
                    const updatedMonths = state.courseMonths.map((cm) => ({
                        ...cm,
                        courses: cm.courses.map((c) =>
                            c.id === courseId
                                ? { ...c, students: [...new Set([...c.students, ...studentIds])] }
                                : c
                        )
                    }));
                    return { courseMonths: updatedMonths };
                });
            } catch (e) {
                console.error("Failed to add multiple students to course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedMonths = state.courseMonths.map((cm) => ({
                    ...cm,
                    courses: cm.courses.map((c) =>
                        c.id === courseId
                            ? { ...c, students: [...new Set([...c.students, ...studentIds])] }
                            : c
                    )
                }));
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedMonths);
                return { courseMonths: updatedMonths };
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

                set((state) => {
                    const updatedMonths = state.courseMonths.map((cm) => ({
                        ...cm,
                        courses: cm.courses.map((c) =>
                            c.id === courseId
                                ? { ...c, students: c.students.filter((id) => id !== studentId) }
                                : c
                        )
                    }));
                    return { courseMonths: updatedMonths };
                });
            } catch (e) {
                console.error("Failed to remove student from course in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedMonths = state.courseMonths.map((cm) => ({
                    ...cm,
                    courses: cm.courses.map((c) =>
                        c.id === courseId
                            ? { ...c, students: c.students.filter((id) => id !== studentId) }
                            : c
                    )
                }));
                saveToLocalStorage(LOCAL_STORAGE_COURSES_KEY, updatedMonths);
                return { courseMonths: updatedMonths };
            });
        }
    },
    hasCourse: (yyyyMMdd: number) => {
        const yearMonth = getYearMonth(yyyyMMdd);
        const monthCourses = get().getCoursesForMonth(yearMonth);
        return monthCourses.some((c) => c.date === yyyyMMdd);
    },
    courseHasStudents: (yyyyMMdd: number) => { // TODO: 應該以 course.id 來檢查
        const yearMonth = getYearMonth(yyyyMMdd);
        const monthCourses = get().getCoursesForMonth(yearMonth);
        const course = monthCourses.find((c) => c.date === yyyyMMdd);
        return course ? course.students.length > 0 : false;
    },
    findCourseById: (id: string) => {
        const course = get().courseMonths.flatMap((cm) => cm.courses).find((c) => c.id === id);
        return course;
    }
}));
