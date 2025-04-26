"use client"

import Image from "next/image"
import { Users } from "lucide-react"
import { Calendar, Swatches } from '@mynaui/icons-react';

import { IoCalendarOutline, IoCalendar } from "react-icons/io5";
import { IoFlowerOutline } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoSchool } from "react-icons/io5";
import { IoSearchCircleSharp } from "react-icons/io5";
import { PiAddressBookTabsLight, PiAddressBookTabsFill } from "react-icons/pi";

import { cn } from "@/lib/utils"
import { AuthNav } from "./auth-nav"

interface MainNavProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export function MainNav({ activeNav, onNavChange }: MainNavProps) {
  const navItems = [
    {
      title: "行事曆",
      href: "/shadcn-calendar",
      icon: ()=> <IoCalendarOutline size={20}/>,
    },
    {
      title: "學員",
      href: "/students",
      icon: ()=> <PiAddressBookTabsLight size={25}/>,
    },
    {
      title: "課程",
      href: "/course-view",
      icon: ()=> <IoSchool size={20}/>,
    },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 justify-between">
        <div className="mr-4">
            <Image 
              src="/icons/icon.svg" 
              alt="Course Management Logo" 
              width={64} 
              height={64} 
              className="h-8 w-8"
            />
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          {navItems.map((item) => (
            <button
              key={item.title}
              onClick={() => onNavChange(item.title)}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                activeNav === item.title ? "text-primary font-bold underline" : "text-muted-foreground",
              )}
            >
              <item.icon />
              <span>{item.title}</span>
            </button>
          ))}
          <AuthNav />
        </div>
      </div>
    </nav>
  )
}

