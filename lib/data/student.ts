"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { createAuthClient } from "@/utils/supabase/client";
import { getSession, signIn } from "next-auth/react";

// 學生類型
interface Student {
    id: string;
    name: string;
    active: boolean;
    ig?: string; // 新增 Instagram 帳號欄位，可選
}

// 學生狀態管理
interface StudentState {
    students: Student[];
    isInitialized: boolean;
    fetchStudents: () => Promise<void>; // 新增：從 Supabase 獲取學生
    addStudent: (name: string, ig?: string) => Promise<void>;
    updateStudent: (id: string, data: { name?: string; ig?: string }) => Promise<void>;
    toggleStudentStatus: (id: string) => Promise<void>;
}

// 初始學生數據
const initialStudents: Student[] = [
    { id: "1", name: "王小明", active: true, ig: "@wang_xiaoming" },
    { id: "2", name: "李小花", active: true, ig: "@li_flower" },
    { id: "3", name: "張大山", active: true, ig: "@zhang_mountain" },
    { id: "4", name: "陳小雨", active: false, ig: "@chen_rain" },
    { id: "5", name: "林小樹", active: true, ig: "@lin_tree" },
    // 添加更多學生以展示搜尋功能的效果
    { id: "6", name: "黃大偉", active: true, ig: "@huang_david" },
    { id: "7", name: "周小琳", active: true, ig: "@zhou_lin" },
    { id: "8", name: "吳美玲", active: true, ig: "@wu_beauty" },
    { id: "9", name: "劉志明", active: true, ig: "@liu_zhiming" },
    { id: "10", name: "鄭雅文", active: true, ig: "@zheng_yawen" },
    { id: "11", name: "林志玲", active: true },
    { id: "12", name: "張學友", active: true, ig: "@jacky_cheung" },
    { id: "13", name: "王力宏", active: true, ig: "@wangleehom" },
    { id: "14", name: "蔡依林", active: true, ig: "@jolin_tsai" },
    { id: "15", name: "周杰倫", active: true, ig: "@jaychou" }
];

// 本地儲存的鍵名
const LOCAL_STORAGE_KEY = "students";

// 從 localStorage 讀取資料
const loadStudentsFromLocalStorage = (): Student[] => {
    if (typeof window === "undefined") return []; // 避免伺服器端執行
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

// 將資料儲存到 localStorage
const saveStudentsToLocalStorage = (students: Student[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
};

// 獲取 Supabase JWT（已登入時使用）
const getSupabaseJWT = async () => {
    const session = await getSession();
    if (session?.error === "RefreshAccessTokenError") {
        signIn("google");
    }

    if (!session || !session.supabaseJWT) throw new Error("No valid Supabase JWT found");
    return session.supabaseJWT as string;
};

// 檢查用戶是否登入
const isLoggedIn = async () => {
    const session = await getSession();
    return !!session && !!session.supabaseJWT;
};

// 創建學生狀態管理
export const useStudentStore = create<StudentState>((set, get) => ({
    students: [], // 初始狀態為空，後續根據模式載入
    isInitialized: false,
    fetchStudents: async () => {
        if (get().isInitialized) {
            return;
        }
        
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            // 已登入：從 Supabase 獲取資料
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const { data, error } = await supabase.from("student").select("*").order("name", { ascending: false });
                if (error) {
                    console.error("Error fetching students from Supabase:", error);
                } else {
                    set({ students: data || [], isInitialized: true });
                }
            } catch (e) {
                console.error("Failed to fetch students from Supabase:", e);
            }
        } else {
            // 未登入：從 localStorage 獲取資料
            const localStudents = loadStudentsFromLocalStorage();
            set({ students: localStudents, isInitialized: true });
        }
    },

    addStudent: async (name, ig) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            // 已登入：插入到 Supabase
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const session = await getSession();
                const teacherId = session?.supabaseId as string;
                const newStudent = {
                    name,
                    active: true,
                    ig,
                    teacher_id: teacherId
                };
                
                const { data, error } = await supabase
                    .from("student")
                    .insert(newStudent)
                    .select()
                    .single();

                if (error) {
                    console.error("Error adding student to Supabase:", error);
                } else if (data) {
                    set((state) => ({
                        students: [...state.students, data]
                    }));
                }
            } catch (e) {
                console.error("Failed to add student to Supabase:", e);
            }
        } else {
            // 未登入：添加到 localStorage
            const newStudent: Student = {
                id: uuidv4(), // 本地模式仍需生成唯一 ID
                name,
                active: true,
                ig
            };
            set((state) => {
                const updatedStudents = [...state.students, newStudent];
                saveStudentsToLocalStorage(updatedStudents);
                return { students: updatedStudents };
            });
        }
    },

    updateStudent: async (id, data) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const { error } = await supabase.from("student").update(data).eq("id", id);
                if (error) {
                    console.error("Error updating student in Supabase:", error);
                } else {
                    set((state) => ({
                        students: state.students.map((student) =>
                            student.id === id ? { ...student, ...data } : student
                        )
                    }));
                }
            } catch (e) {
                console.error("Failed to update student in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedStudents = state.students.map((student) =>
                    student.id === id ? { ...student, ...data } : student
                );
                saveStudentsToLocalStorage(updatedStudents);
                return { students: updatedStudents };
            });
        }
    },

    toggleStudentStatus: async (id) => {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
            try {
                const token = await getSupabaseJWT();
                const supabase = createAuthClient(token);
                const currentStudent = get().students.find((s) => s.id === id);
                const newStatus = !currentStudent?.active;
                const { error } = await supabase
                    .from("student")
                    .update({ active: newStatus })
                    .eq("id", id);
                if (error) {
                    console.error("Error toggling student status in Supabase:", error);
                } else {
                    set((state) => ({
                        students: state.students.map((student) =>
                            student.id === id ? { ...student, active: newStatus } : student
                        )
                    }));
                }
            } catch (e) {
                console.error("Failed to toggle student status in Supabase:", e);
            }
        } else {
            set((state) => {
                const updatedStudents = state.students.map((student) =>
                    student.id === id ? { ...student, active: !student.active } : student
                );
                saveStudentsToLocalStorage(updatedStudents);
                return { students: updatedStudents };
            });
        }
    }
}));

