import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Send, Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Api = () => {
  const [extractInput, setExtractInput] = useState("");
  const [extractResponse, setExtractResponse] = useState("");
  const [extractLoading, setExtractLoading] = useState(false);
  
  const [saveInput, setSaveInput] = useState("");
  const [saveResponse, setSaveResponse] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [ocrInput, setOcrInput] = useState("");
  const [ocrResponse, setOcrResponse] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  
  const [copiedExtract, setCopiedExtract] = useState(false);
  const [copiedSave, setCopiedSave] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);

  const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  const extractExample = JSON.stringify({
    message: "ช่วยด้วยครับ คุณสมชาย ใจดี อยู่บ้านเลขที่ 123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่ โทร 081-234-5678 น้ำท่วมบ้านสูง 1 เมตร มีผู้สูงอายุ 2 คน เด็ก 3 คน ต้องการอาหารและน้ำดื่มเร่งด่วน"
  }, null, 2);

  const ocrExample = JSON.stringify({
    image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBMRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAAqACAAQAAAABAAAAZKADAAQAAAABAAAAZAAAAAD/..."
  }, null, 2);

  const saveExample = JSON.stringify({
    name: "สมชาย",
    lastname: "ใจดี",
    phone: ["081-234-5678"],
    address: "บ้านเลขที่ 123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่",
    location_lat: null,
    location_long: null,
    map_link: null,
    number_of_adults: 0,
    number_of_children: 3,
    number_of_seniors: 2,
    number_of_patients: 0,
    number_of_infants: 0,
    health_condition: "-",
    help_categories: ["food_shortage", "water_shortage"],
    urgency_level: 4,
    additional_info: "น้ำท่วมบ้านสูง 1 เมตร",
    raw_message: "ช่วยด้วยครับ คุณสมชาย ใจดี อยู่บ้านเลขที่ 123 หมู่ 5 ตำบลบ้านใหม่ อำเภอเมือง จังหวัดเชียงใหม่ โทร 081-234-5678 น้ำท่วมบ้านสูง 1 เมตร มีผู้สูงอายุ 2 คน เด็ก 3 คน ต้องการอาหารและน้ำดื่มเร่งด่วน",
    reporter_name: null
  }, null, 2);

  const handleExtract = async () => {
    if (!extractInput.trim()) {
      toast.error("กรุณาใส่ข้อมูล JSON");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(extractInput);
    } catch {
      toast.error("รูปแบบ JSON ไม่ถูกต้อง");
      return;
    }

    setExtractLoading(true);
    setExtractResponse("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setExtractResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast.success("สกัดข้อมูลสำเร็จ");
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${response.status}`);
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อ API ได้");
      setExtractResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setExtractLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveInput.trim()) {
      toast.error("กรุณาใส่ข้อมูล JSON");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(saveInput);
    } catch {
      toast.error("รูปแบบ JSON ไม่ถูกต้อง");
      return;
    }

    setSaveLoading(true);
    setSaveResponse("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setSaveResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ");
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${response.status}`);
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อ API ได้");
      setSaveResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOcr = async () => {
    if (!ocrInput.trim()) {
      toast.error("กรุณาใส่ข้อมูล JSON");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(ocrInput);
    } catch {
      toast.error("รูปแบบ JSON ไม่ถูกต้อง");
      return;
    }

    setOcrLoading(true);
    setOcrResponse("");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-ocr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setOcrResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast.success("อ่านข้อความจากรูปภาพสำเร็จ");
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${response.status}`);
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อ API ได้");
      setOcrResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setOcrLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "extract" | "save" | "ocr") => {
    navigator.clipboard.writeText(text);
    if (type === "extract") {
      setCopiedExtract(true);
      setTimeout(() => setCopiedExtract(false), 2000);
    } else if (type === "save") {
      setCopiedSave(true);
      setTimeout(() => setCopiedSave(false), 2000);
    } else {
      setCopiedOcr(true);
      setTimeout(() => setCopiedOcr(false), 2000);
    }
    toast.success("คัดลอกแล้ว");
  };

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
            API เหล่านี้เป็นแบบ Public ไม่ต้องใช้ API Key แต่มีการจำกัดอัตราการเรียกใช้งาน
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
            <CardDescription>ใช้ URL พื้นฐานนี้สำหรับเรียก API ทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted px-4 py-2 rounded text-sm">
              {API_BASE_URL}
            </code>
          </CardContent>
        </Card>

        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extract">Extract API</TabsTrigger>
            <TabsTrigger value="ocr">OCR API</TabsTrigger>
            <TabsTrigger value="save">Save API</TabsTrigger>
          </TabsList>

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
{`Content-Type: application/json`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Request Body</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(extractExample, "extract")}
                    >
                      {copiedExtract ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{extractExample}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">ทดสอบ API</h3>
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
                        "กำลังประมวลผล..."
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
  -d '${extractExample.replace(/\n/g, "").replace(/\s+/g, " ")}'`}
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
                </div>
                <CardDescription>
                  บันทึกข้อมูลที่ตรวจสอบแล้วลงในฐานข้อมูล
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Headers</h3>
                  <pre className="bg-muted p-4 rounded text-sm">
{`Content-Type: application/json`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Request Body</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(saveExample, "save")}
                    >
                      {copiedSave ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-64">
{saveExample}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">ทดสอบ API</h3>
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
                        "กำลังบันทึก..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          ส่งคำขอ
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
                <CardTitle>Example cURL</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`curl -X POST '${API_BASE_URL}/api-v1-save' \\
  -H 'Content-Type: application/json' \\
  -d '${saveExample.replace(/\n/g, "").replace(/\s+/g, " ")}'`}
                </pre>
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
              <div className="flex gap-2">
                <Badge variant="default">200</Badge>
                <span>Success - การประมวลผลสำเร็จ</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="destructive">400</Badge>
                <span>Bad Request - ข้อมูลที่ส่งมาไม่ถูกต้อง</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="destructive">500</Badge>
                <span>Internal Server Error - เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Api;
