import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Droplets, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Input = () => {
  const [rawMessage, setRawMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleProcess = async () => {
    if (!rawMessage.trim()) {
      setError("กรุณาวางข้อความที่ต้องการประมวลผล");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const { data, error: functionError } = await supabase.functions.invoke('extract-report', {
        body: { rawMessage: rawMessage.trim() }
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Check if multiple reports were extracted
      if (data.reports && data.reports.length > 1) {
        // Navigate to selection page
        navigate('/select', { state: { reports: data.reports } });
      } else if (data.reports && data.reports.length === 1) {
        // Single report - go directly to review
        navigate('/review', { state: { extractedData: data.reports[0] } });
      } else {
        throw new Error('ไม่พบข้อมูลที่สามารถแยกได้');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการประมวลผล');
      toast.error('ไม่สามารถประมวลผลได้', {
        description: err instanceof Error ? err.message : 'กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplets className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            ระบบรับแจ้งผู้ประสบภัยน้ำท่วม
          </h1>
          <p className="text-muted-foreground text-lg">
            คัดลอกข้อความจากโซเชียลมาวางได้เลย AI จะช่วยจัดการให้
          </p>
        </div>

        {/* Main Input Card */}
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              วิธีใช้งาน
            </CardTitle>
            <CardDescription className="text-base">
              1. คัดลอกข้อความจากโซเชียล (Facebook, Twitter, Line ฯลฯ)
              <br />
              2. วางข้อความในช่องด้านล่าง
              <br />
              3. กดปุ่ม "ประมวลผลด้วย AI" แล้วรอสักครู่
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="วางข้อความที่คัดลอกมาที่นี่... 

ตัวอย่าง:
ด่วน! ขอความช่วยเหลือ
จากคุณสมชาย ใจดี
บ้านเลขที่ 123 หมู่ 5 ต.บางกระทุ่ม อ.เมือง จ.เชียงใหม่
โทร 081-234-5678
มีคนในครอบครัว 5 คน (ผู้ใหญ่ 3 คน เด็ก 2 คน)
น้ำท่วมถึงชั้นสอง ต้องการเรือด่วน!"
              value={rawMessage}
              onChange={(e) => {
                setRawMessage(e.target.value);
                setError("");
              }}
              className="min-h-[300px] text-base font-normal resize-none"
              disabled={isProcessing}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleProcess}
              disabled={isProcessing || !rawMessage.trim()}
              size="lg"
              className="w-full text-lg h-14"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังประมวลผล...
                </>
              ) : (
                "ประมวลผลด้วย AI"
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate('/dashboard')}
                className="text-primary"
              >
                ดูข้อมูลทั้งหมดในระบบ →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-accent/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-accent text-lg">ข้อมูลที่ AI จะแยกให้อัตโนมัติ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li>✓ ชื่อ-นามสกุล</li>
              <li>✓ ที่อยู่แบบละเอียด</li>
              <li>✓ เบอร์โทรศัพท์</li>
              <li>✓ จำนวนผู้ประสบภัย</li>
              <li>✓ ภาวะสุขภาพ</li>
              <li>✓ ความช่วยเหลือที่ต้องการ</li>
              <li>✓ ระดับความเร่งด่วน (1-5)</li>
              <li>✓ ตำแหน่งพิกัด (ถ้ามี)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Input;