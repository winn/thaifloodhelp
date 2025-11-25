import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExtractedReport {
  name: string;
  lastname: string;
  raw_message: string;
  reporter_name: string;
  last_contact_at: string;
  address: string;
  location_lat: string;
  location_long: string;
  phone: string[];
  number_of_adults: number;
  number_of_children: number;
  number_of_seniors: number;
  health_condition: string;
  help_needed: string;
  additional_info: string;
  urgency_level: number;
}

const SelectReports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ExtractedReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());

  useEffect(() => {
    const data = location.state?.reports;
    if (!data || data.length === 0) {
      toast.error('ไม่พบข้อมูล', { description: 'กรุณากรอกข้อมูลใหม่' });
      navigate('/');
      return;
    }
    setReports(data);
    // Select all by default
    setSelectedReports(new Set(data.map((_: any, i: number) => i)));
  }, [location, navigate]);

  const toggleReport = (index: number) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedReports(newSelected);
  };

  const handleContinue = () => {
    const selected = reports.filter((_, i) => selectedReports.has(i));
    if (selected.length === 0) {
      toast.error('กรุณาเลือกอย่างน้อย 1 รายการ');
      return;
    }
    navigate('/review', { state: { reports: selected } });
  };

  const urgencyColors = [
    'urgency-badge-1',
    'urgency-badge-2',
    'urgency-badge-3',
    'urgency-badge-4',
    'urgency-badge-5',
  ];

  const getTotalPeople = (report: ExtractedReport) => {
    return report.number_of_adults + report.number_of_children + report.number_of_seniors;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปกรอกใหม่
        </Button>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            AI พบข้อมูลผู้ประสบภัย <strong>{reports.length} รายการ</strong> จากข้อความที่ท่านป้อน กรุณาเลือกรายการที่ต้องการบันทึก
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-4">
          {reports.map((report, index) => (
            <Card 
              key={index} 
              className={`shadow-lg transition-all cursor-pointer ${
                selectedReports.has(index) ? 'border-primary border-2' : 'border-border'
              }`}
              onClick={() => toggleReport(index)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedReports.has(index)}
                      onCheckedChange={() => toggleReport(index)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">
                          {report.name || '(ไม่ระบุชื่อ)'} {report.lastname}
                        </CardTitle>
                        <Badge className={urgencyColors[report.urgency_level - 1]}>
                          เร่งด่วน {report.urgency_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span>รายการที่ {index + 1}</span>
                        {report.reporter_name && (
                          <>
                            <span>•</span>
                            <span>รายงานโดย: {report.reporter_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ที่อยู่:</span>
                    <p className="text-muted-foreground">{report.address || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium">เบอร์โทร:</span>
                    <p className="text-muted-foreground">
                      {report.phone.length > 0 ? report.phone.join(', ') : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm flex-wrap">
                  <div>
                    <span className="font-medium">จำนวนรวม:</span>{' '}
                    <span className="text-primary font-semibold">{getTotalPeople(report)} คน</span>
                  </div>
                  {report.number_of_adults > 0 && (
                    <div className="text-muted-foreground">
                      ผู้ใหญ่ {report.number_of_adults} คน
                    </div>
                  )}
                  {report.number_of_children > 0 && (
                    <div className="text-muted-foreground">
                      เด็ก {report.number_of_children} คน
                    </div>
                  )}
                  {report.number_of_seniors > 0 && (
                    <div className="text-muted-foreground">
                      ผู้สูงอายุ {report.number_of_seniors} คน
                    </div>
                  )}
                </div>

                {report.help_needed && (
                  <div className="text-sm">
                    <span className="font-medium">ต้องการ:</span>{' '}
                    <span className="text-primary">{report.help_needed}</span>
                  </div>
                )}

                {report.health_condition && (
                  <div className="text-sm">
                    <span className="font-medium">ภาวะสุขภาพ:</span>{' '}
                    <span className="text-muted-foreground">{report.health_condition}</span>
                  </div>
                )}

                {report.additional_info && (
                  <div className="text-sm">
                    <span className="font-medium">ข้อมูลเพิ่มเติม:</span>{' '}
                    <span className="text-muted-foreground">{report.additional_info}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
          <Button
            onClick={handleContinue}
            disabled={selectedReports.size === 0}
            size="lg"
            className="flex-1"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            ดำเนินการต่อ ({selectedReports.size} รายการ)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectReports;
