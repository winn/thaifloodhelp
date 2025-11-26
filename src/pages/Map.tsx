import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import InteractiveMap from '@/components/InteractiveMap';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import '../styles/map.css';

const Map = () => {
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [selectedUrgencyLevels, setSelectedUrgencyLevels] = useState<number[]>([
        1, 2, 3, 4, 5,
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    // Fetch all reports
    const { data: reports, isLoading, error } = useQuery({
        queryKey: ['reports'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Report[];
        },
    });

    useEffect(() => {
        if (error) {
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
                variant: 'destructive',
            });
        }
    }, [error, toast]);

    // Filter reports based on selected criteria
    useEffect(() => {
        if (!reports) {
            setFilteredReports([]);
            return;
        }

        let filtered = reports.filter((report) =>
            selectedUrgencyLevels.includes(report.urgency_level)
        );

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (report) =>
                    report.name?.toLowerCase().includes(query) ||
                    report.lastname?.toLowerCase().includes(query) ||
                    report.address?.toLowerCase().includes(query) ||
                    report.help_needed?.toLowerCase().includes(query)
            );
        }

        setFilteredReports(filtered);
    }, [reports, selectedUrgencyLevels, searchQuery]);

    const toggleUrgencyLevel = (level: number) => {
        setSelectedUrgencyLevels((prev) =>
            prev.includes(level)
                ? prev.filter((l) => l !== level)
                : [...prev, level].sort()
        );
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const reportsWithLocation = filteredReports.filter(
        (r) => r.location_lat !== null && r.location_long !== null
    );

    // Count all reports (not filtered) to show total counts regardless of checkbox selection
    const allReportsWithLocation = reports?.filter(
        (r) => r.location_lat !== null && r.location_long !== null
    ) || [];

    const urgencyCounts = {
        1: allReportsWithLocation.filter((r) => r.urgency_level === 1).length,
        2: allReportsWithLocation.filter((r) => r.urgency_level === 2).length,
        3: allReportsWithLocation.filter((r) => r.urgency_level === 3).length,
        4: allReportsWithLocation.filter((r) => r.urgency_level === 4).length,
        5: allReportsWithLocation.filter((r) => r.urgency_level === 5).length,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">กำลังโหลดแผนที่...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-4 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            แผนที่ผู้ประสบภัย
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        แสดงตำแหน่งผู้ประสบน้ำท่วม {reportsWithLocation.length} จุด
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
                {/* Sidebar Controls */}
                <Card className="lg:w-80 p-4 space-y-4 overflow-y-auto">
                    {/* Search */}
                    <div>
                        <Label className="text-sm font-semibold mb-2 block">ค้นหา</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="ชื่อ, ที่อยู่, ความช่วยเหลือ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-8"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Urgency Level Filter */}
                    <div>
                        <Label className="text-sm font-semibold mb-3 block">
                            ระดับความเร่งด่วน
                        </Label>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((level) => (
                                <div key={level} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`urgency-${level}`}
                                            checked={selectedUrgencyLevels.includes(level)}
                                            onCheckedChange={() => toggleUrgencyLevel(level)}
                                        />
                                        <Label
                                            htmlFor={`urgency-${level}`}
                                            className="cursor-pointer flex items-center gap-2"
                                        >
                                            <span
                                                className={`w-3 h-3 rounded-full`}
                                                style={{
                                                    backgroundColor:
                                                        level === 5
                                                            ? '#DC2626'
                                                            : level === 4
                                                                ? '#EA580C'
                                                                : level === 3
                                                                    ? '#CA8A04'
                                                                    : level === 2
                                                                        ? '#2563EB'
                                                                        : '#16A34A',
                                                }}
                                            />
                                            <span className="text-sm">Level {level}</span>
                                        </Label>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        ({urgencyCounts[level as keyof typeof urgencyCounts]})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="pt-4 border-t">
                        <Label className="text-sm font-semibold mb-2 block">สถิติ</Label>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">ทั้งหมด:</span>
                                <span className="font-semibold">{reports?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">มีตำแหน่ง:</span>
                                <span className="font-semibold">
                                    {reportsWithLocation.length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">แสดงบนแผนที่:</span>
                                <span className="font-semibold text-blue-600">
                                    {filteredReports.filter(
                                        (r) => r.location_lat !== null && r.location_long !== null
                                    ).length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            setSelectedUrgencyLevels([1, 2, 3, 4, 5]);
                            setSearchQuery('');
                        }}
                    >
                        รีเซ็ตตัวกรอง
                    </Button>
                </Card>

                {/* Map Container */}
                <Card className="flex-1 p-0 overflow-hidden relative">
                    <div className="w-full h-[60vh] lg:h-full">
                        <InteractiveMap
                            reports={filteredReports}
                            center={[13.7563, 100.5018]}
                            zoom={6}
                            showLegend={true}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Map;
