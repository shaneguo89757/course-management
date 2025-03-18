"use client"

import type React from "react"

import { useState } from "react"

import { useDataStore } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const { addStudent } = useDataStore()
  const [name, setName] = useState("")
  const [ig, setIg] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    addStudent(name, ig.trim() || undefined)
    setName("")
    setIg("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95%] sm:max-w-[425px] p-6 rounded-lg [&>button]:h-10 [&>button]:w-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button>svg]:h-6 [&>button>svg]:w-6"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>新增學員</DialogTitle>
          <DialogDescription>新增一位學員到系統中</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">學員姓名 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入學員姓名"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ig">Instagram 帳號</Label>
              <Input id="ig" value={ig} onChange={(e) => setIg(e.target.value)} placeholder="請輸入 IG 帳號（選填）" />
              <p className="text-xs text-muted-foreground">格式範例：@username</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} >
              取消
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              新增
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

