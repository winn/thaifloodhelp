import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Users,
  Baby,
  UserRound,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MapPin,
  Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Report } from "@/types/report";
import ReportHeatmap from "@/components/ReportHeatmap";

interface Stats {
  total: number;
  totalPeople: number;
  critical: number;
  high: number;
  needsAttention: number;
  pending: number;
  processed: number;
  completed: number;
  adults: number;
  children: number;
  infants: number;
  seniors: number;
  patients: number;
  urgencyLevel1: number;
  urgencyLevel2: number;
  urgencyLevel3: number;
  urgencyLevel4: number;
  urgencyLevel5: number;
}

const Stats = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalPeople: 0,
    critical: 0,
    high: 0,
    needsAttention: 0,
    pending: 0,
    processed: 0,
    completed: 0,
    adults: 0,
    children: 0,
    infants: 0,
    seniors: 0,
    patients: 0,
    urgencyLevel1: 0,
    urgencyLevel2: 0,
    urgencyLevel3: 0,
    urgencyLevel4: 0,
    urgencyLevel5: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchReportsForHeatmap();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch aggregated statistics using multiple queries in parallel
      const [
        { count: total },
        { data: statusCounts },
        { data: urgencyCounts },
      ] = await Promise.all([
        // Total count
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        // Status counts
        supabase.from('reports').select('status'),
        // Urgency level counts
        supabase.from('reports').select('urgency_level'),
      ]);

      // Calculate status counts
      const statusCountMap = (statusCounts || []).reduce((acc: Record<string, number>, r: { status: string | null }) => {
        const status = r.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Calculate urgency counts
      const urgencyCountMap = (urgencyCounts || []).reduce((acc: Record<number, number>, r: { urgency_level: number }) => {
        acc[r.urgency_level] = (acc[r.urgency_level] || 0) + 1;
        return acc;
      }, {});

      // Fetch individual columns for summing (Supabase doesn't support aggregate functions in select)
      const { data: peopleData } = await supabase
        .from('reports')
        .select('number_of_adults, number_of_children, number_of_infants, number_of_seniors, number_of_patients');

      const calculatedStats = (peopleData || []).reduce((acc, r) => ({
        adults: acc.adults + (r.number_of_adults || 0),
        children: acc.children + (r.number_of_children || 0),
        infants: acc.infants + (r.number_of_infants || 0),
        seniors: acc.seniors + (r.number_of_seniors || 0),
        patients: acc.patients + (r.number_of_patients || 0),
      }), { adults: 0, children: 0, infants: 0, seniors: 0, patients: 0 });

      const totalPeople = calculatedStats.adults + calculatedStats.children + calculatedStats.infants + calculatedStats.seniors;

      setStats({
        total: total || 0,
        totalPeople,
        critical: (urgencyCountMap[4] || 0) + (urgencyCountMap[5] || 0),
        high: urgencyCountMap[3] || 0,
        needsAttention: (urgencyCountMap[3] || 0) + (urgencyCountMap[4] || 0) + (urgencyCountMap[5] || 0),
        pending: statusCountMap['pending'] || 0,
        processed: statusCountMap['processed'] || 0,
        completed: statusCountMap['completed'] || 0,
        adults: calculatedStats.adults,
        children: calculatedStats.children,
        infants: calculatedStats.infants,
        seniors: calculatedStats.seniors,
        patients: calculatedStats.patients,
        urgencyLevel1: urgencyCountMap[1] || 0,
        urgencyLevel2: urgencyCountMap[2] || 0,
        urgencyLevel3: urgencyCountMap[3] || 0,
        urgencyLevel4: urgencyCountMap[4] || 0,
        urgencyLevel5: urgencyCountMap[5] || 0,
      });
    } catch (err) {
      console.error('Fetch stats error:', err);
      toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reports for heatmap (needs help_categories, urgency_level, and people counts)
  const fetchReportsForHeatmap = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, urgency_level, help_categories, number_of_adults, number_of_children, number_of_infants, number_of_seniors, number_of_patients');

      if (error) throw error;
      setReports(data as Report[] || []);
    } catch (err) {
      console.error('Fetch heatmap data error:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchReportsForHeatmap()]);
    setIsRefreshing(false);
    toast.success('รีเฟรชข้อมูลสำเร็จ');
  };

  const vulnerableCount = stats.infants + stats.children + stats.seniors + stats.patients;
  const hasCompletedCases = stats.completed > 0;
  const hasPendingWork = stats.pending > 0 || stats.processed > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">สถานการณ์ภาพรวม</h1>
            <p className="text-muted-foreground mt-1">ข้อมูลผู้ประสบภัยที่ต้องการความช่วยเหลือ</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats.total === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">ยังไม่มีรายงานในขณะนี้</h3>
              <p className="text-muted-foreground">เมื่อมีผู้ประสบภัยแจ้งความต้องการความช่วยเหลือ ข้อมูลจะแสดงที่นี่</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total People Affected */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ผู้ประสบภัยทั้งหมด</p>
                      <p className="text-4xl font-bold mt-2">{stats.totalPeople.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">จาก {stats.total} รายการแจ้ง</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerable Groups */}
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">กลุ่มเปราะบาง</p>
                      <p className="text-4xl font-bold text-orange-600 mt-2">{vulnerableCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ทารก เด็ก ผู้สูงอายุ ผู้ป่วย
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critical Cases */}
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ต้องการความช่วยเหลือเร่งด่วน</p>
                      <p className="text-4xl font-bold text-destructive mt-2">{stats.critical.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">ระดับความเร่งด่วนสูงสุด (4-5)</p>
                    </div>
                    <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Section - Only show if there's meaningful data */}
            {(hasPendingWork || hasCompletedCases) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">สถานะการดำเนินการ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.pending > 0 && (
                      <div className="text-center p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                        <p className="text-sm text-muted-foreground mt-1">รอดำเนินการ</p>
                      </div>
                    )}
                    {stats.processed > 0 && (
                      <div className="text-center p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{stats.processed}</p>
                        <p className="text-sm text-muted-foreground mt-1">กำลังดำเนินการ</p>
                      </div>
                    )}
                    {stats.completed > 0 && (
                      <div className="text-center p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        <p className="text-sm text-muted-foreground mt-1">ดำเนินการเสร็จสิ้น</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Demographics Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ผู้ประสบภัยแยกตามกลุ่ม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <UserRound className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.adults.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">ผู้ใหญ่</p>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                        <Baby className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.children.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">เด็ก</p>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 bg-pink-500/10 rounded-full flex items-center justify-center">
                        <Baby className="h-5 w-5 text-pink-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.infants.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">ทารก</p>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 bg-slate-500/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-slate-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.seniors.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">ผู้สูงอายุ</p>
                  </div>

                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.patients.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">ผู้ป่วย</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Urgency Distribution - Focus on high priority cases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ระดับความเร่งด่วน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((level) => {
                    const urgencyKey = `urgencyLevel${level}` as keyof Stats;
                    const count = stats[urgencyKey] as number;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                    // Skip levels with 0 count
                    if (count === 0) return null;

                    const levelConfig = {
                      5: { color: 'bg-red-500', label: 'วิกฤติ - ต้องการความช่วยเหลือทันที', textColor: 'text-red-600' },
                      4: { color: 'bg-orange-500', label: 'เร่งด่วนมาก', textColor: 'text-orange-600' },
                      3: { color: 'bg-amber-500', label: 'เร่งด่วน', textColor: 'text-amber-600' },
                      2: { color: 'bg-yellow-500', label: 'ปานกลาง', textColor: 'text-yellow-600' },
                      1: { color: 'bg-green-500', label: 'ไม่เร่งด่วน', textColor: 'text-green-600' },
                    };

                    const config = levelConfig[level as keyof typeof levelConfig];

                    return (
                      <div key={level}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            ระดับ {level} - {config.label}
                          </span>
                          <span className={`text-sm font-semibold ${config.textColor}`}>
                            {count} รายการ ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${config.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Heatmap - Show where help is needed */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">พื้นที่ที่ต้องการความช่วยเหลือ</CardTitle>
                  </div>
                  {showHeatmap ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {showHeatmap && (
                <CardContent>
                  <ReportHeatmap reports={reports} />
                </CardContent>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
