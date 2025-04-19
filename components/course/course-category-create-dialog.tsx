"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Swatches } from "@mynaui/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { CourseCategory } from "./type";

export default function CreateCourseCategoryDialog({open, onOpenChange, onCreated}:{open:boolean, onOpenChange:any, onCreated:(courseCategory:CourseCategory) => Promise<boolean>}) {
  const focusAnchorRef = useRef<HTMLButtonElement>(null);
  const [isAdding, setIsAdding] = useState(false)

  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    if (await onCreated({id:Date.now(), name:name})) {
      onOpenChange(false);
    }
    setIsAdding(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>新增課程分類</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="inline-block">
                <h4 className="text-[#98A2B3] text-base border-b border-[#EAECF0] pb-1 flex items-center gap-2">
                  <Swatches className="h-6 w-6" />
                  課程分類名稱:
                </h4>
              </div>
              <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="請輸入文字"
                  required
                />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} >
              取消
            </Button>
            <Button ref={focusAnchorRef} type="submit" disabled={!name.trim() || isAdding} loading={isAdding}>
              {isAdding ? "正在新增..." : "新增"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}