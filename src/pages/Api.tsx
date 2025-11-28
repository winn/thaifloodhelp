import { AlertCircle, Check, Code, Copy, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ApiKeyManager } from '@/components/ApiKeyManager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const Api = () => {
  const [ocrInput, setOcrInput] = useState('')
  const [ocrResponse, setOcrResponse] = useState('')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrApiKey, setOcrApiKey] = useState('')

  const [extractInput, setExtractInput] = useState('')
  const [extractResponse, setExtractResponse] = useState('')
  const [extractLoading, setExtractLoading] = useState(false)
  const [extractApiKey, setExtractApiKey] = useState('')

  const [saveInput, setSaveInput] = useState('')
  const [saveResponse, setSaveResponse] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveApiKey, setSaveApiKey] = useState('')

  const [copiedOcr, setCopiedOcr] = useState(false)
  const [copiedExtract, setCopiedExtract] = useState(false)
  const [copiedSave, setCopiedSave] = useState(false)

  const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

  const ocrExampleBase64 = JSON.stringify(
    {
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    },
    null,
    2,
  )

  const ocrExampleUrl = JSON.stringify(
    {
      imageUrl: 'https://example.com/image.jpg',
    },
    null,
    2,
  )

  const [ocrExampleType, setOcrExampleType] = useState<'base64' | 'url'>(
    'base64',
  )
  const ocrExample =
    ocrExampleType === 'base64' ? ocrExampleBase64 : ocrExampleUrl

  const extractExample = JSON.stringify(
    {
      message:
        'ช่วยด้วยครับ คุณสมชาย ใจดี อยู่บ้านเลขที่ 123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่ โทร 081-234-5678 น้ำท่วมบ้านสูง 1 เมตร มีผู้สูงอายุ 2 คน เด็ก 3 คน ต้องการอาหารและน้ำดื่มเร่งด่วน',
    },
    null,
    2,
  )

  const saveExample = JSON.stringify(
    {
      name: 'สมชาย',
      lastname: 'ใจดี',
      phone: ['081-234-5678'],
      address: 'บ้านเลขที่ 123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่',
      location_lat: null,
      location_long: null,
      map_link: null,
      number_of_adults: 0,
      number_of_children: 3,
      number_of_seniors: 2,
      number_of_patients: 0,
      number_of_infants: 0,
      health_condition: '-',
      help_categories: ['food_shortage', 'water_shortage'],
      urgency_level: 4,
      additional_info: 'น้ำท่วมบ้านสูง 1 เมตร',
      raw_message:
        'ช่วยด้วยครับ คุณสมชาย ใจดี อยู่บ้านเลขที่ 123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่ โทร 081-234-5678 น้ำท่วมบ้านสูง 1 เมตร มีผู้สูงอายุ 2 คน เด็ก 3 คน ต้องการอาหารและน้ำดื่มเร่งด่วน',
      reporter_name: null,
    },
    null,
    2,
  )

  const handleOcr = async () => {
    if (!ocrInput.trim()) {
      toast.error('กรุณาใส่ข้อมูล JSON')
      return
    }

    if (!ocrApiKey.trim()) {
      toast.error('กรุณาใส่ API Key')
      return
    }

    let payload
    try {
      payload = JSON.parse(ocrInput)
    } catch {
      toast.error('รูปแบบ JSON ไม่ถูกต้อง')
      return
    }

    setOcrLoading(true)
    setOcrResponse('')

    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ocrApiKey,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setOcrResponse(JSON.stringify(data, null, 2))

      if (response.ok) {
        toast.success('อ่านรูปภาพสำเร็จ')
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${response.status}`)
      }
    } catch (error) {
      toast.error('ไม่สามารถเชื่อมต่อ API ได้')
      setOcrResponse(JSON.stringify({ error: String(error) }, null, 2))
    } finally {
      setOcrLoading(false)
    }
  }

  const handleExtract = async () => {
    if (!extractInput.trim()) {
      toast.error('กรุณาใส่ข้อมูล JSON')
      return
    }

    if (!extractApiKey.trim()) {
      toast.error('กรุณาใส่ API Key')
      return
    }

    let payload
    try {
      payload = JSON.parse(extractInput)
    } catch {
      toast.error('รูปแบบ JSON ไม่ถูกต้อง')
      return
    }

    setExtractLoading(true)
    setExtractResponse('')

    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': extractApiKey,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setExtractResponse(JSON.stringify(data, null, 2))

      if (response.ok) {
        toast.success('สกัดข้อมูลสำเร็จ')
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${response.status}`)
      }
    } catch (error) {
      toast.error('ไม่สามารถเชื่อมต่อ API ได้')
      setExtractResponse(JSON.stringify({ error: String(error) }, null, 2))
    } finally {
      setExtractLoading(false)
    }
  }

  const handleSave = async () => {
    if (!saveInput.trim()) {
      toast.error('กรุณาใส่ข้อมูล JSON')
      return
    }

    if (!saveApiKey.trim()) {
      toast.error('กรุณาใส่ API Key')
      return
    }

    let payload
    try {
      payload = JSON.parse(saveInput)
    } catch {
      toast.error('รูปแบบ JSON ไม่ถูกต้อง')
      return
    }

    setSaveLoading(true)
    setSaveResponse('')

    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-save-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': saveApiKey,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setSaveResponse(JSON.stringify(data, null, 2))

      if (response.ok) {
        toast.success('บันทึกข้อมูลสำเร็จ')
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${response.status}`)
      }
    } catch (error) {
      toast.error('ไม่สามารถเชื่อมต่อ API ได้')
      setSaveResponse(JSON.stringify({ error: String(error) }, null, 2))
    } finally {
      setSaveLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: 'ocr' | 'extract' | 'save') => {
    navigator.clipboard.writeText(text)
    if (type === 'ocr') {
      setCopiedOcr(true)
      setTimeout(() => setCopiedOcr(false), 2000)
    } else if (type === 'extract') {
      setCopiedExtract(true)
      setTimeout(() => setCopiedExtract(false), 2000)
    } else {
      setCopiedSave(true)
      setTimeout(() => setCopiedSave(false), 2000)
    }
    toast.success('คัดลอกแล้ว')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
            <Code className="h-8 w-8" />
            API Documentation
          </h1>
          <p className="text-muted-foreground">
            ทดสอบและเรียกใช้งาน API สำหรับระบบช่วยเหลือผู้ประสบภัยน้ำท่วม
          </p>
        </header>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            การใช้งาน API ต้องเข้าสู่ระบบและมี API Key
            พร้อมทั้งมีการจำกัดอัตราการเรียกใช้งานตาม Rate Limit ของแต่ละ Key
          </AlertDescription>
        </Alert>

        <ApiKeyManager />

        <Card>
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
            <CardDescription>
              ใช้ URL พื้นฐานนี้สำหรับเรียก API ทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted px-4 py-2 rounded text-sm break-all overflow-x-auto">
              {API_BASE_URL}
            </code>
          </CardContent>
        </Card>

        <Tabs defaultValue="ocr" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ocr">OCR API</TabsTrigger>
            <TabsTrigger value="extract">Extract API</TabsTrigger>
            <TabsTrigger value="save">Save API</TabsTrigger>
          </TabsList>

          <TabsContent value="ocr" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge>POST</Badge>
                  <code className="text-sm">/api-v1-ocr</code>
                </div>
                <CardDescription>
                  อ่านข้อความจากรูปภาพด้วย OCR (Optical Character Recognition)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Headers</h3>
                  <pre className="bg-muted p-4 rounded text-sm">
                    {`Content-Type: application/json
X-API-Key: your_api_key_here`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Request Body</h3>
                    <div className="flex gap-2">
                      <div className="flex gap-1 border rounded p-1">
                        <Button
                          size="sm"
                          variant={
                            ocrExampleType === 'base64' ? 'default' : 'ghost'
                          }
                          onClick={() => setOcrExampleType('base64')}
                        >
                          Base64
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            ocrExampleType === 'url' ? 'default' : 'ghost'
                          }
                          onClick={() => setOcrExampleType('url')}
                        >
                          URL
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(ocrExample, 'ocr')}
                      >
                        {copiedOcr ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    {ocrExample}
                  </pre>
                  <p className="text-sm text-muted-foreground">
                    {ocrExampleType === 'base64'
                      ? 'หมายเหตุ: ส่งรูปภาพในรูปแบบ Base64 data URL (data:image/[type];base64,[data])'
                      : 'หมายเหตุ: ส่ง URL ของรูปภาพที่ต้องการอ่าน (imageUrl)'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">ทดสอบ API</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="ใส่ API Key ของคุณ (tfh_...)"
                      value={ocrApiKey}
                      onChange={(e) => setOcrApiKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Textarea
                    placeholder="วาง JSON request body ที่นี่..."
                    value={ocrInput}
                    onChange={(e) => setOcrInput(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setOcrInput(ocrExample)}
                      variant="outline"
                      size="sm"
                    >
                      ใช้ตัวอย่าง
                    </Button>
                    <Button
                      onClick={handleOcr}
                      disabled={ocrLoading}
                      className="flex-1"
                    >
                      {ocrLoading ? (
                        'กำลังอ่านรูปภาพ...'
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          ส่งคำขอ
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {ocrResponse && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Response</h3>
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-96">
                      {ocrResponse}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example cURL</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {`curl -X POST '${API_BASE_URL}/api-v1-ocr' \\
  -H 'Content-Type: application/json' \\
  -d '${ocrExample.replace(/\n/g, '').replace(/\s+/g, ' ')}'`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extract" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge>POST</Badge>
                  <code className="text-sm">/api-v1-extract</code>
                </div>
                <CardDescription>
                  สกัดข้อมูลจากข้อความแจ้งเหตุและแปลงเป็นโครงสร้างข้อมูลที่เป็นระเบียบ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Headers</h3>
                  <pre className="bg-muted p-4 rounded text-sm">
                    {`Content-Type: application/json
X-API-Key: your_api_key_here`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Request Body</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(extractExample, 'extract')}
                    >
                      {copiedExtract ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    {extractExample}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">ทดสอบ API</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="ใส่ API Key ของคุณ (tfh_...)"
                      value={extractApiKey}
                      onChange={(e) => setExtractApiKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Textarea
                    placeholder="วาง JSON request body ที่นี่..."
                    value={extractInput}
                    onChange={(e) => setExtractInput(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setExtractInput(extractExample)}
                      variant="outline"
                      size="sm"
                    >
                      ใช้ตัวอย่าง
                    </Button>
                    <Button
                      onClick={handleExtract}
                      disabled={extractLoading}
                      className="flex-1"
                    >
                      {extractLoading ? (
                        'กำลังประมวลผล...'
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          ส่งคำขอ
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {extractResponse && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Response</h3>
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-96">
                      {extractResponse}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example cURL</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {`curl -X POST '${API_BASE_URL}/api-v1-extract' \\
  -H 'Content-Type: application/json' \\
  -d '${extractExample.replace(/\n/g, '').replace(/\s+/g, ' ')}'`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="save" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge>POST</Badge>
                  <code className="text-sm">/api-v1-save</code>
                  <Badge variant="secondary" className="text-xs">
                    Mock Mode
                  </Badge>
                </div>
                <CardDescription>
                  ทดสอบบันทึกข้อมูล (จำลองการทำงาน - ไม่บันทึกลงฐานข้อมูลจริง)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Headers</h3>
                  <pre className="bg-muted p-4 rounded text-sm">
                    {`Content-Type: application/json
X-API-Key: your_api_key_here`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Request Body</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(saveExample, 'save')}
                    >
                      {copiedSave ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-64">
                    {saveExample}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">ทดสอบ API (Mock)</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="ใส่ API Key ของคุณ (tfh_...)"
                      value={saveApiKey}
                      onChange={(e) => setSaveApiKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Textarea
                    placeholder="วาง JSON request body ที่นี่..."
                    value={saveInput}
                    onChange={(e) => setSaveInput(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSaveInput(saveExample)}
                      variant="outline"
                      size="sm"
                    >
                      ใช้ตัวอย่าง
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="flex-1"
                    >
                      {saveLoading ? (
                        'กำลังบันทึก (Mock)...'
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          ส่งคำขอ (Mock)
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {saveResponse && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Response</h3>
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-96">
                      {saveResponse}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example cURL (Mock)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {`curl -X POST '${API_BASE_URL}/api-v1-save-mock' \\
  -H 'Content-Type: application/json' \\
  -d '${saveExample.replace(/\n/g, '').replace(/\s+/g, ' ')}'`}
                </pre>
                <p className="text-sm text-muted-foreground mt-2">
                  หมายเหตุ: สำหรับการใช้งานจริง ให้เปลี่ยน endpoint เป็น{' '}
                  <code className="bg-muted px-1 rounded">/api-v1-save</code>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Response Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2 items-center">
                <Badge
                  variant="default"
                  className="min-w-[50px] justify-center"
                >
                  200
                </Badge>
                <span>Success - การประมวลผลสำเร็จ</span>
              </div>
              <div className="flex gap-2 items-center">
                <Badge
                  variant="destructive"
                  className="min-w-[50px] justify-center"
                >
                  400
                </Badge>
                <span>Bad Request - ข้อมูลที่ส่งมาไม่ถูกต้อง</span>
              </div>
              <div className="flex gap-2 items-center">
                <Badge
                  variant="destructive"
                  className="min-w-[50px] justify-center"
                >
                  500
                </Badge>
                <span>
                  Internal Server Error - เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default Api
