"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Save,
  Trash2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Square,
  Move,
  MousePointer,
  Grid3X3,
  Ruler,
  Undo,
  Redo,
  Layers,
  Hand,
  Type,
  CheckSquare,
  FileText,
  Calculator,
  User,
  Hash,
  PenTool,
} from "lucide-react"
import { useDropzone } from "react-dropzone"

const translations = {
  en: {
    title: "Advanced Template Marker",
    description: "Professional image marking tool with advanced features",
    tools: "Tools",
    layers: "Layers",
    properties: "Properties",
    rectangle: "Rectangle",
    move: "Move",
    select: "Select",
    hand: "Hand Tool",
    zoom: "Zoom",
    grid: "Grid",
    guides: "Guides",
    ruler: "Ruler",
    opacity: "Opacity",
    strokeWidth: "Stroke Width",
    fillColor: "Fill Color",
    strokeColor: "Stroke Color",
  },
  th: {
    title: "เครื่องมือมาร์กแม่แบบขั้นสูง",
    description: "เครื่องมือมาร์กภาพระดับมืออาชีพพร้อมฟีเจอร์ขั้นสูง",
    tools: "เครื่องมือ",
    layers: "เลเยอร์",
    properties: "คุณสมบัติ",
    rectangle: "สี่เหลี่ยม",
    move: "เลื่อน",
    select: "เลือก",
    hand: "เครื่องมือมือ",
    zoom: "ซูม",
    grid: "ตาราง",
    guides: "เส้นนำ",
    ruler: "ไม้บรรทัด",
    opacity: "ความโปร่งใส",
    strokeWidth: "ความหนาเส้น",
    fillColor: "สีเติม",
    strokeColor: "สีเส้น",
  },
}

interface Region {
  id: string
  name: string
  type: string
  tool: string
  coordinates: number[]
  options?: string[]
  color: string
  fillColor: string
  opacity: number
  strokeWidth: number
  visible: boolean
  locked: boolean
  points?: { x: number; y: number }[]
}

interface AdvancedImageMarkerProps {
  language: "en" | "th"
  onSave?: (regions: Region[], imageData: string) => void
  onUnsavedChanges?: (hasChanges: boolean) => void
}

