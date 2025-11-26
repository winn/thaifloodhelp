import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Api = () => {
  const { toast } = useToast();
  const [extractInput, setExtractInput] = useState('{"message": "นายสมชาย ใจดี อยู่ที่ 123 ถนนสุขุมวิท กรุงเทพฯ โทร 081-234-5678 มีผู้ใหญ่ 2 คน เด็ก 1 คน ต้องการน้ำและอาหาร"}');
  const [extractOutput, setExtractOutput] = useState("");
  const [extractLoading, setExtractLoading] = useState(false);

  const [saveInput, setSaveInput] = useState('');
  const [saveOutput, setSaveOutput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "คัดลอกแล้ว",
      description: "คัดลอกข้อมูลไปยังคลิปบอร์ดแล้ว",
    });
  };

  const testExtractApi = async () => {
    setExtractLoading(true);
    setExtractOutput("");
    try {
      const response = await fetch(`${baseUrl}/api-v1-extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: extractInput,
      });

      const data = await response.json();
      setExtractOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      setExtractOutput(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }, null, 2));
    } finally {
      setExtractLoading(false);
    }
  };

  const testSaveApi = async () => {
    setSaveLoading(true);
    setSaveOutput("");
    try {
      const response = await fetch(`${baseUrl}/api-v1-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: saveInput,
      });

      const data = await response.json();
      setSaveOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      setSaveOutput(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }, null, 2));
    } finally {
      setSaveLoading(false);
    }
  };

  const fillSaveFromExtract = () => {
    try {
      const extractResult = JSON.parse(extractOutput);
      if (extractResult.success && extractResult.data) {
        setSaveInput(JSON.stringify(extractResult.data, null, 2));
        toast({
          title: "เติมข้อมูลแล้ว",
          description: "คัดลอกข้อมูลจาก Extract API มาแล้ว",
        });
      }
    } catch (error) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอ่านข้อมูลจาก Extract API ได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          API สำหรับระบบจัดการข้อมูลผู้ประสบภัยน้ำท่วม
        </p>
      </div>

      <Tabs defaultValue="extract" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="extract">Extract API</TabsTrigger>
          <TabsTrigger value="save">Save API</TabsTrigger>
        </TabsList>

        <TabsContent value="extract" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="default">POST</Badge>
                    /api/v1/extract
                  </CardTitle>
                  <CardDescription className="mt-2">
                    แยกข้อมูลที่สำคัญจากข้อความผู้ประสบภัย
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Endpoint</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted p-2 rounded text-sm">
                    {baseUrl}/api-v1-extract
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(`${baseUrl}/api-v1-extract`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Request Body</h3>
                <Textarea
                  value={extractInput}
                  onChange={(e) => setExtractInput(e.target.value)}
                  className="font-mono text-sm h-32"
                />
              </div>

              <Button onClick={testExtractApi} disabled={extractLoading} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {extractLoading ? "กำลังประมวลผล..." : "ทดสอบ API"}
              </Button>

              {extractOutput && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Response</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fillSaveFromExtract}
                      >
                        ใช้ข้อมูลนี้กับ Save API
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(extractOutput)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={extractOutput}
                    readOnly
                    className="font-mono text-sm h-96"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Response Fields</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• <code>name</code> - ชื่อผู้ประสบภัย</p>
                  <p>• <code>lastname</code> - นามสกุล</p>
                  <p>• <code>reporter_name</code> - ชื่อผู้รายงาน</p>
                  <p>• <code>address</code> - ที่อยู่</p>
                  <p>• <code>phone</code> - เบอร์โทรศัพท์ (array)</p>
                  <p>• <code>number_of_adults/children/infants/seniors/patients</code> - จำนวนคน</p>
                  <p>• <code>health_condition</code> - สภาพสุขภาพ</p>
                  <p>• <code>help_needed</code> - ความช่วยเหลือที่ต้องการ</p>
                  <p>• <code>help_categories</code> - ประเภทความช่วยเหลือ (array)</p>
                  <p>• <code>urgency_level</code> - ระดับความเร่งด่วน (1-5)</p>
                  <p>• <code>location_lat/location_long</code> - พิกัดที่ตั้ง</p>
                  <p>• <code>map_link</code> - ลิงก์แผนที่</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="save" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="default">POST</Badge>
                    /api/v1/save
                  </CardTitle>
                  <CardDescription className="mt-2">
                    บันทึกข้อมูลผู้ประสบภัยลงฐานข้อมูล
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Endpoint</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted p-2 rounded text-sm">
                    {baseUrl}/api-v1-save
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(`${baseUrl}/api-v1-save`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Request Body</h3>
                <Textarea
                  value={saveInput}
                  onChange={(e) => setSaveInput(e.target.value)}
                  placeholder='{"name": "ชื่อ", "raw_message": "ข้อความ", ...}'
                  className="font-mono text-sm h-64"
                />
              </div>

              <Button onClick={testSaveApi} disabled={saveLoading} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {saveLoading ? "กำลังบันทึก..." : "ทดสอบ API"}
              </Button>

              {saveOutput && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Response</h3>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(saveOutput)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={saveOutput}
                    readOnly
                    className="font-mono text-sm h-32"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Required Fields</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• <code>name</code> - ชื่อผู้ประสบภัย (required)</p>
                  <p>• <code>raw_message</code> - ข้อความต้นฉบับ (required)</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Optional Fields</h3>
                <div className="text-sm text-muted-foreground">
                  <p>ฟิลด์อื่นๆ ทั้งหมดที่ได้จาก Extract API สามารถส่งมาได้</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Api;
