"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

interface LanguageSelectorProps {
  language: "en" | "th"
  onLanguageChange: (language: "en" | "th") => void
}

export default function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  const languages = {
    en: { name: "English", flag: "🇺🇸" },
    th: { name: "ไทย", flag: "🇹🇭" },
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Globe className="w-4 h-4" />
          {languages[language].flag} {languages[language].name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, lang]) => (
          <DropdownMenuItem key={code} onClick={() => onLanguageChange(code as "en" | "th")} className="gap-2">
            {lang.flag} {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
