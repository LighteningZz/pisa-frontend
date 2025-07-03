"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, ImageIcon, CheckCircle, AlertCircle, X } from "lucide-react"
import { useDropzone } from "react-dropzone"

const translations = {
  en: {
    title: "Document Upload",
    description: "Upload scanned answer sheets for processing",
    dropzone: "Drag and drop files here, or click to select",
    supportedFormats: "Supported formats: PDF, PNG, JPG (Max 10MB per file)",
    selectedFiles: "Selected Files",
    uploadAll: "Upload All Files",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    remove: "Remove",
    selectTemplate: "Select Template",
    batchProcessing: "Batch Processing Options",
    autoGrade: "Enable Auto-Grading",
    ocrLanguage: "OCR Language",
    confidenceThreshold: "Confidence Threshold",
  },
  th: {
    title: "อัปโหลดเอกสาร",
    description: "อัปโหลดกระดาษคำตอบที่สแกนแล้วเพื่อประมวลผล",
    dropzone: "ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือก",
    supportedFormats: "รูปแบบที่รองรับ: PDF, PNG, JPG (สูงสุด 10MB ต่อไฟล์)",
    selectedFiles: "ไฟล์ที่เลือก",
    uploadAll: "อัปโหลดทั้งหมด",
    processing: "กำลังประมวลผล",
    completed: "เสร็จสิ้น",
    failed: "ล้มเหลว",
    remove: "ลบ",
    selectTemplate: "เลือกแม่แบบ",
    batchProcessing: "ตัวเลือกการประมวลผลแบบกลุ่ม",
    autoGrade: "เปิดใช้การให้คะแนนอัตโนมัติ",
    ocrLanguage: "ภาษา OCR",
    confidenceThreshold: "เกณฑ์ความเชื่อมั่น",
  },
}

interface DocumentUploadProps {
  language: "en" | "th"
}

export default function DocumentUpload({ language }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, "pending" | "processing" | "completed" | "failed">>(
    {},
  )
  const t = translations[language]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
    acceptedFiles.forEach((file) => {
      setUploadStatus((prev) => ({ ...prev, [file.name]: "pending" }))
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName))
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
    setUploadStatus((prev) => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
  }

  const simulateUpload = (fileName: string) => {
    setUploadStatus((prev) => ({ ...prev, [fileName]: "processing" }))
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadStatus((prev) => ({ ...prev, [fileName]: "completed" }))
      }
      setUploadProgress((prev) => ({ ...prev, [fileName]: progress }))
    }, 200)
  }

  const uploadAllFiles = () => {
    files.forEach((file) => {
      if (uploadStatus[file.name] === "pending") {
        simulateUpload(file.name)
      }
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (extension === "pdf") {
      return <FileText className="w-8 h-8 text-red-500" />
    }
    return <ImageIcon className="w-8 h-8 text-blue-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">{t.dropzone}</p>
            <p className="text-sm text-muted-foreground">{t.supportedFormats}</p>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.selectedFiles}</CardTitle>
                <CardDescription>{files.length} files selected</CardDescription>
              </div>
              <Button onClick={uploadAllFiles} disabled={files.every((file) => uploadStatus[file.name] !== "pending")}>
                <Upload className="w-4 h-4 mr-2" />
                {t.uploadAll}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.name} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {uploadStatus[file.name] === "processing" && (
                      <Progress value={uploadProgress[file.name] || 0} className="mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(uploadStatus[file.name])}
                    <Badge
                      variant={
                        uploadStatus[file.name] === "completed"
                          ? "default"
                          : uploadStatus[file.name] === "processing"
                            ? "secondary"
                            : uploadStatus[file.name] === "failed"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {uploadStatus[file.name] === "pending"
                        ? "Ready"
                        : uploadStatus[file.name] === "processing"
                          ? t.processing
                          : uploadStatus[file.name] === "completed"
                            ? t.completed
                            : t.failed}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      disabled={uploadStatus[file.name] === "processing"}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
