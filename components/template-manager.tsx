"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Edit, Trash2, Copy, Eye, Grid3X3, Type, Calculator, PenTool } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TesseractConfig from "@/components/tesseract-config"

// Import the new AdvancedImageMarker component
import AdvancedImageMarker from "@/components/advanced-image-marker"

const translations = {
  en: {
    title: "Template Management",
    description: "Create and manage answer sheet templates",
    createTemplate: "Create New Template",
    templateName: "Template Name",
    templateDescription: "Description",
    questionTypes: "Question Types",
    multipleChoice: "Multiple Choice",
    shortAnswer: "Short Answer",
    essay: "Essay",
    mathematical: "Mathematical",
    totalQuestions: "Total Questions",
    pages: "Pages",
    language: "Language",
    status: "Status",
    active: "Active",
    draft: "Draft",
    archived: "Archived",
    actions: "Actions",
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
    preview: "Preview",
    save: "Save Template",
    cancel: "Cancel",
    templateDetails: "Template Details",
    questionLayout: "Question Layout",
    bubbleSheet: "Bubble Sheet Layout",
    textAreas: "Text Areas",
    mathAreas: "Mathematical Areas",
  },
  th: {
    title: "จัดการแม่แบบ",
    description: "สร้างและจัดการแม่แบบกระดาษคำตอบ",
    createTemplate: "สร้างแม่แบบใหม่",
    templateName: "ชื่อแม่แบบ",
    templateDescription: "คำอธิบาย",
    questionTypes: "ประเภทคำถาม",
    multipleChoice: "ปรนัย",
    shortAnswer: "คำตอบสั้น",
    essay: "อัตนัย",
    mathematical: "คณิตศาสตร์",
    totalQuestions: "จำนวนข้อทั้งหมด",
    pages: "หน้า",
    language: "ภาษา",
    status: "สถานะ",
    active: "ใช้งาน",
    draft: "ร่าง",
    archived: "เก็บถาวร",
    actions: "การดำเนินการ",
    edit: "แก้ไข",
    duplicate: "ทำสำเนา",
    delete: "ลบ",
    preview: "ดูตัวอย่าง",
    save: "บันทึกแม่แบบ",
    cancel: "ยกเลิก",
    templateDetails: "รายละเอียดแม่แบบ",
    questionLayout: "รูปแบบคำถาม",
    bubbleSheet: "รูปแบบกระดาษคำตอบ",
    textAreas: "พื้นที่ข้อความ",
    mathAreas: "พื้นที่คณิตศาสตร์",
  },
}

interface TemplateManagerProps {
  language: "en" | "th"
}

