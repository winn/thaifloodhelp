import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import InteractiveMap from '@/components/InteractiveMap';
import MapControlPanel from '@/components/MapControlPanel';
import BasemapControl from '@/components/BasemapControl';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMapConfig } from '@/types/map';
import '../styles/map.css';

const Map = () => {
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [selectedUrgencyLevels, setSelectedUrgencyLevels] = useState<number[]>([
        1, 2, 3, 4, 5,
    ]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
        'pending',
        'processed',
        'completed',
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBasemap, setSelectedBasemap] = useState('osm');
    const [showFloodLayer, setShowFloodLayer] = useState(false);
    const { toast } = useToast();

    // Get map configuration from env
    const mapConfig = getMapConfig();

    // Fetch all reports
    const { data: reports, isLoading, error } = useQuery({
        queryKey: ['reports'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    id,
                    name,
                    lastname,
                    address,
                    help_needed,
                    phone,
                    location_lat,
                    location_long,
                    urgency_level,
                    status,
                    created_at
                `)
                .not('location_lat', 'is', null)
                .not('location_long', 'is', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Report[];
        },
    });

    // Fetch total count of all reports
    const { data: totalCount } = useQuery({
        queryKey: ['reports-count'],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            return count || 0;
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

        let filtered = reports.filter(
            (report) =>
                selectedUrgencyLevels.includes(report.urgency_level) &&
                selectedStatuses.includes(report.status)
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
    }, [reports, selectedUrgencyLevels, selectedStatuses, searchQuery]);

    const toggleUrgencyLevel = (level: number) => {
        setSelectedUrgencyLevels((prev) =>
            prev.includes(level)
                ? prev.filter((l) => l !== level)
                : [...prev, level].sort()
        );
    };

    const toggleStatus = (status: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
        );
    };

    const resetFilters = () => {
        setSelectedUrgencyLevels([1, 2, 3, 4, 5]);
        setSelectedStatuses(['pending', 'processed', 'completed']);
        setSearchQuery('');
    };

    // Count all reports (not filtered)
    const allReportsWithLocation =
        reports?.filter(
            (r) => r.location_lat !== null && r.location_long !== null
        ) || [];

    const urgencyCounts = {
        1: allReportsWithLocation.filter((r) => r.urgency_level === 1).length,
        2: allReportsWithLocation.filter((r) => r.urgency_level === 2).length,
        3: allReportsWithLocation.filter((r) => r.urgency_level === 3).length,
        4: allReportsWithLocation.filter((r) => r.urgency_level === 4).length,
        5: allReportsWithLocation.filter((r) => r.urgency_level === 5).length,
    };

    const statusCounts = {
        pending: allReportsWithLocation.filter((r) => r.status === 'pending')
            .length,
        processed: allReportsWithLocation.filter((r) => r.status === 'processed')
            .length,
        completed: allReportsWithLocation.filter((r) => r.status === 'completed')
            .length,
    };

    const visibleCount = filteredReports.filter(
        (r) => r.location_lat !== null && r.location_long !== null
    ).length;

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

    // Calculate map center based on config
    const mapCenter: [number, number] = mapConfig.useDefaultLocation
        ? [mapConfig.defaultLat, mapConfig.defaultLng]
        : [13.7563, 100.5018]; // Thailand center as fallback

    return (
        <div className="map-page-container relative w-full h-full overflow-hidden">
            {/* Full screen map */}
            <div className="absolute inset-0">
                <InteractiveMap
                    reports={filteredReports}
                    center={mapCenter}
                    zoom={mapConfig.useDefaultLocation ? mapConfig.defaultZoom : 6}
                    showLegend={true}
                    selectedBasemap={selectedBasemap}
                    showFloodLayer={showFloodLayer}
                />
            </div>

            {/* Control Panel (Bottom Left) */}
            <MapControlPanel
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedUrgencyLevels={selectedUrgencyLevels}
                onUrgencyToggle={toggleUrgencyLevel}
                selectedStatuses={selectedStatuses}
                onStatusToggle={toggleStatus}
                urgencyCounts={urgencyCounts}
                statusCounts={statusCounts}
                totalCount={totalCount || 0}
                visibleCount={visibleCount}
                allReportsWithLocationCount={allReportsWithLocation.length}
                onReset={resetFilters}
            />

            {/* Basemap Control (Top Right) */}
            <BasemapControl
                selectedBasemap={selectedBasemap}
                onBasemapChange={setSelectedBasemap}
                showFloodLayer={showFloodLayer}
                onFloodLayerToggle={setShowFloodLayer}
            />
        </div>
    );
};

export default Map;
