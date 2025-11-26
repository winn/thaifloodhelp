import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Users,
  AlertCircle,
  Calendar,
  Share2,
  Pencil,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhoneList } from "@/components/PhoneList";
import { EditReportDialog } from "@/components/EditReportDialog";
import type { Report } from "@/types/report";
import {
  formatCaseId,
  getUrgencyBadgeClass,
  getUrgencyLabel,
  getStatusLabel,
  getCategoryLabel,
  getTotalPeople,
  formatDate
} from "@/lib/reportUtils";

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `รายงานผู้ประสบภัย - ${report?.name} ${report?.lastname}`,
          text: `กรณี ${formatCaseId(id!)} - ต้องการความช่วยเหลือ`,
          url: url
        });
        toast.success('แชร์ลิงก์สำเร็จ');
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('คัดลอกลิงก์สำเร็จ', {
          description: 'ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว'
        });
      } catch (err) {
        toast.error('ไม่สามารถคัดลอกลิงก์ได้');
      }
    }
  };

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          toast.error('ไม่พบข้อมูลรายงาน');
          navigate('/dashboard');
          return;
        }

        setReport(data);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  const handleEditSuccess = () => {
    // Refresh report data
    const fetchReport = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setReport(data);
      }
    };

    fetchReport();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const totalPeople = getTotalPeople(report);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            แชร์
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            แก้ไข
          </Button>
        </div>

        {/* Case ID and Status */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Case ID:</span>
                  <span className="font-mono font-bold text-lg">{formatCaseId(report.id)}</span>
                </div>
                <CardTitle className="text-2xl">{report.name} {report.lastname}</CardTitle>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge className={getUrgencyBadgeClass(report.urgency_level)} variant="default">
                  ระดับความเร่งด่วน: {report.urgency_level}
                </Badge>
                <Badge variant="outline">
                  {getStatusLabel(report.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Alert for urgency */}
        {report.urgency_level >= 4 && (
          <div className="bg-destructive/10 border-2 border-destructive/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">กรณีเร่งด่วนสูง</h3>
                <p className="text-sm text-muted-foreground mt-1">{getUrgencyLabel(report.urgency_level)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                ข้อมูลติดต่อ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">ผู้รายงาน/แจ้งเรื่อง</p>
                <p className="font-medium">{report.reporter_name || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">เบอร์โทรศัพท์</p>
                {report.phone && report.phone.length > 0 ? (
                  <PhoneList phones={report.phone} />
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">ที่อยู่</p>
                <p className="font-medium break-words">{report.address || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                ตำแหน่งที่ตั้ง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.location_lat && report.location_long || report.map_link ? (
                <>
                  {report.location_lat && report.location_long && (
                    <div>
                      <p className="text-sm text-muted-foreground">พิกัด</p>
                      <p className="font-mono text-sm">
                        {report.location_lat}, {report.location_long}
                      </p>
                    </div>
                  )}

                  {report.map_link && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(report.map_link!, '_blank')}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      เปิด Google Maps
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">ไม่มีข้อมูลตำแหน่ง</p>
              )}
            </CardContent>
          </Card>

          {/* People Count */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                จำนวนผู้ประสบภัย ({totalPeople} คน)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ผู้ใหญ่</p>
                  <p className="text-2xl font-bold">{report.number_of_adults || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">เด็ก</p>
                  <p className="text-2xl font-bold">{report.number_of_children || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ทารก</p>
                  <p className="text-2xl font-bold">{report.number_of_infants || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ผู้สูงอายุ</p>
                  <p className="text-2xl font-bold">{report.number_of_seniors || 0}</p>
                </div>
                {report.number_of_patients > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">ผู้ป่วย/ต้องการรักษา</p>
                    <p className="text-2xl font-bold text-destructive">{report.number_of_patients}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                ข้อมูลเวลา
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">วันที่บันทึก</p>
                <p className="font-medium">{formatDate(report.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">แก้ไขล่าสุด</p>
                <p className="font-medium">{formatDate(report.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health and Help Needed */}
        <Card>
          <CardHeader>
            <CardTitle>ความต้องการความช่วยเหลือ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.help_categories && report.help_categories.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">ประเภทความช่วยเหลือ</p>
                <div className="flex flex-wrap gap-2">
                  {report.help_categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {getCategoryLabel(cat)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {report.health_condition && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">ภาวะสุขภาพ/อาการ</p>
                <p className="text-sm whitespace-pre-wrap break-words">{report.health_condition}</p>
              </div>
            )}

            {report.help_needed && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">รายละเอียดความช่วยเหลือ</p>
                <p className="text-sm whitespace-pre-wrap break-words">{report.help_needed}</p>
              </div>
            )}

            {report.additional_info && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">ข้อมูลเพิ่มเติม</p>
                <p className="text-sm whitespace-pre-wrap break-words">{report.additional_info}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Raw Message */}
        {report.raw_message && (
          <Card>
            <CardHeader>
              <CardTitle>ข้อความต้นฉบับ (Raw Data)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-4">
                <pre className="text-sm whitespace-pre-wrap break-words font-mono">{report.raw_message}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {report && (
        <EditReportDialog
          report={report}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default ReportDetail;
