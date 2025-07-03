"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download } from "lucide-react"

const translations = {
  en: {
    title: "Tesseract OCR Configuration",
    description: "Generated configuration for Tesseract OCR processing",
    jsonConfig: "JSON Configuration",
    copyConfig: "Copy Configuration",
    downloadConfig: "Download Config File",
    preview: "Preview Regions",
    usage: "Usage Instructions",
    usageText: `
1. Use this JSON configuration with Tesseract OCR
2. Extract regions using the coordinates [x1, y1, x2, y2]
3. For multiple choice, detect filled bubbles in the specified area
4. Process each region according to its type
    `,
  },
  th: {
    title: "การกำหนดค่า Tesseract OCR",
    description: "การกำหนดค่าที่สร้างขึ้นสำหรับการประมวลผล Tesseract OCR",
    jsonConfig: "การกำหนดค่า JSON",
    copyConfig: "คัดลอกการกำหนดค่า",
    downloadConfig: "ดาวน์โหลดไฟล์กำหนดค่า",
    preview: "ดูตัวอย่างพื้นที่",
    usage: "คำแนะนำการใช้งาน",
    usageText: `
1. ใช้การกำหนดค่า JSON นี้กับ Tesseract OCR
2. แยกพื้นที่โดยใช้พิกัด [x1, y1, x2, y2]
3. สำหรับข้อปรนัย ให้ตรวจจับวงกลมที่ระบายในพื้นที่ที่กำหนด
4. ประมวลผลแต่ละพื้นที่ตามประเภทที่กำหนด
    `,
  },
}

interface Region {
  id: string
  name: string
  type: string
  coordinates: [number, number, number, number]
  options?: string[]
}

interface TesseractConfigProps {
  language: "en" | "th"
  regions: Region[]
  templateName: string
}

export default function TesseractConfig({ language, regions, templateName }: TesseractConfigProps) {
  const t = translations[language]

  const generateConfig = () => {
    return {
      template_id: templateName.toLowerCase().replace(/\s+/g, "_"),
      template_name: templateName,
      regions: regions.map((region) => ({
        id: region.id,
        type: region.type,
        coordinates: region.coordinates,
        ...(region.options && { options: region.options }),
      })),
    }
  }

  const config = generateConfig()
  const configJson = JSON.stringify(config, null, 2)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(configJson)
  }

  const downloadConfig = () => {
    const blob = new Blob([configJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${config.template_id}_config.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getRegionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      student_info: "bg-blue-100 text-blue-800",
      student_name: "bg-green-100 text-green-800",
      student_id: "bg-purple-100 text-purple-800",
      multiple_choice: "bg-orange-100 text-orange-800",
      short_answer: "bg-cyan-100 text-cyan-800",
      essay_area: "bg-pink-100 text-pink-800",
      math_area: "bg-yellow-100 text-yellow-800",
      signature: "bg-gray-100 text-gray-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>

      {/* Region Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">พื้นที่ที่กำหนด ({regions.length} พื้นที่)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {regions.map((region) => (
              <div key={region.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{region.name}</p>
                  <p className="text-xs text-muted-foreground">[{region.coordinates.join(", ")}]</p>
                  {region.options && (
                    <p className="text-xs text-muted-foreground">ตัวเลือก: {region.options.join(", ")}</p>
                  )}
                </div>
                <Badge className={getRegionTypeColor(region.type)}>{region.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* JSON Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t.jsonConfig}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                {t.copyConfig}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadConfig}>
                <Download className="w-4 h-4 mr-2" />
                {t.downloadConfig}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea value={configJson} readOnly className="font-mono text-sm min-h-[300px]" />
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.usage}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <pre className="text-sm text-muted-foreground whitespace-pre-line">{t.usageText}</pre>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">ตัวอย่างการใช้งานกับ Python:</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                {`import json
import pytesseract
from PIL import Image

# โหลดการกำหนดค่า
with open('${config.template_id}_config.json', 'r') as f:
    config = json.load(f)

# โหลดภาพ
image = Image.open('answer_sheet.jpg')

# ประมวลผลแต่ละพื้นที่
for region in config['regions']:
    x1, y1, x2, y2 = region['coordinates']
    
    # ตัดภาพตามพื้นที่ที่กำหนด
    cropped = image.crop((x1, y1, x2, y2))
    
    if region['type'] == 'multiple_choice':
        # ตรวจจับวงกลมที่ระบาย
        # ใช้ image processing เพื่อหาตัวเลือกที่เลือก
        pass
    else:
        # ใช้ OCR สำหรับข้อความ
        text = pytesseract.image_to_string(cropped, lang='tha+eng')
        print(f"{region['id']}: {text}")
`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
