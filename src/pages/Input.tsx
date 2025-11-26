import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Droplets, Loader2, ImagePlus, X, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/utils";
import { useLiff } from "@/contexts/LiffContext";
import { Share2 } from "lucide-react";

const Input = () => {
  const [rawMessage, setRawMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isLoggedIn, profile, isLoading: isLiffLoading, isInLiffClient, shareTargetPicker, isShareAvailable } = useLiff();

  const handleShare = async () => {
    try {
      await shareTargetPicker();
      toast.success('ขอบคุณที่ช่วยแชร์ครับ');
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const processImageFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10MB");
      return;
    }

    setError("");
    setIsOcrProcessing(true);

    // Create preview and get base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string;
      setPreviewImage(base64Image);

      try {
        toast.info("กำลังอ่านข้อความจากรูปภาพด้วย AI...", {
          description: "กระบวนการนี้อาจใช้เวลาสักครู่",
        });

        const { data, error: ocrError } = await supabase.functions.invoke('ocr-image', {
          body: { image: base64Image }
        });

        if (ocrError) throw ocrError;

        const extractedText = data.text?.trim();

        if (extractedText && extractedText !== "ไม่พบข้อความในรูปภาพ") {
          // Clean the extracted text
          const cleanedText = extractedText
            .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
            .replace(/[^\S\r\n]+/g, " ") // Normalize spaces
            .trim();

          setRawMessage((prev) =>
            prev ? prev + "\n\n" + cleanedText : cleanedText
          );
          toast.success("อ่านข้อความสำเร็จ", {
            description: "ข้อความถูกเพิ่มในช่องด้านล่างแล้ว",
          });
        } else {
          toast.warning("ไม่พบข้อความในรูปภาพ", {
            description: "กรุณาลองใช้รูปภาพที่มีข้อความชัดเจนกว่านี้",
          });
        }
      } catch (err) {
        console.error("OCR error:", err);
        setError("ไม่สามารถอ่านข้อความจากรูปภาพได้");
        toast.error("เกิดข้อผิดพลาด", {
          description: "ไม่สามารถอ่านข้อความจากรูปภาพได้",
        });
      } finally {
        setIsOcrProcessing(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOcrProcessing && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isOcrProcessing || isProcessing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const clearPreviewImage = () => {
    setPreviewImage(null);
  };

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

      // Format phone numbers in extracted reports
      const formattedReports = data.reports?.map((report: any) => ({
        ...report,
        phone: report.phone?.map((p: string) => formatPhoneNumber(p)) || []
      }));

      // Check if multiple reports were extracted
      if (formattedReports && formattedReports.length > 1) {
        // Navigate to selection page
        navigate('/select', { state: { reports: formattedReports } });
      } else if (formattedReports && formattedReports.length === 1) {
        // Single report - go directly to review
        navigate('/review', { state: { extractedData: formattedReports[0] } });
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
        {/* LINE Profile Display */}
        {isLoggedIn && profile && (
          <div className="flex items-center justify-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <Avatar className="h-10 w-10">
              {profile.pictureUrl ? (
                <AvatarImage src={profile.pictureUrl} alt={profile.displayName} />
              ) : (
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {profile.displayName}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                เข้าสู่ระบบด้วย LINE แล้ว
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplets className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            ช่วยใส่ข้อมูลที่เจอใน social media
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
              1. คัดลอกข้อความจากโซเชียล (Facebook, Twitter, Line ฯลฯ) หรืออัพโหลดรูปภาพ
              <br />
              2. วางข้อความในช่องด้านล่าง หรือใช้ปุ่ม "อัพโหลดรูปภาพ" เพื่อดึงข้อความจากรูป
              <br />
              3. กดปุ่ม "ประมวลผลด้วย AI" แล้วรอสักครู่
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload Section with Drag & Drop */}
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={isOcrProcessing || isProcessing}
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isOcrProcessing && !isProcessing && fileInputRef.current?.click()}
                className={`
                  w-full h-24 border-2 border-dashed rounded-lg cursor-pointer
                  flex flex-col items-center justify-center gap-2
                  transition-all duration-200
                  ${isDragging
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                  }
                  ${(isOcrProcessing || isProcessing) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isOcrProcessing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      กำลังอ่านข้อความด้วย AI...
                    </span>
                  </>
                ) : isDragging ? (
                  <>
                    <ImagePlus className="h-6 w-6 text-primary" />
                    <span className="text-sm text-primary font-medium">
                      ปล่อยเพื่ออัพโหลดรูปภาพ
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground text-center">
                      ลากรูปภาพมาวางที่นี่ หรือ <span className="text-primary underline">คลิกเพื่อเลือกไฟล์</span>
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      รองรับภาษาไทยและอังกฤษ (OCR)
                    </span>
                  </>
                )}
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full max-h-48 object-contain rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearPreviewImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-muted"></div>
              <span className="px-4 text-sm text-muted-foreground">หรือ</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>

            <Textarea
              placeholder="วางข้อความหรือรูปภาพที่นี่ (Ctrl+V / Cmd+V)...

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
              onPaste={(e) => {
                // Check for image in clipboard first
                const items = e.clipboardData?.items;
                if (items) {
                  for (const item of items) {
                    if (item.type.startsWith("image/")) {
                      e.preventDefault();
                      const file = item.getAsFile();
                      if (file) {
                        processImageFile(file);
                      }
                      return;
                    }
                  }
                }

                // Handle text paste
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text/plain');
                // Clean text: remove hidden characters, normalize whitespace
                const cleanedText = pastedText
                  .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
                  .replace(/[^\S\r\n]+/g, ' ') // Normalize spaces
                  .trim();
                // Append pasted text to existing content instead of replacing it
                setRawMessage((prev) => (prev ? prev + cleanedText : cleanedText));
                setError("");
              }}
              className="min-h-[300px] text-base font-normal resize-none"
              disabled={isProcessing || isOcrProcessing}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleProcess}
              disabled={isProcessing || isOcrProcessing || !rawMessage.trim()}
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

            {/* LINE Share Button */}
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="w-full text-lg h-12 bg-[#06C755] hover:bg-[#05b34c] text-white border-[#06C755] hover:border-[#05b34c]"
            >
              <Share2 className="mr-2 h-5 w-5" />
              แชร์ผ่าน LINE
            </Button>

            <div className="text-center space-y-2">
              <div>
                <Button
                  variant="link"
                  onClick={() => navigate('/dashboard')}
                  className="text-primary"
                >
                  ดูข้อมูลทั้งหมดในระบบ →
                </Button>
              </div>
              <div>
                <Button
                  variant="link"
                  onClick={() => navigate('/help')}
                  className="text-muted-foreground"
                >
                  📖 คู่มือการใช้งาน
                </Button>
              </div>
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