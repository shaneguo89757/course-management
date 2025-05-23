"use client";

import { useState, useEffect } from "react"; // 添加 useEffect
import { PlusCircle } from "lucide-react";

import { AddStudentDialog } from "@/components/add-student-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EditStudentDialog } from "@/components/edit-student-dialog";
import { useStudents } from "@/lib/data/index";
import { Button } from "@/components/ui/button";
import { type Student, useStudentColumns } from "@/components/students/columns";
import { DataTable } from "@/components/students/data-table";

export default function StudentsPage() {
  const { students, toggleStudentStatus, fetchStudents } = useStudents(); // 添加 fetchStudents
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{
    id: string;
    name: string;
    ig?: string;
  } | null>(null);

  const columns = useStudentColumns();

  // 在頁面載入時獲取學生資料
  useEffect(() => {
    fetchStudents();
  }, []);

  // 處理編輯學員
  const handleEditStudent = (student: Student) => {
    setEditingStudent({
      id: student.id,
      name: student.name,
      ig: student.ig,
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="學員管理" description="新增與管理學員資料，透過狀態改變學員 '顯示/隱藏'" />
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新增學員
        </Button>
      </div>
      <DataTable columns={columns} data={students} onEdit={handleEditStudent} onToggleStatus={toggleStudentStatus} />

      <AddStudentDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => {
            if (!open) setEditingStudent(null);
          }}
        />
      )}
    </DashboardShell>
  );
}