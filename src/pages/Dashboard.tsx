import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowLeft,
  Users,
  Baby,
  UserRound,
  Filter,
  Loader2,
  ChevronDown,
  ChevronRight,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QueryBot from "@/components/QueryBot";
import { Checkbox } from "@/components/ui/checkbox";
import ReportHeatmap from "@/components/ReportHeatmap";
import { PhoneList } from "@/components/PhoneList";

interface Report {
  id: string;
  name: string;
  lastname: string;
  reporter_name: string;
  address: string;
  phone: string[];
  number_of_adults: number;
  number_of_children: number;
  number_of_infants: number;
  number_of_seniors: number;
  number_of_patients: number;
  health_condition: string;
  help_needed: string;
  help_categories: string[];
  additional_info: string;
  urgency_level: number;
  status: string;
  created_at: string;
  updated_at: string;
  raw_message: string;
  location_lat: number | null;
  location_long: number | null;
  map_link: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [forceDeepSearch, setForceDeepSearch] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (!sortColumn) return 0;

    const aVal = a[sortColumn as keyof Report] as number || 0;
    const bVal = b[sortColumn as keyof Report] as number || 0;

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const exportToCSV = () => {
    if (filteredReports.length === 0) {
      toast.error('ไม่มีข้อมูลให้ส่งออก');
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        'ID',
        'ชื่อ',
        'นามสกุล',
        'ผู้รายงาน',
        'ที่อยู่',
        'เบอร์โทรศัพท์',
        'จำนวนผู้ใหญ่',
        'จำนวนเด็ก',
        'จำนวนทารก',
        'จำนวนผู้สูงอายุ',
        'จำนวนผู้ป่วย',
        'อาการ/สภาพสุขภาพ',
        'ความช่วยเหลือที่ต้องการ',
        'ประเภทความช่วยเหลือ',
        'ข้อมูลเพิ่มเติม',
        'ระดับความเร่งด่วน',
        'สถานะ',
        'ตำแหน่ง (Latitude)',
        'ตำแหน่ง (Longitude)',
        'วันที่บันทึก',
        'แก้ไขล่าสุด',
      ];

      // Convert data to CSV rows
      const csvRows = filteredReports.map((report) => {
        return [
          report.id,
          report.name || '',
          report.lastname || '',
          report.reporter_name || '',
          `"${(report.address || '').replace(/"/g, '""')}"`, // Escape quotes
          `"${report.phone?.join(', ') || ''}"`,
          report.number_of_adults || 0,
          report.number_of_children || 0,
          report.number_of_infants || 0,
          report.number_of_seniors || 0,
          report.number_of_patients || 0,
          `"${(report.health_condition || '').replace(/"/g, '""')}"`,
          `"${(report.help_needed || '').replace(/"/g, '""')}"`,
          `"${report.help_categories?.join(', ') || ''}"`,
          `"${(report.additional_info || '').replace(/"/g, '""')}"`,
          report.urgency_level,
          report.status || '',
          report.location_lat || '',
          report.location_long || '',
          new Date(report.created_at).toLocaleString('th-TH'),
          new Date(report.updated_at).toLocaleString('th-TH'),
        ].join(',');
      });

      // Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `flood_reports_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('ส่งออกข้อมูลสำเร็จ', {
        description: `ส่งออก ${filteredReports.length} รายการ`,
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('ไม่สามารถส่งออกข้อมูลได้', {
        description: 'กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const searchReports = async () => {
      if (!searchTerm.trim()) {
        // No search term - show all reports with filters
        let filtered = reports;

        // Apply urgency filter
        if (urgencyFilter !== null) {
          filtered = filtered.filter((r) => r.urgency_level === urgencyFilter);
        }

        // Apply help category filters
        if (selectedCategories.length > 0) {
          filtered = filtered.filter((r) =>
            selectedCategories.some(cat => r.help_categories?.includes(cat))
          );
        }

        setFilteredReports(filtered);
        return;
      }

      // Perform vector-based semantic search
      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('search-reports', {
          body: {
            query: searchTerm,
            urgencyFilter: urgencyFilter,
            limit: 100,
            forceSemanticSearch: forceDeepSearch
          }
        });

        if (error) throw error;

        let searchResults = data.reports || [];

        // Apply help category filters to search results
        if (selectedCategories.length > 0) {
          searchResults = searchResults.filter((r: Report) =>
            selectedCategories.some(cat => r.help_categories?.includes(cat))
          );
        }

        setFilteredReports(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        toast.error('ไม่สามารถค้นหาได้', {
          description: 'กรุณาลองใหม่อีกครั้ง'
        });
        // Fallback to showing all reports
        let filtered = reports;
        if (urgencyFilter !== null) {
          filtered = filtered.filter((r) => r.urgency_level === urgencyFilter);
        }
        if (selectedCategories.length > 0) {
          filtered = filtered.filter((r) =>
            selectedCategories.some(cat => r.help_categories?.includes(cat))
          );
        }
        setFilteredReports(filtered);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchReports();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [reports, searchTerm, urgencyFilter, selectedCategories, forceDeepSearch]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setReports(data || []);
      setFilteredReports(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadgeClass = (level: number) => {
    return `urgency-badge-${level}`;
  };

  const toggleRowExpansion = (reportId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const stats = {
    total: reports.length,
    children: reports.reduce((sum, r) => sum + r.number_of_children, 0),
    seniors: reports.reduce((sum, r) => sum + r.number_of_seniors, 0),
    critical: reports.filter((r) => r.urgency_level >= 4).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าแรก
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">ข้อมูลผู้ประสบภัยทั้งหมด</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">รายการทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">เด็กทั้งหมด</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.children}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">ผู้สูงอายุ</CardTitle>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.seniors}</div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">เร่งด่วนสูง (4-5)</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="ค้นหาอัจฉริยะ: ชื่อ, ที่อยู่, เบอร์โทร, อาการ, ความช่วยเหลือ... (ใช้ AI)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <Button
                  variant={forceDeepSearch ? "default" : "outline"}
                  onClick={() => setForceDeepSearch(!forceDeepSearch)}
                  className="whitespace-nowrap"
                >
                  🔍 Deep Search (AI)
                </Button>
              </div>

              {/* Urgency Filter */}
              <div className="space-y-2">
                <div className="text-sm font-medium">ระดับความเร่งด่วน</div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={urgencyFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUrgencyFilter(null)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    ทั้งหมด
                  </Button>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      variant={urgencyFilter === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUrgencyFilter(level)}
                      className={urgencyFilter === level ? getUrgencyBadgeClass(level) : ""}
                    >
                      ระดับ {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Help Category Filter */}
              <div className="space-y-2">
                <div className="text-sm font-medium">ประเภทความช่วยเหลือ</div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'drowning', label: 'จมน้ำ', icon: '🌊' },
                    { id: 'trapped', label: 'ติดขัง', icon: '🚪' },
                    { id: 'unreachable', label: 'ติดต่อไม่ได้', icon: '📵' },
                    { id: 'water', label: 'ขาดน้ำดื่ม', icon: '💧' },
                    { id: 'food', label: 'ขาดอาหาร', icon: '🍚' },
                    { id: 'electricity', label: 'ขาดไฟฟ้า', icon: '⚡' },
                    { id: 'shelter', label: 'ที่พักพิง', icon: '🏠' },
                    { id: 'medical', label: 'ต้องการรักษา', icon: '🏥' },
                    { id: 'medicine', label: 'ขาดยา', icon: '💊' },
                    { id: 'evacuation', label: 'อพยพ', icon: '🚁' },
                    { id: 'missing', label: 'คนหาย', icon: '🔍' },
                    { id: 'clothes', label: 'เสื้อผ้า', icon: '👕' },
                  ].map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${selectedCategories.includes(category.id)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                        }`}
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(category.id)
                            ? prev.filter((c) => c !== category.id)
                            : [...prev, category.id]
                        );
                      }}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => { }}
                      />
                      <span className="text-sm flex items-center gap-1">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Heatmap */}
        <ReportHeatmap reports={filteredReports} />

        <div className="flex justify-end">
          <Button
            onClick={exportToCSV}
            variant="outline"
            disabled={filteredReports.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            ส่งออก CSV ({filteredReports.length} รายการ)
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                ไม่พบข้อมูล
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('urgency_level')}
                      >
                        <div className="flex items-center gap-1">
                          ความเร่งด่วน
                          {sortColumn === 'urgency_level' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : <ArrowUpDown className="h-4 w-4 opacity-30" />}
                        </div>
                      </TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>ที่อยู่</TableHead>
                      <TableHead>เบอร์โทร</TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('number_of_adults')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          ผู้ใหญ่
                          {sortColumn === 'number_of_adults' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : <ArrowUpDown className="h-4 w-4 opacity-30" />}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('number_of_children')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          เด็ก
                          {sortColumn === 'number_of_children' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : <ArrowUpDown className="h-4 w-4 opacity-30" />}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('number_of_infants')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          ทารก
                          {sortColumn === 'number_of_infants' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : <ArrowUpDown className="h-4 w-4 opacity-30" />}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('number_of_seniors')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          ผู้สูงอายุ
                          {sortColumn === 'number_of_seniors' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : <ArrowUpDown className="h-4 w-4 opacity-30" />}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-center cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('number_of_patients')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          ผู้ป่วย
                          {sortColumn === 'number_of_patients' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : <ArrowUpDown className="h-4 w-4 opacity-30" />}
                        </div>
                      </TableHead>
                      <TableHead>ความช่วยเหลือ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedReports.map((report) => {
                      const isExpanded = expandedRows.has(report.id);
                      return (
                        <>
                          <TableRow
                            key={report.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRowExpansion(report.id)}
                          >
                            <TableCell>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getUrgencyBadgeClass(report.urgency_level)}>
                                {report.urgency_level}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {report.name} {report.lastname}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">{report.address}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <PhoneList phones={report.phone} />
                            </TableCell>
                            <TableCell className="text-center">{report.number_of_adults}</TableCell>
                            <TableCell className="text-center">{report.number_of_children}</TableCell>
                            <TableCell className="text-center">{report.number_of_infants || 0}</TableCell>
                            <TableCell className="text-center">{report.number_of_seniors}</TableCell>
                            <TableCell className="text-center">{report.number_of_patients || 0}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {report.help_needed || '-'}
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow key={`${report.id}-expanded`}>
                              <TableCell colSpan={11} className="bg-muted/30 p-6">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">ข้อมูลทั่วไป</h4>
                                      <div className="space-y-1 text-sm">
                                         <p className="break-words"><span className="font-medium">ชื่อ:</span> {report.name} {report.lastname}</p>
                                         <p className="break-words"><span className="font-medium">ผู้รายงาน:</span> {report.reporter_name || '-'}</p>
                                         <p className="break-words"><span className="font-medium">ที่อยู่:</span> {report.address || '-'}</p>
                                         <div className="break-words"><span className="font-medium">เบอร์โทร:</span> <PhoneList phones={report.phone || []} /></div>
                                         <p className="break-words"><span className="font-medium">ตำแหน่ง:</span> {report.location_lat && report.location_long ? `${report.location_lat}, ${report.location_long}` : '-'}</p>
                                         {report.map_link && (
                                           <p className="break-words">
                                             <span className="font-medium">Google Maps:</span>{' '}
                                             <a 
                                               href={report.map_link} 
                                               target="_blank" 
                                               rel="noopener noreferrer"
                                               className="text-primary hover:underline"
                                             >
                                               เปิดแผนที่ 🗺️
                                             </a>
                                           </p>
                                         )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">จำนวนผู้ประสบภัย</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">ผู้ใหญ่:</span> {report.number_of_adults || 0}</p>
                                        <p><span className="font-medium">เด็ก:</span> {report.number_of_children || 0}</p>
                                        <p><span className="font-medium">ทารก:</span> {report.number_of_infants || 0}</p>
                                        <p><span className="font-medium">ผู้สูงอายุ:</span> {report.number_of_seniors || 0}</p>
                                        <p><span className="font-medium">ผู้ป่วย:</span> {report.number_of_patients || 0}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">สุขภาพและความช่วยเหลือ</h4>
                                      <div className="space-y-1 text-sm">
                                        <p className="break-words"><span className="font-medium">อาการ:</span> {report.health_condition || '-'}</p>
                                        <p className="break-words"><span className="font-medium">ความช่วยเหลือ:</span> {report.help_needed || '-'}</p>
                                        <p className="break-words"><span className="font-medium">ประเภทความช่วยเหลือ:</span> {report.help_categories?.length > 0 ? report.help_categories.join(', ') : '-'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Metadata</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">สถานะ:</span> {report.status || '-'}</p>
                                        <p><span className="font-medium">ระดับความเร่งด่วน:</span> {report.urgency_level}</p>
                                        <p className="break-words"><span className="font-medium">วันที่บันทึก:</span> {new Date(report.created_at).toLocaleString('th-TH')}</p>
                                        <p className="break-words"><span className="font-medium">แก้ไขล่าสุด:</span> {new Date(report.updated_at).toLocaleString('th-TH')}</p>
                                      </div>
                                    </div>
                                  </div>
                                  {report.additional_info && (
                                    <div>
                                      <h4 className="font-semibold mb-2">ข้อมูลเพิ่มเติม</h4>
                                      <p className="text-sm whitespace-pre-wrap break-words">{report.additional_info}</p>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold mb-2">ข้อความต้นฉบับ (Raw Data)</h4>
                                    <div className="bg-background rounded-md p-4 border max-w-full overflow-x-auto">
                                      <pre className="text-sm whitespace-pre-wrap break-words font-mono">{report.raw_message}</pre>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QueryBot />
    </div>
  );
};

export default Dashboard;