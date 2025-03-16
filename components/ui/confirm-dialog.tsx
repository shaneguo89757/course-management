import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ReactNode } from "react"

interface ConfirmDialogProps {
  trigger: ReactNode
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  children?: ReactNode
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "確認",
  cancelText = "取消",
  onConfirm,
  children, // 其他可擴展元素
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[95%] sm:max-w-[500px] p-6 rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="mt-3">
            {description}
          </AlertDialogDescription>
          {children}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className="border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/50"
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 