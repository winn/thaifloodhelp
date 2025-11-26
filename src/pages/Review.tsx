import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertCircle, Loader2, FileText, Sparkles, LogIn, Bell, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/utils";
import { useLiff } from "@/contexts/LiffContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface ExtractedData {
  name: string;
  lastname: string;
  raw_message: string;
  reporter_name: string;
  last_contact_at: string;
  address: string;
  location_lat: string;
  location_long: string;
  map_link: string;
  phone: string[];
  number_of_adults: number;
  number_of_children: number;
  number_of_seniors: number;
  number_of_patients: number;
  number_of_infants: number;
  health_condition: string;
  help_needed: string;
  help_categories: string[];
  additional_info: string;
  urgency_level: number;
}

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ExtractedData | null>(null);
  const [reports, setReports] = useState<ExtractedData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isCompletingAddress, setIsCompletingAddress] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isLoggedIn, profile } = useLiff();
  const { user } = useAuth();

  useEffect(() => {
    // Check if there's a pending review from login redirect
    const pendingReview = sessionStorage.getItem('pendingReview');
    if (pendingReview) {
      const { formData: savedFormData, reports: savedReports, currentIndex: savedIndex, phoneInput: savedPhoneInput } = JSON.parse(pendingReview);
      setFormData(savedFormData);
      setReports(savedReports);
      setCurrentIndex(savedIndex);
      setPhoneInput(savedPhoneInput);
      sessionStorage.removeItem('pendingReview');
      return;
    }

    const extractedData = location.state?.extractedData;
    const extractedReports = location.state?.reports;
    
    if (extractedReports && extractedReports.length > 0) {
      // Multiple reports mode
      setReports(extractedReports);
      setFormData(extractedReports[0]);
      setPhoneInput(extractedReports[0].phone?.join(', ') || '');
    } else if (extractedData) {
      // Single report mode
      setReports([extractedData]);
      setFormData(extractedData);
      setPhoneInput(extractedData.phone?.join(', ') || '');
    } else {
      toast.error('ไม่พบข้อมูล', { description: 'กรุณากรอกข้อมูลใหม่' });
      navigate('/');
    }
  }, [location, navigate]);

  const checkForDuplicates = async (rawMessage: string) => {
    try {
      // Generate embedding for the raw message
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
        'generate-embedding',
        { body: { text: rawMessage } }
      );

      if (embeddingError) throw embeddingError;

      // Check for duplicates
      const { data: duplicateData, error: duplicateError } = await supabase.functions.invoke(
        'check-duplicates',
        { body: { embedding: embeddingData.embedding, threshold: 0.85 } }
      );

      if (duplicateError) throw duplicateError;

      return duplicateData.duplicates || [];
    } catch (err) {
      console.error('Error checking duplicates:', err);
      // On error, return empty array to proceed with save
      return [];
    }
  };

  const handleCompleteAddress = async () => {
    if (!formData?.address || formData.address === '-') {
      toast.error('ไม่มีที่อยู่ให้เติม');
      return;
    }

    setIsCompletingAddress(true);

    try {
      // Step 1: Complete the address with AI
      const { data: completionData, error: completionError } = await supabase.functions.invoke('complete-address', {
        body: { address: formData.address }
      });

      if (completionError) throw completionError;

      if (!completionData.completedAddress) {
        toast.error('ไม่สามารถเติมที่อยู่ได้');
        return;
      }

      const completedAddress = completionData.completedAddress;
      console.log('✓ Completed address:', completedAddress);

      // Step 2: Geocode the completed address
      const { data: geoData, error: geoError } = await supabase.functions.invoke('geocode-address', {
        body: { address: completedAddress }
      });

      if (geoError) {
        // Geocoding failed, but we still have the completed address
        setFormData({ ...formData, address: completedAddress });
        toast.success('เติมที่อยู่สำเร็จ', {
          description: 'แต่ไม่สามารถหาพิกัดได้ กรุณาใส่พิกัดเอง'
        });
        return;
      }

      // Step 3: Update formData with both completed address and coordinates
      if (geoData?.success && geoData.lat && geoData.lng) {
        setFormData({
          ...formData,
          address: completedAddress,
          location_lat: String(geoData.lat),
          location_long: String(geoData.lng),
          map_link: geoData.map_link
        });
        console.log('✓ Geocoded:', geoData.lat, geoData.lng);
        toast.success('เติมที่อยู่และหาพิกัดสำเร็จ', {
          description: `พิกัด: ${geoData.lat}, ${geoData.lng}`
        });
      } else {
        // Geocoding didn't succeed, but we have the completed address
        setFormData({ ...formData, address: completedAddress });
        toast.success('เติมที่อยู่สำเร็จ', {
          description: 'แต่ไม่สามารถหาพิกัดได้ กรุณาใส่พิกัดเอง'
        });
      }
    } catch (err) {
      console.error('Address completion error:', err);
      toast.error('ไม่สามารถเติมที่อยู่ได้', {
        description: 'กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setIsCompletingAddress(false);
    }
  };

  const performSave = async () => {
    if (!formData) return;

    setIsSaving(true);

    try {
      // Parse and format phone numbers
      const phones = phoneInput
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => formatPhoneNumber(p));

      // Validate and parse last_contact_at - only accept valid datetime format
      let validLastContact = null;
      if (formData.last_contact_at && formData.last_contact_at.trim()) {
        const parsed = new Date(formData.last_contact_at);
        if (!isNaN(parsed.getTime())) {
          validLastContact = formData.last_contact_at;
        }
      }

      // Try to get coordinates - priority order:
      // 1. Existing lat/long
      // 2. Parse map_link if present
      // 3. Geocode address if present
      let finalLat = formData.location_lat ? parseFloat(formData.location_lat) : null;
      let finalLng = formData.location_long ? parseFloat(formData.location_long) : null;
      let finalMapLink = formData.map_link || null;

      // Generate embedding for the report
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
        'generate-embedding',
        { body: { text: formData.raw_message } }
      );

      const dataToSave = {
        ...formData,
        name: formData.name && formData.name !== '-' ? formData.name : 'ไม่ระบุชื่อ',
        phone: phones,
        location_lat: finalLat,
        location_long: finalLng,
        map_link: finalMapLink,
        last_contact_at: validLastContact,
        embedding: embeddingError ? null : embeddingData.embedding,
        number_of_patients: formData.number_of_patients || 0,
        number_of_infants: formData.number_of_infants || 0,
        help_categories: formData.help_categories || [],
        // Add LINE user data if logged in
        line_user_id: isLoggedIn && profile ? profile.userId : null,
        line_display_name: isLoggedIn && profile ? profile.displayName : null,
      };

      const { error } = await supabase.from('reports').insert([dataToSave]);

      if (error) {
        throw error;
      }

      // Check if there are more reports to review
      if (currentIndex < reports.length - 1) {
        // Move to next report
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setFormData(reports[nextIndex]);
        setPhoneInput(reports[nextIndex].phone?.join(', ') || '');
        
        toast.success('ขอบคุณค่ะ ข้อมูลได้ถูกบันทึกแล้ว', {
          description: `เหลืออีก ${reports.length - nextIndex} รายการ`
        });
      } else {
        // All done
        toast.success('ขอบคุณค่ะ ข้อมูลได้ถูกบันทึกแล้ว', {
          description: `บันทึกทั้งหมด ${reports.length} รายการเรียบร้อย`
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('ไม่สามารถบันทึกได้', {
        description: err instanceof Error ? err.message : 'กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    // Check if user is logged in (either via LINE or email/password)
    const isUserLoggedIn = isLoggedIn || user;

    if (!isUserLoggedIn) {
      // Show login dialog
      setShowLoginDialog(true);
      return;
    }

    // Proceed with save
    await proceedWithSave();
  };

  const proceedWithSave = async () => {
    if (!formData) return;

    setIsSaving(true);

    try {
      // Check for duplicates first
      const foundDuplicates = await checkForDuplicates(formData.raw_message);

      if (foundDuplicates.length > 0) {
        // Duplicate found - update the existing record's updated_at
        console.log('Duplicate detected, updating existing record timestamp');
        
        const duplicateId = foundDuplicates[0].id;
        const { error: updateError } = await supabase
          .from('reports')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', duplicateId);

        if (updateError) {
          console.error('Error updating duplicate:', updateError);
        }
        
        // Move to next report if in multi-report mode
        if (reports.length > 1 && currentIndex < reports.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setFormData(reports[currentIndex + 1]);
          setPhoneInput(reports[currentIndex + 1].phone?.join(', ') || '');
          toast.success('ขอบคุณค่ะ ข้อมูลได้ถูกบันทึกแล้ว');
        } else {
          // Last report or single report
          toast.success('ขอบคุณค่ะ ข้อมูลได้ถูกบันทึกแล้ว');
          navigate('/dashboard');
        }
      } else {
        // No duplicate - save the record
        await performSave();
      }
    } catch (err) {
      console.error('Error during save:', err);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWithoutLogin = async () => {
    setShowLoginDialog(false);
    await proceedWithSave();
  };

  const handleGoToLogin = () => {
    // Save current state to navigate back after login
    sessionStorage.setItem('pendingReview', JSON.stringify({ formData, reports, currentIndex, phoneInput }));
    navigate('/auth', { state: { from: '/review' } });
  };

  if (!formData) {
    return null;
  }

  const urgencyColors = [
    'urgency-badge-1',
    'urgency-badge-2',
    'urgency-badge-3',
    'urgency-badge-4',
    'urgency-badge-5',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปกรอกใหม่
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Message Display */}
          <Card className="shadow-lg lg:sticky lg:top-6 h-fit">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ข้อความต้นฉบับ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
                {formData.raw_message}
              </div>
            </CardContent>
          </Card>

          {/* Extraction Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">ข้อมูลที่แยกได้</CardTitle>
                  {reports.length > 1 && (
                    <Badge variant="outline" className="text-sm">
                      รายการที่ {currentIndex + 1}/{reports.length}
                    </Badge>
                  )}
                </div>
                <Badge className={urgencyColors[formData.urgency_level - 1]}>
                  เร่งด่วนระดับ {formData.urgency_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก คุณสามารถแก้ไขได้ทุกช่อง
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reporter">ผู้รายงาน/แจ้งเรื่อง</Label>
                <Input
                  id="reporter"
                  value={formData.reporter_name || '-'}
                  onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                  placeholder="-"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastContact">วันเวลาติดต่อล่าสุด</Label>
                <Input
                  id="lastContact"
                  type="datetime-local"
                  value={formData.last_contact_at || ''}
                  onChange={(e) => setFormData({ ...formData, last_contact_at: e.target.value })}
                  placeholder="-"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ</Label>
                <Input
                  id="name"
                  value={formData.name || '-'}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="-"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname">นามสกุล</Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="address">ที่อยู่</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCompleteAddress}
                  disabled={isCompletingAddress || !formData.address || formData.address === '-'}
                >
                  {isCompletingAddress ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      กำลังเติม...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      เติมที่อยู่ด้วย AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="address"
                value={formData.address || '-'}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                placeholder="-"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ (คั่นด้วยจุลภาค)</Label>
              <Input
                id="phone"
                value={phoneInput || '-'}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="-"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_lat">ละติจูด</Label>
                {!formData.raw_message?.match(/(maps\.google\.com|goo\.gl|google\.com\/maps|maps\.app\.goo\.gl)/i) ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            id="location_lat"
                            value={formData.location_lat || '-'}
                            onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                            placeholder="-"
                            className="border-destructive/50 hover:border-destructive focus:border-destructive pr-8"
                          />
                          <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                        <p className="font-medium">⚠️ Geocoding อาจมีความคลาดเคลื่อน</p>
                        <p className="text-xs">กรุณาตรวจสอบพิกัดให้แน่ใจค่ะ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Input
                    id="location_lat"
                    value={formData.location_lat || '-'}
                    onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                    placeholder="-"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_long">ลองติจูด</Label>
                {!formData.raw_message?.match(/(maps\.google\.com|goo\.gl|google\.com\/maps|maps\.app\.goo\.gl)/i) ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            id="location_long"
                            value={formData.location_long || '-'}
                            onChange={(e) => setFormData({ ...formData, location_long: e.target.value })}
                            placeholder="-"
                            className="border-destructive/50 hover:border-destructive focus:border-destructive pr-8"
                          />
                          <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                        <p className="font-medium">⚠️ Geocoding อาจมีความคลาดเคลื่อน</p>
                        <p className="text-xs">กรุณาตรวจสอบพิกัดให้แน่ใจค่ะ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Input
                    id="location_long"
                    value={formData.location_long || '-'}
                    onChange={(e) => setFormData({ ...formData, location_long: e.target.value })}
                    placeholder="-"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="map_link">ลิงก์ Google Maps</Label>
              {!formData.raw_message?.match(/(maps\.google\.com|goo\.gl|google\.com\/maps|maps\.app\.goo\.gl)/i) ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Input
                          id="map_link"
                          value={formData.map_link || '-'}
                          onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
                          placeholder="https://maps.google.com/... หรือ https://goo.gl/maps/..."
                          className="border-destructive/50 hover:border-destructive focus:border-destructive pr-8"
                        />
                        <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                      <p className="font-medium">⚠️ Geocoding อาจมีความคลาดเคลื่อน</p>
                      <p className="text-xs">กรุณาตรวจสอบพิกัดให้แน่ใจค่ะ</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Input
                  id="map_link"
                  value={formData.map_link || '-'}
                  onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
                  placeholder="https://maps.google.com/... หรือ https://goo.gl/maps/..."
                />
              )}
            </div>

            <div className="space-y-4">
              <Label>จำนวนผู้ประสบภัย</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults" className="text-sm text-muted-foreground">ผู้ใหญ่</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="0"
                    value={formData.number_of_adults}
                    onChange={(e) => setFormData({ ...formData, number_of_adults: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children" className="text-sm text-muted-foreground">เด็ก</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={formData.number_of_children}
                    onChange={(e) => setFormData({ ...formData, number_of_children: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="infants" className="text-sm text-muted-foreground">ทารก</Label>
                  <Input
                    id="infants"
                    type="number"
                    min="0"
                    value={formData.number_of_infants || 0}
                    onChange={(e) => setFormData({ ...formData, number_of_infants: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seniors" className="text-sm text-muted-foreground">ผู้สูงอายุ</Label>
                  <Input
                    id="seniors"
                    type="number"
                    min="0"
                    value={formData.number_of_seniors}
                    onChange={(e) => setFormData({ ...formData, number_of_seniors: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patients" className="text-sm text-muted-foreground">ผู้ป่วย</Label>
                  <Input
                    id="patients"
                    type="number"
                    min="0"
                    value={formData.number_of_patients || 0}
                    onChange={(e) => setFormData({ ...formData, number_of_patients: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="health">ภาวะสุขภาพ</Label>
              <Textarea
                id="health"
                value={formData.health_condition || '-'}
                onChange={(e) => setFormData({ ...formData, health_condition: e.target.value })}
                rows={2}
                placeholder="-"
              />
            </div>

            <div className="space-y-2">
              <Label>ประเภทความช่วยเหลือที่ต้องการ</Label>
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
                {[
                  { id: 'drowning', label: 'จมน้ำ' },
                  { id: 'trapped', label: 'ติดขัง' },
                  { id: 'unreachable', label: 'ติดต่อไม่ได้' },
                  { id: 'water', label: 'ขาดน้ำดื่ม' },
                  { id: 'food', label: 'ขาดอาหาร' },
                  { id: 'electricity', label: 'ขาดไฟฟ้า' },
                  { id: 'shelter', label: 'ต้องการที่พักพิง' },
                  { id: 'medical', label: 'คนเจ็บ/ต้องการรักษา' },
                  { id: 'medicine', label: 'ขาดยา' },
                  { id: 'evacuation', label: 'ต้องการอพยพ' },
                  { id: 'missing', label: 'คนหาย' },
                  { id: 'clothes', label: 'เสื้อผ้า' },
                  { id: 'other', label: 'อื่นๆ' },
                ].map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={formData.help_categories?.includes(category.id) || false}
                      onCheckedChange={(checked) => {
                        const current = formData.help_categories || [];
                        const updated = checked
                          ? [...current, category.id]
                          : current.filter((c) => c !== category.id);
                        setFormData({ ...formData, help_categories: updated });
                      }}
                    />
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="help">รายละเอียดความช่วยเหลือเพิ่มเติม</Label>
              <Textarea
                id="help"
                value={formData.help_needed || '-'}
                onChange={(e) => setFormData({ ...formData, help_needed: e.target.value })}
                rows={2}
                placeholder="-"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional">ข้อมูลเพิ่มเติม</Label>
              <Textarea
                id="additional"
                value={formData.additional_info || '-'}
                onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                rows={3}
                placeholder="-"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">ระดับความเร่งด่วน</Label>
              <select
                id="urgency"
                value={formData.urgency_level}
                onChange={(e) => setFormData({ ...formData, urgency_level: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="1">1 - ยังไม่โดนน้ำ / แจ้งเตือน</option>
                <option value="2">2 - ผู้ใหญ่ทั้งหมด น้ำท่วมชั้นล่าง (ไม่มีเด็ก/ผู้สูงอายุ/ทารก/ผู้ป่วย)</option>
                <option value="3">3 - มีเด็ก หรือผู้สูงอายุ หรือน้ำถึงชั้นสอง</option>
                <option value="4">4 - เด็กเล็กมาก หรือทารก หรือมีคนไข้/ป่วยติดเตียง หรือคนช่วยตัวเองไม่ได้</option>
                <option value="5">5 - วิกฤต: น้ำถึงหลังคา/ติดบนหลังคา ทารกในอันตราย คนไข้อาการหนัก มีคนตาย</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    ยืนยันและบันทึกข้อมูล
                  </>
                )}
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              ต้องการรับการแจ้งเตือนหรือไม่?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="text-base">
                หากคุณเข้าสู่ระบบก่อนบันทึกข้อมูล คุณจะได้รับ:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>การแจ้งเตือนเมื่อมีการอัปเดตข้อมูลผู้ประสบภัย</li>
                <li>สามารถติดตามและแก้ไขข้อมูลที่คุณบันทึกได้</li>
                <li>เข้าถึง API สำหรับการพัฒนาต่อยอด</li>
              </ul>
              <p className="text-sm text-muted-foreground pt-2">
                หรือคุณสามารถบันทึกข้อมูลโดยไม่ต้องเข้าสู่ระบบได้เลย
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleSaveWithoutLogin} className="sm:order-2">
              บันทึกโดยไม่เข้าสู่ระบบ
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToLogin} className="sm:order-1">
              <LogIn className="mr-2 h-4 w-4" />
              เข้าสู่ระบบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Review;