"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Users, BarChart3, Scan, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react"
import DocumentUpload from "@/components/document-upload"
import TemplateManager from "@/components/template-manager"
import OCRReview from "@/components/ocr-review"
import Analytics from "@/components/analytics"
import UserManagement from "@/components/user-management"
import LanguageSelector from "@/components/language-selector"

const translations = {
  en: {
    title: "PISA Auto-Grading System",
    dashboard: "Dashboard",
    upload: "Upload Documents",
    templates: "Templates",
    review: "Review & Grade",
    analytics: "Analytics",
    users: "User Management",
    settings: "Settings",
    recentJobs: "Recent Processing Jobs",
    systemStats: "System Statistics",
    documentsProcessed: "Documents Processed",
    averageAccuracy: "Average OCR Accuracy",
    pendingReview: "Pending Review",
    completedToday: "Completed Today",
    viewDetails: "View Details",
    status: {
      processing: "Processing",
      completed: "Completed",
      pending: "Pending Review",
      failed: "Failed",
    },
  },
  th: {
    title: "ระบบตรวจข้อสอบอัตโนมัติ PISA",
    dashboard: "แดชบอร์ด",
    upload: "อัปโหลดเอกสาร",
    templates: "แม่แบบ",
    review: "ตรวจสอบและให้คะแนน",
    analytics: "การวิเคราะห์",
    users: "จัดการผู้ใช้",
    settings: "การตั้งค่า",
    recentJobs: "งานประมวลผลล่าสุด",
    systemStats: "สถิติระบบ",
    documentsProcessed: "เอกสารที่ประมวลผล",
    averageAccuracy: "ความแม่นยำ OCR เฉลี่ย",
    pendingReview: "รอการตรวจสอบ",
    completedToday: "เสร็จสิ้นวันนี้",
    viewDetails: "ดูรายละเอียด",
    status: {
      processing: "กำลังประมวลผล",
      completed: "เสร็จสิ้น",
      pending: "รอการตรวจสอบ",
      failed: "ล้มเหลว",
    },
  },
}

export default function PISAGradingSystem() {
  const [language, setLanguage] = useState<"en" | "th">("th")
  const [activeTab, setActiveTab] = useState("dashboard")
  const t = translations[language]

  const recentJobs = [
    {
      id: "job_001",
      filename: "Math_Exam_Class_A.pdf",
      status: "completed",
      progress: 100,
      accuracy: 94,
      timestamp: "2024-01-15 14:30",
    },
    {
      id: "job_002",
      filename: "Science_Test_Grade_9.pdf",
      status: "processing",
      progress: 67,
      accuracy: null,
      timestamp: "2024-01-15 15:45",
    },
    {
      id: "job_003",
      filename: "English_Assessment.pdf",
      status: "pending",
      progress: 100,
      accuracy: 89,
      timestamp: "2024-01-15 16:20",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>
          </div>
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <div className="space-y-2">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t.dashboard}
              </Button>
              <Button
                variant={activeTab === "upload" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("upload")}
              >
                <Upload className="w-4 h-4 mr-2" />
                {t.upload}
              </Button>
              <Button
                variant={activeTab === "templates" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("templates")}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.templates}
              </Button>
              <Button
                variant={activeTab === "review" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("review")}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t.review}
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t.analytics}
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
              >
                <Users className="w-4 h-4 mr-2" />
                {t.users}
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.documentsProcessed}</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.averageAccuracy}</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.2%</div>
                    <p className="text-xs text-muted-foreground">+2.1% from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.pendingReview}</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-xs text-muted-foreground">-5 from yesterday</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.completedToday}</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">+15 from yesterday</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.recentJobs}</CardTitle>
                  <CardDescription>Latest document processing activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(job.status)}
                          <div>
                            <p className="font-medium">{job.filename}</p>
                            <p className="text-sm text-muted-foreground">{job.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge className={getStatusColor(job.status)}>
                              {t.status[job.status as keyof typeof t.status]}
                            </Badge>
                            {job.status === "processing" && <Progress value={job.progress} className="w-24 mt-1" />}
                            {job.accuracy && (
                              <p className="text-sm text-muted-foreground mt-1">Accuracy: {job.accuracy}%</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            {t.viewDetails}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "upload" && <DocumentUpload language={language} />}
          {activeTab === "templates" && <TemplateManager language={language} />}
          {activeTab === "review" && <OCRReview language={language} />}
          {activeTab === "analytics" && <Analytics language={language} />}
          {activeTab === "users" && <UserManagement language={language} />}
        </main>
      </div>
    </div>
  )
}
