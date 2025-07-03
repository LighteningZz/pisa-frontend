"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react"

const translations = {
  en: {
    title: "Analytics Dashboard",
    description: "System performance and grading analytics",
    overview: "Overview",
    ocrPerformance: "OCR Performance",
    gradingStats: "Grading Statistics",
    systemHealth: "System Health",
    totalDocuments: "Total Documents",
    averageAccuracy: "Average Accuracy",
    processingTime: "Avg Processing Time",
    errorRate: "Error Rate",
    documentsToday: "Documents Today",
    accuracyTrend: "Accuracy Trend",
    confidenceDistribution: "Confidence Distribution",
    questionTypes: "Question Type Performance",
    multipleChoice: "Multiple Choice",
    shortAnswer: "Short Answer",
    essay: "Essay",
    mathematical: "Mathematical",
    highConfidence: "High Confidence (>90%)",
    mediumConfidence: "Medium Confidence (70-90%)",
    lowConfidence: "Low Confidence (<70%)",
    needsReview: "Needs Review",
    autoGraded: "Auto Graded",
    manualReview: "Manual Review",
    systemStatus: "System Status",
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
  },
  th: {
    title: "แดชบอร์ดการวิเคราะห์",
    description: "ประสิทธิภาพระบบและการวิเคราะห์การให้คะแนน",
    overview: "ภาพรวม",
    ocrPerformance: "ประสิทธิภาพ OCR",
    gradingStats: "สถิติการให้คะแนน",
    systemHealth: "สุขภาพระบบ",
    totalDocuments: "เอกสารทั้งหมด",
    averageAccuracy: "ความแม่นยำเฉลี่ย",
    processingTime: "เวลาประมวลผลเฉลี่ย",
    errorRate: "อัตราข้อผิดพลาด",
    documentsToday: "เอกสารวันนี้",
    accuracyTrend: "แนวโน้มความแม่นยำ",
    confidenceDistribution: "การกระจายความเชื่อมั่น",
    questionTypes: "ประสิทธิภาพตามประเภทคำถาม",
    multipleChoice: "ปรนัย",
    shortAnswer: "คำตอบสั้น",
    essay: "อัตนัย",
    mathematical: "คณิตศาสตร์",
    highConfidence: "ความเชื่อมั่นสูง (>90%)",
    mediumConfidence: "ความเชื่อมั่นปานกลาง (70-90%)",
    lowConfidence: "ความเชื่อมั่นต่ำ (<70%)",
    needsReview: "ต้องตรวจสอบ",
    autoGraded: "ให้คะแนนอัตโนมัติ",
    manualReview: "ตรวจสอบด้วยตนเอง",
    systemStatus: "สถานะระบบ",
    healthy: "ปกติ",
    warning: "เตือน",
    critical: "วิกฤต",
  },
}

interface AnalyticsProps {
  language: "en" | "th"
}

export default function Analytics({ language }: AnalyticsProps) {
  const t = translations[language]

  const overviewStats = [
    {
      title: t.totalDocuments,
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: FileText,
    },
    {
      title: t.averageAccuracy,
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: CheckCircle,
    },
    {
      title: t.processingTime,
      value: "2.3s",
      change: "-0.5s",
      trend: "down",
      icon: Clock,
    },
    {
      title: t.errorRate,
      value: "1.8%",
      change: "-0.3%",
      trend: "down",
      icon: AlertTriangle,
    },
  ]

  const questionTypeStats = [
    { type: t.multipleChoice, accuracy: 97, processed: 1250, color: "bg-blue-500" },
    { type: t.shortAnswer, accuracy: 89, processed: 890, color: "bg-green-500" },
    { type: t.essay, accuracy: 76, processed: 420, color: "bg-yellow-500" },
    { type: t.mathematical, accuracy: 92, processed: 287, color: "bg-purple-500" },
  ]

  const confidenceData = [
    { label: t.highConfidence, value: 68, count: 1936 },
    { label: t.mediumConfidence, value: 24, count: 683 },
    { label: t.lowConfidence, value: 8, count: 228 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                )}
                <span className="text-green-500">{stat.change}</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OCR Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t.ocrPerformance}</CardTitle>
            <CardDescription>{t.confidenceDistribution}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {confidenceData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">
                    {item.count} documents ({item.value}%)
                  </span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Question Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t.questionTypes}</CardTitle>
            <CardDescription>Accuracy by question type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionTypeStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                  <span className="text-sm font-medium">{stat.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{stat.processed} processed</span>
                  <Badge variant="outline">{stat.accuracy}%</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Grading Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t.gradingStats}</CardTitle>
            <CardDescription>Grading method distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t.autoGraded}</span>
                <span className="font-medium">2,156 (76%)</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t.manualReview}</span>
                <span className="font-medium">691 (24%)</span>
              </div>
              <Progress value={24} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>{t.systemHealth}</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">OCR Service</span>
              <Badge className="bg-green-100 text-green-800">{t.healthy}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge className="bg-green-100 text-green-800">{t.healthy}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <Badge className="bg-yellow-100 text-yellow-800">{t.warning}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing Queue</span>
              <Badge className="bg-green-100 text-green-800">{t.healthy}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
