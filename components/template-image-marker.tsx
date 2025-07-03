"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Save, Trash2, Eye, EyeOff, ZoomIn, ZoomOut, RotateCw, Square } from "lucide-react"
import { useDropzone } from "react-dropzone"

const translations = {
  en: {
    title: "Template Image Marker",
    description: "Upload template image and mark regions for OCR processing",
    uploadImage: "Upload Template Image",
    markRegions: "Mark Regions",
    regionType: "Region Type",
    regionName: "Region Name",
    coordinates: "Coordinates",
    addRegion: "Add Region",
    deleteRegion: "Delete Region",
    saveTemplate: "Save Template",
    showRegions: "Show Regions",
    hideRegions: "Hide Regions",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    rotate: "Rotate",
    regionTypes: {
      student_info: "Student Information",
      student_name: "Student Name",
      student_id: "Student ID",
      question_area: "Question Area",
      answer_area: "Answer Area",
      multiple_choice: "Multiple Choice Bubbles",
      short_answer: "Short Answer Box",
      essay_area: "Essay Area",
      math_area: "Mathematical Area",
      signature: "Signature Area",
    },
  },
  th: {
    title: "เครื่องมือมาร์กพื้นที่แม่แบบ",
    description: "อัปโหลดภาพแม่แบบและมาร์กพื้นที่สำหรับการประมวลผล OCR",
    uploadImage: "อัปโหลดภาพแม่แบบ",
    markRegions: "มาร์กพื้นที่",
    regionType: "ประเภทพื้นที่",
    regionName: "ชื่อพื้นที่",
    coordinates: "พิกัด",
    addRegion: "เพิ่มพื้นที่",
    deleteRegion: "ลบพื้นที่",
    saveTemplate: "บันทึกแม่แบบ",
    showRegions: "แสดงพื้นที่",
    hideRegions: "ซ่อนพื้นที่",
    zoomIn: "ขยาย",
    zoomOut: "ย่อ",
    rotate: "หมุน",
    regionTypes: {
      student_info: "ข้อมูลนักเรียน",
      student_name: "ชื่อนักเรียน",
      student_id: "รหัสนักเรียน",
      question_area: "พื้นที่คำถาม",
      answer_area: "พื้นที่คำตอบ",
      multiple_choice: "ตัวเลือกปรนัย",
      short_answer: "กล่องคำตอบสั้น",
      essay_area: "พื้นที่อัตนัย",
      math_area: "พื้นที่คณิตศาสตร์",
      signature: "พื้นที่ลายเซ็น",
    },
  },
}

interface Region {
  id: string
  name: string
  type: string
  coordinates: [number, number, number, number] // [x1, y1, x2, y2]
  options?: string[] // สำหรับ multiple choice
  color: string
}

interface TemplateImageMarkerProps {
  language: "en" | "th"
  onSave?: (regions: Region[], imageData: string) => void
}