export default function TemplateManager({ language }: TemplateManagerProps) {
  const [templates, setTemplates] = useState([
    {
      id: "template_001",
      name: "PISA Mathematics 2024",
      description: "Standard PISA mathematics assessment template",
      questionTypes: ["multiple_choice", "short_answer", "mathematical"],
      totalQuestions: 120,
      pages: 4,
      language: "th",
      status: "active",
      createdAt: "2024-01-10",
      lastModified: "2024-01-15",
    },
    {
      id: "template_002",
      name: "Science Assessment Grade 9",
      description: "Science assessment for grade 9 students",
      questionTypes: ["multiple_choice", "essay"],
      totalQuestions: 80,
      pages: 3,
      language: "en",
      status: "active",
      createdAt: "2024-01-08",
      lastModified: "2024-01-12",
    },
    {
      id: "template_003",
      name: "English Reading Comprehension",
      description: "English reading comprehension test template",
      questionTypes: ["multiple_choice", "short_answer"],
      totalQuestions: 60,
      pages: 2,
      language: "en",
      status: "draft",
      createdAt: "2024-01-14",
      lastModified: "2024-01-14",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    questionTypes: [] as string[],
    totalQuestions: 0,
    pages: 1,
    language: "en",
  })

  const [isImageMarkerOpen, setIsImageMarkerOpen] = useState(false)
  const [selectedTemplateForMarking, setSelectedTemplateForMarking] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // เพิ่มหลัง state declarations
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue =
          language === "th"
            ? "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก คุณต้องการออกจากหน้านี้หรือไม่?"
            : "You have unsaved changes. Are you sure you want to leave?"
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, language])

  const t = translations[language]

  const [showTesseractConfig, setShowTesseractConfig] = useState(false)
  const [configRegions, setConfigRegions] = useState<any[]>([])
  const [configTemplateName, setConfigTemplateName] = useState("")

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return <Grid3X3 className="w-4 h-4" />
      case "short_answer":
        return <Type className="w-4 h-4" />
      case "essay":
        return <PenTool className="w-4 h-4" />
      case "mathematical":
        return <Calculator className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      multiple_choice: { en: "Multiple Choice", th: "ปรนัย" },
      short_answer: { en: "Short Answer", th: "คำตอบสั้น" },
      essay: { en: "Essay", th: "อัตนัย" },
      mathematical: { en: "Mathematical", th: "คณิตศาสตร์" },
    }
    return labels[type]?.[language] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateTemplate = () => {
    const template = {
      id: `template_${Date.now()}`,
      ...newTemplate,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
    }
    setTemplates((prev) => [...prev, template])
    setNewTemplate({
      name: "",
      description: "",
      questionTypes: [],
      totalQuestions: 0,
      pages: 1,
      language: "en",
    })
    setIsCreateDialogOpen(false)
  }

  const handleImageMarkerSave = (regions: any[], imageData: string) => {
    console.log("Saving template with regions:", regions)

    // แปลง regions เป็น format ที่ Tesseract ใช้
    const tesseractRegions = regions.map((region) => ({
      id: region.id,
      name: region.name,
      type: region.type,
      coordinates: [region.x, region.y, region.x + region.width, region.y + region.height] as [
        number,
        number,
        number,
        number,
      ],
      ...(region.options && { options: region.options }),
    }))

    setConfigRegions(tesseractRegions)
    setConfigTemplateName(templates.find((t) => t.id === selectedTemplateForMarking)?.name || "Template")
    setIsImageMarkerOpen(false)
    setIsFullscreen(false)
    setHasUnsavedChanges(false) // รีเซ็ต unsaved changes
    setShowTesseractConfig(true)
    setSelectedTemplateForMarking(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t.createTemplate}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.createTemplate}</DialogTitle>
              <DialogDescription>{t.templateDetails}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.templateName}</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">{t.language}</Label>
                  <Select
                    value={newTemplate.language}
                    onValueChange={(value) => setNewTemplate((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="th">ไทย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.templateDescription}</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questions">{t.totalQuestions}</Label>
                  <Input
                    id="questions"
                    type="number"
                    value={newTemplate.totalQuestions}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, totalQuestions: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pages">{t.pages}</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={newTemplate.pages}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, pages: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleCreateTemplate}>{t.save}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(template.status)}>{t[template.status as keyof typeof t]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {template.questionTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {getQuestionTypeIcon(type)}
                      <span className="ml-1">{getQuestionTypeLabel(type)}</span>
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t.totalQuestions}:</span>
                    <span className="ml-1 font-medium">{template.totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t.pages}:</span>
                    <span className="ml-1 font-medium">{template.pages}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Last modified: {template.lastModified}</div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Eye className="w-3 h-3 mr-1" />
                    {t.preview}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplateForMarking(template.id)
                      setIsImageMarkerOpen(true)
                    }}
                  >
                    <Grid3X3 className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog
        open={isImageMarkerOpen}
        onOpenChange={(open) => {
          if (!open && hasUnsavedChanges) {
            const confirmed = window.confirm(
              language === "th"
                ? "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก คุณต้องการปิดหน้าต่างนี้หรือไม่?"
                : "You have unsaved changes. Are you sure you want to close?",
            )
            if (!confirmed) return
          }
          setIsImageMarkerOpen(open)
          if (!open) {
            setIsFullscreen(false)
            setHasUnsavedChanges(false)
          }
        }}
      >
        <DialogContent
          className={`${isFullscreen ? "max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] m-0 rounded-none" : "max-w-7xl max-h-[90vh]"} overflow-hidden transition-all duration-300`}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>มาร์กพื้นที่แม่แบบ</DialogTitle>
                <DialogDescription>อัปโหลดภาพแม่แบบและกำหนดพื้นที่สำหรับการประมวลผล OCR</DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0 0l5.5 5.5"
                        />
                      </svg>
                      ออกจากเต็มจอ
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      เต็มจอ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className={`overflow-auto ${isFullscreen ? "max-h-[calc(100vh-80px)]" : "max-h-[calc(90vh-120px)]"}`}>
            <AdvancedImageMarker
              language={language}
              onSave={handleImageMarkerSave}
              onUnsavedChanges={setHasUnsavedChanges}
            />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showTesseractConfig} onOpenChange={setShowTesseractConfig}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>การกำหนดค่า Tesseract OCR</DialogTitle>
            <DialogDescription>ไฟล์กำหนดค่าสำหรับการประมวลผล OCR</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <TesseractConfig language={language} regions={configRegions} templateName={configTemplateName} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
