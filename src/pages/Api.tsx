import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Send, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const Api = () => {
  const [extractMessage, setExtractMessage] = useState("");
  const [extractResponse, setExtractResponse] = useState("");
  const [extractLoading, setExtractLoading] = useState(false);
  
  const [saveData, setSaveData] = useState("");
  const [saveResponse, setSaveResponse] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [copiedExtract, setCopiedExtract] = useState(false);
  const [copiedSave, setCopiedSave] = useState(false);

  const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  const handleExtract = async () => {
    if (!extractMessage.trim()) {
      toast.error("กรุณาใส่ข้อความ");
      return;
    }

    setExtractLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: extractMessage }),
      });

      const data = await response.json();
      setExtractResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast.success("สกัดข้อมูลสำเร็จ");
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อ API ได้");
      setExtractResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setExtractLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveData.trim()) {
      toast.error("กรุณาใส่ข้อมูล JSON");
      return;
    }

    try {
      JSON.parse(saveData); // Validate JSON
    } catch {
      toast.error("รูปแบบ JSON ไม่ถูกต้อง");
      return;
    }

    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api-v1-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: saveData,
      });

      const data = await response.json();
      setSaveResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ");
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อ API ได้");
      setSaveResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setSaveLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "extract" | "save") => {
    navigator.clipboard.writeText(text);
    if (type === "extract") {
      setCopiedExtract(true);
      setTimeout(() => setCopiedExtract(false), 2000);
    } else {
      setCopiedSave(true);
      setTimeout(() => setCopiedSave(false), 2000);
    }
    toast.success("คัดลอกแล้ว");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
            <Code className="h-8 w-8" />
            API Documentation
          </h1>
          <p className="text-muted-foreground">ทดสอบและดูเอกสาร API สำหรับระบบช่วยเหลือผู้ประสบภัย</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {API_BASE_URL}/api-v1-extract
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                สกัดข้อมูลจากข้อความที่ป้อนเข้ามา และแปลงเป็นข้อมูลที่มีโครงสร้าง
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {API_BASE_URL}/api-v1-save
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                บันทึกข้อมูลที่ตรวจสอบแล้วลงในฐานข้อมูล
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="extract">Extract API</TabsTrigger>
            <TabsTrigger value="save">Save API</TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>POST /api-v1-extract</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Request Body</label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "message": "string"
}`}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('{\n  "message": "string"\n}', "extract")}
                    >
                      {copiedExtract ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ทดสอบ API</label>
                  <Textarea
                    placeholder="ใส่ข้อความที่ต้องการสกัดข้อมูล..."
                    value={extractMessage}
                    onChange={(e) => setExtractMessage(e.target.value)}
                    rows={6}
                  />
                  <Button onClick={handleExtract} disabled={extractLoading} className="w-full">
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

                {extractResponse && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Response</label>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      {extractResponse}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="save" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>POST /api-v1-save</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Request Body (JSON from Extract API)</label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-48">
{`{
  "name": "string",
  "lastname": "string",
  "phone": ["string"],
  "address": "string",
  "location_lat": number,
  "location_long": number,
  "map_link": "string",
  "number_of_adults": number,
  "number_of_children": number,
  "number_of_seniors": number,
  "number_of_patients": number,
  "number_of_infants": number,
  "health_condition": "string",
  "help_categories": ["string"],
  "urgency_level": number,
  "additional_info": "string",
  "raw_message": "string",
  "reporter_name": "string"
}`}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('{\n  "name": "string",\n  "lastname": "string",\n  "phone": ["string"],\n  "address": "string",\n  "location_lat": 0,\n  "location_long": 0,\n  "map_link": "string",\n  "number_of_adults": 0,\n  "number_of_children": 0,\n  "number_of_seniors": 0,\n  "number_of_patients": 0,\n  "number_of_infants": 0,\n  "health_condition": "string",\n  "help_categories": ["string"],\n  "urgency_level": 1,\n  "additional_info": "string",\n  "raw_message": "string",\n  "reporter_name": "string"\n}', "save")}
                    >
                      {copiedSave ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ทดสอบ API</label>
                  <Textarea
                    placeholder="วาง JSON ที่ได้จาก Extract API หรือสร้างเอง..."
                    value={saveData}
                    onChange={(e) => setSaveData(e.target.value)}
                    rows={8}
                  />
                  <Button onClick={handleSave} disabled={saveLoading} className="w-full">
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

                {saveResponse && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Response</label>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      {saveResponse}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">JavaScript/TypeScript</h3>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// Extract data
const extractResponse = await fetch('${API_BASE_URL}/api-v1-extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'ข้อความที่ต้องการสกัด' })
});
const extractedData = await extractResponse.json();

// Save data
const saveResponse = await fetch('${API_BASE_URL}/api-v1-save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(extractedData)
});
const result = await saveResponse.json();`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">cURL</h3>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`# Extract
curl -X POST '${API_BASE_URL}/api-v1-extract' \\
  -H 'Content-Type: application/json' \\
  -d '{"message": "ข้อความที่ต้องการสกัด"}'

# Save
curl -X POST '${API_BASE_URL}/api-v1-save' \\
  -H 'Content-Type: application/json' \\
  -d '{"name": "ชื่อ", "raw_message": "ข้อความเดิม", ...}'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Api;
