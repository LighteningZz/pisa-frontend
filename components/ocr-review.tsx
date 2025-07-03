"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Eye, CheckCircle, AlertCircle, Edit, Save, X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react"

const translations = {
  en: {
    title: "OCR Review & Grading",
    description: "Review OCR results and grade student responses",
    pendingReview: "Pending Review",
    completed: "Completed",
    confidence: "Confidence",
    originalScan: "Original Scan",
    extractedText: "Extracted Text",
    suggestedGrade: "Suggested Grade",
    finalGrade: "Final Grade",
    approve: "Approve",
    reject: "Reject",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    question: "Question",
    studentAnswer: "Student Answer",
    correctAnswer: "Correct Answer",
    points: "Points",
    feedback: "Feedback",
    nextQuestion: "Next Question",
    previousQuestion: "Previous Question",
    exportResults: "Export Results",
    batchApprove: "Batch Approve",
    filterByConfidence: "Filter by Confidence",
    highConfidence: "High (>90%)",
    mediumConfidence: "Medium (70-90%)",
    lowConfidence: "Low (<70%)",
  },
  th: {
    title: "ตรวจสอบ OCR และให้คะแนน",
    description: "ตรวจสอบผลลัพธ์ OCR และให้คะแนนคำตอบของนักเรียน",
    pendingReview: "รอการตรวจสอบ",
    completed: "เสร็จสิ้น",
    confidence: "ความเชื่อมั่น",
    originalScan: "ภาพสแกนต้นฉบับ",
    extractedText: "ข้อความที่แยกได้",
    suggestedGrade: "คะแนนที่แนะนำ",
    finalGrade: "คะแนนสุดท้าย",
    approve: "อนุมัติ",
    reject: "ปฏิเสธ",
    edit: "แก้ไข",
    save: "บันทึก",
    cancel: "ยกเลิก",
    question: "คำถาม",
    studentAnswer: "คำตอบนักเรียน",
    correctAnswer: "คำตอบที่ถูกต้อง",
    points: "คะแนน",
    feedback: "ข้อเสนอแนะ",
    nextQuestion: "คำถามถัดไป",
    previousQuestion: "คำถามก่อนหน้า",
    exportResults: "ส่งออกผลลัพธ์",
    batchApprove: "อนุมัติทั้งหมด",
    filterByConfidence: "กรองตามความเชื่อมั่น",
    highConfidence: "สูง (>90%)",
    mediumConfidence: "ปานกลาง (70-90%)",
    lowConfidence: "ต่ำ (<70%)",
  },
}

interface OCRReviewProps {
  language: "en" | "th"
}

export default function OCRReview({ language }: OCRReviewProps) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [editingText, setEditingText] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const t = translations[language]

  const documents = [
    {
      id: "doc_001",
      filename: "Math_Exam_Student_001.pdf",
      studentId: "STU001",
      studentName: "สมชาย ใจดี",
      status: "pending",
      confidence: 87,
      totalQuestions: 20,
      reviewedQuestions: 12,
      questions: [
        {
          id: "q1",
          questionText: "What is 2 + 2?",
          studentAnswer: "4",
          correctAnswer: "4",
          confidence: 95,
          suggestedGrade: 2,
          maxPoints: 2,
          status: "correct",
        },
        {
          id: "q2",
          questionText: "Solve for x: 2x + 5 = 13",
          studentAnswer: "x = 4",
          correctAnswer: "x = 4",
          confidence: 78,
          suggestedGrade: 1.5,
          maxPoints: 2,
          status: "partial",
        },
        {
          id: "q3",
          questionText: "What is the area of a circle with radius 5?",
          studentAnswer: "25π",
          correctAnswer: "25π",
          confidence: 65,
          suggestedGrade: 0,
          maxPoints: 3,
          status: "needs_review",
        },
      ],
    },
    {
      id: "doc_002",
      filename: "Science_Test_Student_002.pdf",
      studentId: "STU002",
      studentName: "สมหญิง รักเรียน",
      status: "completed",
      confidence: 92,
      totalQuestions: 15,
      reviewedQuestions: 15,
      questions: [],
    },
  ]

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-100"
    if (confidence >= 70) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "correct":
        return "bg-green-100 text-green-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      case "needs_review":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEditText = (text: string) => {
    setEditingText(text)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    // Save the edited text
    setIsEditing(false)
    setEditingText("")
  }

  const selectedDoc = documents.find((doc) => doc.id === selectedDocument)
  const currentQ = selectedDoc?.questions[currentQuestion]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.exportResults}
          </Button>
          <Button>{t.batchApprove}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Select a document to review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDocument === doc.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedDocument(doc.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm truncate">{doc.filename}</p>
                      <Badge className={getConfidenceColor(doc.confidence)}>{doc.confidence}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{doc.studentName}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        {doc.reviewedQuestions}/{doc.totalQuestions} reviewed
                      </span>
                      <Badge variant={doc.status === "completed" ? "default" : "secondary"}>
                        {doc.status === "completed" ? t.completed : t.pendingReview}
                      </Badge>
                    </div>
                    <Progress value={(doc.reviewedQuestions / doc.totalQuestions) * 100} className="mt-2 h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Interface */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="space-y-4">
              {/* Question Navigation */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedDoc.studentName}</CardTitle>
                      <CardDescription>{selectedDoc.filename}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                      >
                        {t.previousQuestion}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentQuestion + 1} / {selectedDoc.questions.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentQuestion(Math.min(selectedDoc.questions.length - 1, currentQuestion + 1))
                        }
                        disabled={currentQuestion === selectedDoc.questions.length - 1}
                      >
                        {t.nextQuestion}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Question Review */}
              {currentQ && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Original Scan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t.originalScan}</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                        <img
                          src="/placeholder.svg?height=300&width=400&text=Scanned+Answer+Sheet"
                          alt="Scanned answer sheet"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* OCR Results & Grading */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{t.extractedText}</CardTitle>
                        <Badge className={getConfidenceColor(currentQ.confidence)}>
                          {t.confidence}: {currentQ.confidence}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">{t.question}</label>
                        <p className="text-sm text-muted-foreground mt-1">{currentQ.questionText}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">{t.studentAnswer}</label>
                          <Button variant="ghost" size="sm" onClick={() => handleEditText(currentQ.studentAnswer)}>
                            <Edit className="w-3 h-3 mr-1" />
                            {t.edit}
                          </Button>
                        </div>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveEdit}>
                                <Save className="w-3 h-3 mr-1" />
                                {t.save}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                <X className="w-3 h-3 mr-1" />
                                {t.cancel}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">{currentQ.studentAnswer}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">{t.correctAnswer}</label>
                        <div className="p-3 bg-green-50 rounded-lg mt-1">
                          <p className="text-sm">{currentQ.correctAnswer}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">{t.suggestedGrade}</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold">{currentQ.suggestedGrade}</span>
                            <span className="text-sm text-muted-foreground">/ {currentQ.maxPoints}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t.finalGrade}</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              min="0"
                              max={currentQ.maxPoints}
                              step="0.5"
                              defaultValue={currentQ.suggestedGrade}
                              className="w-16 px-2 py-1 border rounded text-center"
                            />
                            <span className="text-sm text-muted-foreground">/ {currentQ.maxPoints}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">{t.feedback}</label>
                        <Textarea placeholder="Add feedback for the student..." className="mt-1" rows={3} />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t.approve}
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {t.reject}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a document to start reviewing</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