export default function TemplateImageMarker({ language, onSave }: TemplateImageMarkerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentRegion, setCurrentRegion] = useState<Partial<Region> | null>(null)
  const [selectedRegionType, setSelectedRegionType] = useState("student_info")
  const [selectedRegionName, setSelectedRegionName] = useState("")
  const [showRegions, setShowRegions] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState("A, B, C, D")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const t = translations[language]

  const regionColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setRegions([])
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
  })

  const drawRegions = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
    ctx.restore()

    // Draw regions if visible
    if (showRegions) {
      regions.forEach((region) => {
        const [x1, y1, x2, y2] = region.coordinates
        const width = x2 - x1
        const height = y2 - y1

        ctx.strokeStyle = region.color
        ctx.fillStyle = region.color + "20"
        ctx.lineWidth = 2
        ctx.strokeRect(x1 * zoom, y1 * zoom, width * zoom, height * zoom)
        ctx.fillRect(x1 * zoom, y1 * zoom, width * zoom, height * zoom)

        // Draw label with options
        ctx.fillStyle = region.color
        ctx.font = "12px Arial"
        const label = region.options ? `${region.name} [${region.options.join(", ")}]` : region.name
        ctx.fillText(label, x1 * zoom, y1 * zoom - 5)
      })
    }

    // Draw current region being drawn
    if (
      currentRegion &&
      currentRegion.x !== undefined &&
      currentRegion.y !== undefined &&
      currentRegion.width !== undefined &&
      currentRegion.height !== undefined
    ) {
      ctx.strokeStyle = "#000"
      ctx.setLineDash([5, 5])
      ctx.lineWidth = 2
      ctx.strokeRect(
        currentRegion.x * zoom,
        currentRegion.y * zoom,
        currentRegion.width * zoom,
        currentRegion.height * zoom,
      )
      ctx.setLineDash([])
    }
  }, [regions, showRegions, zoom, rotation, currentRegion])

  useEffect(() => {
    drawRegions()
  }, [drawRegions])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedRegionName.trim()) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    setIsDrawing(true)
    setCurrentRegion({
      x,
      y,
      width: 0,
      height: 0,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentRegion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const currentX = (e.clientX - rect.left) / zoom
    const currentY = (e.clientY - rect.top) / zoom

    setCurrentRegion({
      ...currentRegion,
      width: currentX - (currentRegion.x || 0),
      height: currentY - (currentRegion.y || 0),
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentRegion || !selectedRegionName.trim()) return

    const newRegion: Region = {
      id: `${selectedRegionType}_${Date.now()}`,
      name: selectedRegionName,
      type: selectedRegionType,
      coordinates: [
        Math.min(currentRegion.x || 0, (currentRegion.x || 0) + (currentRegion.width || 0)),
        Math.min(currentRegion.y || 0, (currentRegion.y || 0) + (currentRegion.height || 0)),
        Math.max(currentRegion.x || 0, (currentRegion.x || 0) + (currentRegion.width || 0)),
        Math.max(currentRegion.y || 0, (currentRegion.y || 0) + (currentRegion.height || 0)),
      ],
      options:
        selectedRegionType === "multiple_choice"
          ? multipleChoiceOptions
              .split(",")
              .map((opt) => opt.trim())
              .filter((opt) => opt)
          : undefined,
      color: regionColors[regions.length % regionColors.length],
    }

    setRegions([...regions, newRegion])
    setCurrentRegion(null)
    setIsDrawing(false)
    setSelectedRegionName("")
  }

  const deleteRegion = (regionId: string) => {
    setRegions(regions.filter((r) => r.id !== regionId))
  }

  const handleSave = () => {
    if (onSave && image) {
      onSave(regions, image)
    }
  }

  const handleImageLoad = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    canvas.width = img.width
    canvas.height = img.height
    drawRegions()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>

      {!image ? (
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
              <p className="text-lg font-medium mb-2">{t.uploadImage}</p>
              <p className="text-sm text-muted-foreground">PNG, JPG formats supported</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Image Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.markRegions}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowRegions(!showRegions)}>
                      {showRegions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showRegions ? t.hideRegions : t.showRegions}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.2))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)}>
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={containerRef} className="relative overflow-auto max-h-[600px] border rounded-lg">
                  <img
                    ref={imageRef}
                    src={image || "/placeholder.svg"}
                    alt="Template"
                    className="hidden"
                    onLoad={handleImageLoad}
                  />
                  <canvas
                    ref={canvasRef}
                    className="cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: "center",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Region Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.addRegion}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.regionType}</Label>
                  <Select value={selectedRegionType} onValueChange={setSelectedRegionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.regionTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.regionName}</Label>
                  <Input
                    value={selectedRegionName}
                    onChange={(e) => setSelectedRegionName(e.target.value)}
                    placeholder="เช่น ชื่อ-นามสกุล, ข้อ 1-10"
                  />
                </div>
                {selectedRegionType === "multiple_choice" && (
                  <div className="space-y-2">
                    <Label>ตัวเลือก (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                    <Input
                      value={multipleChoiceOptions}
                      onChange={(e) => setMultipleChoiceOptions(e.target.value)}
                      placeholder="A, B, C, D"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  <Square className="w-3 h-3 inline mr-1" />
                  คลิกและลากเพื่อสร้างพื้นที่บนภาพ
                </p>
              </CardContent>
            </Card>

            {/* Region List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">พื้นที่ที่มาร์กแล้ว ({regions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {regions.map((region) => (
                    <div key={region.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: region.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{region.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.regionTypes[region.type as keyof typeof t.regionTypes]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(region.coordinates[0])}, {Math.round(region.coordinates[1])} -
                            {Math.round(region.coordinates[2] - region.coordinates[0])}×
                            {Math.round(region.coordinates[3] - region.coordinates[1])}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteRegion(region.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {regions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีพื้นที่ที่มาร์ก</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full" disabled={regions.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              {t.saveTemplate}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