export default function AdvancedImageMarker({ language, onSave, onUnsavedChanges }: AdvancedImageMarkerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedTool, setSelectedTool] = useState("rectangle")
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentRegion, setCurrentRegion] = useState<Partial<Region> | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(false)
  const [showRuler, setShowRuler] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  // Transform states
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [moveStartPoint, setMoveStartPoint] = useState({ x: 0, y: 0 })
  const [originalRegion, setOriginalRegion] = useState<Region | null>(null)

  // History for undo/redo
  const [history, setHistory] = useState<Region[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Current drawing properties
  const [currentProps, setCurrentProps] = useState({
    regionType: "student_info",
    options: "A, B, C, D",
  })

  // เพิ่มหลัง state อื่นๆ
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false)
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false)

  useEffect(() => {
    if (onUnsavedChanges) {
      onUnsavedChanges(regions.length > 0)
    }
  }, [regions, onUnsavedChanges])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const t = translations[language]

  // Tooltip component
  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {content}
      </div>
    </div>
  )

  const tools = [
    { id: "select", icon: MousePointer, label: t.select },
    { id: "rectangle", icon: Square, label: t.rectangle },
    { id: "move", icon: Move, label: t.move },
    { id: "hand", icon: Hand, label: t.hand },
  ]

  // Region types with colors and icons
  const regionTypes = {
    student_info: {
      label: "ข้อมูลนักเรียน",
      color: "#3B82F6", // Blue
      fillColor: "#3B82F6",
      icon: User,
      opacity: 0.2,
    },
    student_name: {
      label: "ชื่อนักเรียน",
      color: "#10B981", // Green
      fillColor: "#10B981",
      icon: User,
      opacity: 0.2,
    },
    student_id: {
      label: "รหัสนักเรียน",
      color: "#8B5CF6", // Purple
      fillColor: "#8B5CF6",
      icon: Hash,
      opacity: 0.2,
    },
    question_area: {
      label: "พื้นที่คำถาม",
      color: "#F59E0B", // Yellow
      fillColor: "#F59E0B",
      icon: FileText,
      opacity: 0.15,
    },
    answer_area: {
      label: "พื้นที่คำตอบ",
      color: "#EF4444", // Red
      fillColor: "#EF4444",
      icon: Type,
      opacity: 0.2,
    },
    multiple_choice: {
      label: "ตัวเลือกปรนัย",
      color: "#06B6D4", // Cyan
      fillColor: "#06B6D4",
      icon: CheckSquare,
      opacity: 0.25,
    },
    short_answer: {
      label: "กล่องคำตอบสั้น",
      color: "#84CC16", // Lime
      fillColor: "#84CC16",
      icon: Type,
      opacity: 0.2,
    },
    essay_area: {
      label: "พื้นที่อัตนัย",
      color: "#F97316", // Orange
      fillColor: "#F97316",
      icon: PenTool,
      opacity: 0.15,
    },
    math_area: {
      label: "พื้นที่คณิตศาสตร์",
      color: "#EC4899", // Pink
      fillColor: "#EC4899",
      icon: Calculator,
      opacity: 0.2,
    },
    signature: {
      label: "พื้นที่ลายเซ็น",
      color: "#6B7280", // Gray
      fillColor: "#6B7280",
      icon: PenTool,
      opacity: 0.2,
    },
  }

  // Auto-naming system
  const getAutoName = (type: string, regions: Region[]) => {
    const typeCount = regions.filter((r) => r.type === type).length + 1
    const prefixes: Record<string, string> = {
      student_info: "info",
      student_name: "name",
      student_id: "id",
      question_area: "q",
      answer_area: "ans",
      multiple_choice: "mc",
      short_answer: "short",
      essay_area: "essay",
      math_area: "math",
      signature: "sign",
    }
    return `${prefixes[type] || "obj"}${typeCount}`
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setRegions([])
        setHistory([])
        setHistoryIndex(-1)
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

  const addToHistory = useCallback(
    (newRegions: Region[]) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...newRegions])
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setRegions([...history[historyIndex - 1]])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setRegions([...history[historyIndex + 1]])
    }
  }, [history, historyIndex])

  // Helper functions for interaction
  const getResizeHandle = (region: Region, point: { x: number; y: number }) => {
    const [x1, y1, x2, y2] = region.coordinates
    const handleSize = 8 / zoom
    const handles = [
      { id: "nw", x: x1, y: y1 },
      { id: "ne", x: x2, y: y1 },
      { id: "se", x: x2, y: y2 },
      { id: "sw", x: x1, y: y2 },
      { id: "n", x: (x1 + x2) / 2, y: y1 },
      { id: "e", x: x2, y: (y1 + y2) / 2 },
      { id: "s", x: (x1 + x2) / 2, y: y2 },
      { id: "w", x: x1, y: (y1 + y2) / 2 },
    ]

    for (const handle of handles) {
      if (Math.abs(point.x - handle.x) < handleSize && Math.abs(point.y - handle.y) < handleSize) {
        return handle.id
      }
    }
    return null
  }

  const isPointInRegion = (point: { x: number; y: number }, region: Region) => {
    const [x1, y1, x2, y2] = region.coordinates
    return (
      point.x >= Math.min(x1, x2) &&
      point.x <= Math.max(x1, x2) &&
      point.y >= Math.min(y1, y2) &&
      point.y <= Math.max(y1, y2)
    )
  }

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context
    ctx.save()

    // Apply pan and zoom
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Draw image
    ctx.drawImage(img, 0, 0)

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = "#ddd"
      ctx.lineWidth = 1 / zoom
      const gridSize = 20
      for (let x = 0; x < img.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, img.height)
        ctx.stroke()
      }
      for (let y = 0; y < img.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(img.width, y)
        ctx.stroke()
      }
    }

    // Draw regions
    regions.forEach((region) => {
      if (!region.visible) return

      ctx.globalAlpha = region.opacity
      ctx.strokeStyle = region.color
      ctx.fillStyle = region.fillColor
      ctx.lineWidth = region.strokeWidth / zoom

      const [x1, y1, x2, y2] = region.coordinates
      const width = x2 - x1
      const height = y2 - y1

      ctx.fillRect(x1, y1, width, height)
      ctx.strokeRect(x1, y1, width, height)

      // Draw label with type icon
      ctx.globalAlpha = 1
      ctx.fillStyle = region.color
      ctx.font = `${12 / zoom}px Arial`
      const label = region.options ? `${region.name} [${region.options.join(", ")}]` : region.name
      ctx.fillText(label, x1, y1 - 5 / zoom)

      // Draw selection handles if selected
      if (selectedRegion === region.id) {
        ctx.strokeStyle = "#0066cc"
        ctx.fillStyle = "#ffffff"
        ctx.lineWidth = 2 / zoom
        const handleSize = 8 / zoom

        const handles = [
          { x: x1, y: y1 },
          { x: x2, y: y1 },
          { x: x2, y: y2 },
          { x: x1, y: y2 },
          { x: (x1 + x2) / 2, y: y1 },
          { x: x2, y: (y1 + y2) / 2 },
          { x: (x1 + x2) / 2, y: y2 },
          { x: x1, y: (y1 + y2) / 2 },
        ]
        handles.forEach((handle) => {
          ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
          ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
        })
      }
    })

    // Draw current region being drawn
    if (currentRegion && isDrawing) {
      const regionTypeData = regionTypes[currentProps.regionType as keyof typeof regionTypes]
      ctx.globalAlpha = regionTypeData.opacity
      ctx.strokeStyle = regionTypeData.color
      ctx.fillStyle = regionTypeData.fillColor
      ctx.lineWidth = 2 / zoom
      ctx.setLineDash([5 / zoom, 5 / zoom])

      if (selectedTool === "rectangle" && currentRegion.coordinates) {
        const [x1, y1, x2, y2] = currentRegion.coordinates
        const width = x2 - x1
        const height = y2 - y1
        ctx.fillRect(x1, y1, width, height)
        ctx.strokeRect(x1, y1, width, height)
      }

      ctx.setLineDash([])
    }

    // Restore context
    ctx.restore()

    // Draw ruler if enabled
    if (showRuler) {
      ctx.fillStyle = "#333"
      ctx.font = "10px Arial"
      // Draw horizontal ruler
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.fillText(x.toString(), x, 15)
      }
      // Draw vertical ruler
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.save()
        ctx.translate(15, y)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(y.toString(), 0, 0)
        ctx.restore()
      }
    }
  }, [regions, currentRegion, isDrawing, selectedTool, currentProps, zoom, pan, showGrid, showRuler, selectedRegion])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    return { x, y }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)

    if (selectedTool === "hand") {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    // Check for resize handles first
    if (selectedRegion && (selectedTool === "select" || selectedTool === "move")) {
      const region = regions.find((r) => r.id === selectedRegion)
      if (region) {
        const handle = getResizeHandle(region, coords)
        if (handle) {
          setIsResizing(true)
          setResizeHandle(handle)
          setOriginalRegion({ ...region })
          return
        }

        // Check if clicking inside region for move
        if (isPointInRegion(coords, region)) {
          setIsMoving(true)
          setMoveStartPoint(coords)
          setOriginalRegion({ ...region })
          return
        }
      }
    }

    if (selectedTool === "select" || selectedTool === "move") {
      // Check if clicking on a region
      const clickedRegion = regions.find((region) => isPointInRegion(coords, region))
      setSelectedRegion(clickedRegion?.id || null)
      return
    }

    // Drawing new shapes
    if (selectedTool === "rectangle") {
      setIsDrawing(true)
      setCurrentRegion({
        coordinates: [coords.x, coords.y, coords.x, coords.y],
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)

    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (isResizing && selectedRegion && originalRegion && resizeHandle) {
      const newRegions = regions.map((region) => {
        if (region.id === selectedRegion) {
          const [x1, y1, x2, y2] = originalRegion.coordinates
          let newCoords = [...originalRegion.coordinates]

          switch (resizeHandle) {
            case "nw":
              newCoords = [coords.x, coords.y, x2, y2]
              break
            case "ne":
              newCoords = [x1, coords.y, coords.x, y2]
              break
            case "se":
              newCoords = [x1, y1, coords.x, coords.y]
              break
            case "sw":
              newCoords = [coords.x, y1, x2, coords.y]
              break
            case "n":
              newCoords = [x1, coords.y, x2, y2]
              break
            case "e":
              newCoords = [x1, y1, coords.x, y2]
              break
            case "s":
              newCoords = [x1, y1, x2, coords.y]
              break
            case "w":
              newCoords = [coords.x, y1, x2, y2]
              break
          }

          return { ...region, coordinates: newCoords }
        }
        return region
      })
      setRegions(newRegions)
      return
    }

    if (isMoving && selectedRegion && originalRegion) {
      const deltaX = coords.x - moveStartPoint.x
      const deltaY = coords.y - moveStartPoint.y

      const newRegions = regions.map((region) => {
        if (region.id === selectedRegion) {
          const newCoords = originalRegion.coordinates.map((coord, index) => {
            return index % 2 === 0 ? coord + deltaX : coord + deltaY
          })
          return { ...region, coordinates: newCoords }
        }
        return region
      })
      setRegions(newRegions)
      return
    }

    if (!isDrawing || !currentRegion) return

    if (selectedTool === "rectangle") {
      setCurrentRegion((prev) => ({
        ...prev,
        coordinates: [prev!.coordinates![0], prev!.coordinates![1], coords.x, coords.y],
      }))
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)

    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
      setOriginalRegion(null)
      addToHistory(regions)
      return
    }

    if (isMoving) {
      setIsMoving(false)
      setOriginalRegion(null)
      addToHistory(regions)
      return
    }

    if (!isDrawing || !currentRegion) return

    // Auto-generate name
    const autoName = getAutoName(currentProps.regionType, regions)
    const regionTypeData = regionTypes[currentProps.regionType as keyof typeof regionTypes]

    const newRegion: Region = {
      id: `rectangle_${Date.now()}`,
      name: autoName,
      type: currentProps.regionType,
      tool: "rectangle",
      coordinates: currentRegion.coordinates || [],
      options:
        currentProps.regionType === "multiple_choice"
          ? currentProps.options
              .split(",")
              .map((opt) => opt.trim())
              .filter((opt) => opt)
          : undefined,
      color: regionTypeData.color,
      fillColor: regionTypeData.fillColor,
      opacity: regionTypeData.opacity,
      strokeWidth: 2,
      visible: true,
      locked: false,
    }

    const newRegions = [...regions, newRegion]
    setRegions(newRegions)
    addToHistory(newRegions)
    setCurrentRegion(null)
    setIsDrawing(false)
    setSelectedRegion(newRegion.id) // Auto-select the new region

    // Auto-switch to select tool after drawing
    setSelectedTool("select")
  }

  const deleteSelectedRegion = () => {
    if (!selectedRegion) return
    const newRegions = regions.filter((r) => r.id !== selectedRegion)
    setRegions(newRegions)
    addToHistory(newRegions)
    setSelectedRegion(null)
  }

  const toggleRegionVisibility = (regionId: string) => {
    const newRegions = regions.map((r) => (r.id === regionId ? { ...r, visible: !r.visible } : r))
    setRegions(newRegions)
  }

  const updateSelectedRegionName = (newName: string) => {
    if (!selectedRegion) return
    const newRegions = regions.map((r) => (r.id === selectedRegion ? { ...r, name: newName } : r))
    setRegions(newRegions)
  }

  const handleImageLoad = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    canvas.width = img.width + 200 // Extra space for rulers
    canvas.height = img.height + 200
    drawCanvas()
  }

  const handleSave = () => {
    if (onSave && image) {
      onSave(regions, image)
      // รีเซ็ต unsaved changes หลังบันทึก
      if (onUnsavedChanges) {
        onUnsavedChanges(false)
      }
    }
  }

  // Get cursor style based on current state
  const getCursorStyle = () => {
    if (selectedTool === "hand" || isPanning) return "cursor-grab"
    if (isResizing) return "cursor-pointer"
    if (isMoving) return "cursor-move"
    if (selectedTool === "select" || selectedTool === "move") return "cursor-pointer"
    return "cursor-crosshair"
  }

  const selectedRegionData = selectedRegion ? regions.find((r) => r.id === selectedRegion) : null

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key
      if (e.key === "Delete" && selectedRegion) {
        e.preventDefault()
        deleteSelectedRegion()
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault()
          redo()
        }
        // Save shortcut
        else if (e.key === "s") {
          e.preventDefault()
          handleSave()
        }
      }

      // Escape to deselect
      if (e.key === "Escape") {
        setSelectedRegion(null)
        setSelectedTool("select")
      }

      // F11 for fullscreen (แจ้งให้ใช้ปุ่มในแอป)
      if (e.key === "F11") {
        e.preventDefault()
        // แจ้งให้ใช้ปุ่มเต็มจอในแอป
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedRegion, undo, redo])

  const changeSelectedRegionType = (newType: string) => {
    if (!selectedRegion) return

    const regionTypeData = regionTypes[newType as keyof typeof regionTypes]
    const autoName = getAutoName(
      newType,
      regions.filter((r) => r.id !== selectedRegion),
    )

    const newRegions = regions.map((r) => {
      if (r.id === selectedRegion) {
        return {
          ...r,
          type: newType,
          name: autoName, // เปลี่ยนชื่อตามประเภทใหม่
          color: regionTypeData.color,
          fillColor: regionTypeData.fillColor,
          opacity: regionTypeData.opacity,
          // เพิ่ม options ถ้าเป็น multiple choice
          options:
            newType === "multiple_choice"
              ? r.options ||
                currentProps.options
                  .split(",")
                  .map((opt) => opt.trim())
                  .filter((opt) => opt)
              : undefined,
        }
      }
      return r
    })

    setRegions(newRegions)
    addToHistory(newRegions)
  }

  const updateSelectedRegionOptions = (optionsString: string) => {
    if (!selectedRegion) return

    const options = optionsString
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt)
    const newRegions = regions.map((r) => (r.id === selectedRegion ? { ...r, options } : r))

    setRegions(newRegions)
  }

  return (
    <div className="space-y-4">
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
              <p className="text-lg font-medium mb-2">อัปโหลดภาพแม่แบบ</p>
              <p className="text-sm text-muted-foreground">PNG, JPG formats supported</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Region Types - ด้านบนแนวนอน */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ประเภทพื้นที่</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                {Object.entries(regionTypes).map(([key, data]) => (
                  <Button
                    key={key}
                    variant={currentProps.regionType === key ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-xs h-9"
                    onClick={() => setCurrentProps((prev) => ({ ...prev, regionType: key }))}
                    style={{
                      backgroundColor: currentProps.regionType === key ? data.color : undefined,
                      borderColor: data.color,
                      color: currentProps.regionType === key ? "white" : data.color,
                    }}
                  >
                    <data.icon className="w-3 h-3 mr-1" />
                    <span className="truncate">{data.label}</span>
                  </Button>
                ))}
              </div>
              {currentProps.regionType === "multiple_choice" && (
                <div className="mt-3 space-y-2">
                  <Label className="text-sm">ตัวเลือก (สำหรับ Object ใหม่)</Label>
                  <Input
                    value={currentProps.options}
                    onChange={(e) => setCurrentProps((prev) => ({ ...prev, options: e.target.value }))}
                    placeholder="A, B, C, D"
                    className="max-w-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-12 gap-4">
            {/* Toolbar - Collapsible */}
            <div className={`${isToolsCollapsed ? "col-span-1" : "col-span-2"} transition-all duration-300`}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-sm ${isToolsCollapsed ? "hidden" : ""}`}>{t.tools}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsToolsCollapsed(!isToolsCollapsed)}
                      className="h-6 w-6 p-0"
                    >
                      {isToolsCollapsed ? "→" : "←"}
                    </Button>
                  </div>
                </CardHeader>
                {!isToolsCollapsed && (
                  <CardContent className="space-y-2">
                    {tools.map((tool) => (
                      <Tooltip key={tool.id} content={tool.label}>
                        <Button
                          variant={selectedTool === tool.id ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedTool(tool.id)}
                        >
                          <tool.icon className="w-4 h-4 mr-2" />
                          {tool.label}
                        </Button>
                      </Tooltip>
                    ))}

                    <Separator />

                    <div className="flex gap-1">
                      <Tooltip content="Undo (Ctrl+Z)">
                        <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                          <Undo className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Redo (Ctrl+Y)">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                        >
                          <Redo className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>

                    <div className="flex gap-1">
                      <Tooltip content="Toggle Grid">
                        <Button
                          variant={showGrid ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowGrid(!showGrid)}
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Toggle Ruler">
                        <Button
                          variant={showRuler ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowRuler(!showRuler)}
                        >
                          <Ruler className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>

                    <div className="flex gap-1">
                      <Tooltip content="Zoom In">
                        <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(5, zoom * 1.2))}>
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Zoom Out">
                        <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.1, zoom / 1.2))}>
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>

                    <div className="text-xs text-center">Zoom: {Math.round(zoom * 100)}%</div>
                  </CardContent>
                )}
                {isToolsCollapsed && (
                  <CardContent className="space-y-1 px-2">
                    {tools.map((tool) => (
                      <Tooltip key={tool.id} content={tool.label}>
                        <Button
                          variant={selectedTool === tool.id ? "default" : "outline"}
                          size="sm"
                          className="w-full p-1"
                          onClick={() => setSelectedTool(tool.id)}
                        >
                          <tool.icon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    ))}
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Canvas */}
            <div
              className={`${isToolsCollapsed && isPropertiesCollapsed ? "col-span-10" : isToolsCollapsed || isPropertiesCollapsed ? "col-span-8" : "col-span-7"} transition-all duration-300`}
            >
              <Card>
                <CardContent className="p-2">
                  <div className="relative overflow-auto max-h-[600px] border rounded">
                    <img
                      ref={imageRef}
                      src={image || "/placeholder.svg"}
                      alt="Template"
                      className="hidden"
                      onLoad={handleImageLoad}
                    />
                    <canvas
                      ref={canvasRef}
                      className={getCursorStyle()}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel - Collapsible */}
            <div className={`${isPropertiesCollapsed ? "col-span-1" : "col-span-3"} transition-all duration-300`}>
              <div className="space-y-4">
                {/* Properties */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-sm ${isPropertiesCollapsed ? "hidden" : ""}`}>
                        {t.properties}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPropertiesCollapsed(!isPropertiesCollapsed)}
                        className="h-6 w-6 p-0"
                      >
                        {isPropertiesCollapsed ? "←" : "→"}
                      </Button>
                    </div>
                  </CardHeader>
                  {!isPropertiesCollapsed && (
                    <CardContent className="space-y-4">
                      {selectedRegionData && (
                        <div
                          className="space-y-3 p-3 rounded-lg"
                          style={{ backgroundColor: selectedRegionData.color + "20" }}
                        >
                          <Label className="text-sm font-medium">Object ที่เลือก</Label>
                          <Input
                            value={selectedRegionData.name}
                            onChange={(e) => updateSelectedRegionName(e.target.value)}
                            placeholder="ชื่อ object"
                          />

                          {/* เปลี่ยนประเภท object ที่เลือก */}
                          <div className="space-y-2">
                            <Label className="text-sm">เปลี่ยนประเภท</Label>
                            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                              {Object.entries(regionTypes).map(([key, data]) => (
                                <Button
                                  key={key}
                                  variant={selectedRegionData.type === key ? "default" : "outline"}
                                  size="sm"
                                  className="justify-start text-xs h-8"
                                  onClick={() => changeSelectedRegionType(key)}
                                  style={{
                                    backgroundColor: selectedRegionData.type === key ? data.color : undefined,
                                    borderColor: data.color,
                                    color: selectedRegionData.type === key ? "white" : data.color,
                                  }}
                                >
                                  <data.icon className="w-3 h-3 mr-1" />
                                  {data.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* แสดงตัวเลือกถ้าเป็น multiple choice */}
                          {selectedRegionData.type === "multiple_choice" && (
                            <div className="space-y-2">
                              <Label className="text-sm">ตัวเลือก</Label>
                              <Input
                                value={selectedRegionData.options?.join(", ") || "A, B, C, D"}
                                onChange={(e) => updateSelectedRegionOptions(e.target.value)}
                                placeholder="A, B, C, D"
                              />
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            ประเภท: {regionTypes[selectedRegionData.type as keyof typeof regionTypes]?.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            พิกัด: [{selectedRegionData.coordinates.map((c) => Math.round(c)).join(", ")}]
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground">
                        <p>💡 เลือก object แล้วเปลี่ยนประเภทได้ทันที</p>
                        <p className="mt-1">🎨 สีจะเปลี่ยนตามประเภทอัตโนมัติ</p>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Layers */}
                {!isPropertiesCollapsed && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        {t.layers} ({regions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {regions.map((region) => {
                          const regionTypeData = regionTypes[region.type as keyof typeof regionTypes]
                          return (
                            <div
                              key={region.id}
                              className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                                selectedRegion === region.id ? "border-blue-500 bg-blue-50" : ""
                              }`}
                              onClick={() => setSelectedRegion(region.id)}
                            >
                              <regionTypeData.icon className="w-4 h-4" style={{ color: region.color }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{region.name}</p>
                                <p className="text-xs text-muted-foreground">{regionTypeData.label}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleRegionVisibility(region.id)
                                }}
                              >
                                {region.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </Button>
                            </div>
                          )
                        })}
                        {regions.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีเลเยอร์</p>
                        )}
                      </div>

                      {selectedRegion && (
                        <div className="mt-4 pt-4 border-t">
                          <Tooltip content="Delete Selected Object (Delete key)">
                            <Button variant="destructive" size="sm" className="w-full" onClick={deleteSelectedRegion}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              ลบเลเยอร์
                            </Button>
                          </Tooltip>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {!isPropertiesCollapsed && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Delete Object:</span>
                          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Del</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Undo:</span>
                          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Z</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Redo:</span>
                          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Y</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Save:</span>
                          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Deselect:</span>
                          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button onClick={handleSave} className="w-full" disabled={regions.length === 0}>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกแม่แบบ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
