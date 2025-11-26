import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import '../styles/map.css';
import { Report } from '@/types/report';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { BASEMAP_OPTIONS } from '@/types/map';

// Fix for default marker icon issue with Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Type definitions for leaflet.markercluster
declare module 'leaflet' {
    function markerClusterGroup(options?: any): any;
}

interface InteractiveMapProps {
    reports: Report[];
    center?: [number, number];
    zoom?: number;
    showLegend?: boolean;
    selectedBasemap?: string;
    showFloodLayer?: boolean;
}

const URGENCY_COLORS = {
    5: { border: '#DC2626', bg: '#FEE2E2', label: 'วิกฤติ - Critical' },
    4: { border: '#EA580C', bg: '#FFEDD5', label: 'เร่งด่วนมาก - Very Urgent' },
    3: { border: '#CA8A04', bg: '#FEF3C7', label: 'เร่งด่วน - Urgent' },
    2: { border: '#2563EB', bg: '#DBEAFE', label: 'ปานกลาง - Moderate' },
    1: { border: '#16A34A', bg: '#D1FAE5', label: 'ต่ำ - Low' },
};

const InteractiveMap = ({
    reports,
    center = [13.7563, 100.5018], // Default to center of Thailand
    zoom = 6,
    showLegend = true,
    selectedBasemap = 'osm',
    showFloodLayer = false,
}: InteractiveMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<any>(null);
    const basemapLayerRef = useRef<L.TileLayer | null>(null);
    const floodLayerRef = useRef<L.TileLayer | null>(null);
    const navigate = useNavigate();

    // Ensure marker cluster is attached to the map (useful after basemap/flood toggles)
    const ensureMarkersOnMap = () => {
        if (!mapRef.current || !markersRef.current) return;

        if (!mapRef.current.hasLayer(markersRef.current)) {
            mapRef.current.addLayer(markersRef.current);

            // Refresh clusters in case internal state got out-of-sync
            if (markersRef.current.refreshClusters) {
                markersRef.current.refreshClusters();
            }
        }
    };

    // Ensure flood overlay stays mounted when swapping basemaps
    const ensureFloodLayerOnMap = () => {
        if (!mapRef.current || !floodLayerRef.current || !showFloodLayer) return;

        if (!mapRef.current.hasLayer(floodLayerRef.current)) {
            floodLayerRef.current.addTo(mapRef.current);
            if (floodLayerRef.current.bringToFront) floodLayerRef.current.bringToFront();
        } else if (floodLayerRef.current.bringToFront) {
            floodLayerRef.current.bringToFront();
        }
    };

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Thailand bounds (approximate)
        const thailandBounds: L.LatLngBoundsExpression = [
            [5.6, 97.3],  // Southwest coordinates
            [20.5, 105.6] // Northeast coordinates
        ];

        // Initialize map
        const map = L.map(mapContainerRef.current, {
            center,
            zoom,
            zoomControl: true,
            maxBounds: thailandBounds,
            maxBoundsViscosity: 0.7,
            minZoom: 5,
        });

        mapRef.current = map;

        // Create custom panes for layer ordering (using z-index)
        // This ensures permanent layer ordering without needing bringToFront/bringToBack
        map.createPane('basemapPane');
        map.getPane('basemapPane')!.style.zIndex = '100'; // Basemap at bottom

        map.createPane('floodPane');
        map.getPane('floodPane')!.style.zIndex = '200'; // Flood layer in middle

        // markerPane already exists with default z-index = 600 (on top)

        // Add initial basemap tile layer
        const basemapOption = BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];
        const basemapLayer = L.tileLayer(basemapOption.url, {
            attribution: basemapOption.attribution,
            maxZoom: basemapOption.maxZoom || 19,
            pane: 'basemapPane', // Use custom pane for permanent ordering
        }).addTo(map);

        basemapLayerRef.current = basemapLayer;

        // Add legend if enabled
        if (showLegend) {
            const legend = (L as any).control({ position: 'bottomright' });
            legend.onAdd = () => {
                const div = L.DomUtil.create('div', 'map-legend');
                div.innerHTML = `
          <div class="map-legend-title">ระดับความเร่งด่วน</div>
          ${Object.entries(URGENCY_COLORS)
                        .reverse()
                        .map(
                            ([level, { border, label }]) => `
            <div class="map-legend-item">
              <div class="map-legend-color" style="border-color: ${border}; background-color: ${border}20;"></div>
              <span>Level ${level}: ${label}</span>
            </div>
          `
                        )
                        .join('')}
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">
            <div class="map-legend-item">
              <div class="map-legend-color" style="border-color: #3b82f6; background-color: rgba(59, 130, 246, 0.6);"></div>
              <span>พื้นที่น้ำท่วม (GISTDA)</span>
            </div>
          </div>
        `;
                return div;
            };
            legend.addTo(map);
        }

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center, zoom, showLegend]);

    // Handle basemap changes
    useEffect(() => {
        if (!mapRef.current || !basemapLayerRef.current) return;

        const basemapOption = BASEMAP_OPTIONS.find(b => b.id === selectedBasemap);
        if (!basemapOption) return;

        // Remove old basemap
        mapRef.current.removeLayer(basemapLayerRef.current);

        // Add new basemap using custom pane (ensures permanent layer ordering)
        const newBasemapLayer = L.tileLayer(basemapOption.url, {
            attribution: basemapOption.attribution,
            maxZoom: basemapOption.maxZoom || 19,
            pane: 'basemapPane', // Use custom pane - no need for bringToBack/bringToFront
        }).addTo(mapRef.current);

        basemapLayerRef.current = newBasemapLayer;

        // Basemap swaps can occasionally unset overlay layers; make sure markers stay mounted
        ensureMarkersOnMap();
        ensureFloodLayerOnMap();
    }, [selectedBasemap]);

    // Handle flood layer toggle
    useEffect(() => {
        if (!mapRef.current) return;

        const gistdaApiKey = import.meta.env.VITE_GISTDA_API_KEY;

        if (showFloodLayer) {
            // Add flood layer if it doesn't exist
            if (!floodLayerRef.current) {
                const floodLayer = L.tileLayer(
                    `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood/3days/wmts/{z}/{x}/{y}.png?api_key=${gistdaApiKey}`,
                    {
                        attribution: '&copy; <a href="https://www.gistda.or.th">GISTDA</a>',
                        maxZoom: 19,
                        minZoom: 0,
                        opacity: 0.6,
                        pane: 'floodPane', // Use custom pane - ensures permanent layer ordering
                    }
                ).addTo(mapRef.current);

                floodLayerRef.current = floodLayer;
            }
            ensureFloodLayerOnMap();
        } else {
            // Remove flood layer if it exists
            if (floodLayerRef.current && mapRef.current.hasLayer(floodLayerRef.current)) {
                mapRef.current.removeLayer(floodLayerRef.current);
                floodLayerRef.current = null;
            }
        }

        // Flood layer add/remove can occasionally reorder panes; ensure markers remain visible
        ensureMarkersOnMap();
    }, [showFloodLayer]);

    // Update markers when reports change
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing markers
        if (markersRef.current) {
            mapRef.current.removeLayer(markersRef.current);
        }

        // Create marker cluster group
        const markers = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                let className = 'marker-cluster-small';
                if (count > 50) {
                    className = 'marker-cluster-large';
                } else if (count > 10) {
                    className = 'marker-cluster-medium';
                }
                return L.divIcon({
                    html: `<div><span>${count}</span></div>`,
                    className: `marker-cluster ${className}`,
                    iconSize: L.point(40, 40),
                });
            },
        });

        // Add markers for each report with valid location within Thailand only
        const validReports = reports.filter((report) => {
            // Skip if no location data
            if (!report.location_lat || !report.location_long) return false;

            const lat = parseFloat(report.location_lat.toString());
            const lng = parseFloat(report.location_long.toString());

            // Basic validation: must be valid numbers
            if (isNaN(lat) || isNaN(lng)) return false;

            // Filter for locations within Thailand bounds (remove obvious noise)
            // Thailand: roughly 5.6°N to 20.5°N, 97.3°E to 105.6°E
            // Add small buffer to be less strict
            return (
                lat >= 5.0 && lat <= 21.0 &&
                lng >= 97.0 && lng <= 106.0
            );
        });

        validReports.forEach((report) => {
            const { location_lat, location_long, urgency_level } = report;

            if (location_lat === null || location_long === null) {
                return;
            }

            const urgencyColors = URGENCY_COLORS[urgency_level as keyof typeof URGENCY_COLORS] ||
                URGENCY_COLORS[3];

            // Create custom icon
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="urgency-marker level-${urgency_level}">${urgency_level}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16],
            });

            const marker = L.marker([location_lat, location_long], {
                icon: customIcon,
            });

            // Create popup content
            const popupContent = `
        <div class="map-popup">
          <div class="map-popup-header">
            ${report.name || 'ไม่ระบุชื่อ'} ${report.lastname || ''}
          </div>
          <div class="map-popup-info">
            <div class="map-popup-info-row">
              <span class="map-popup-label">ระดับ:</span>
              <span class="map-popup-urgency level-${urgency_level}">
                Level ${urgency_level}
              </span>
            </div>
            ${report.address
                    ? `
              <div class="map-popup-info-row">
                <span class="map-popup-label">ที่อยู่:</span>
                <span class="map-popup-value">${report.address}</span>
              </div>
            `
                    : ''
                }
            ${report.phone && report.phone.length > 0
                    ? `
              <div class="map-popup-info-row">
                <span class="map-popup-label">โทร:</span>
                <span class="map-popup-value">${report.phone.join(', ')}</span>
              </div>
            `
                    : ''
                }
            ${report.help_needed
                    ? `
              <div class="map-popup-info-row">
                <span class="map-popup-label">ความช่วยเหลือ:</span>
                <span class="map-popup-value">${report.help_needed}</span>
              </div>
            `
                    : ''
                }
          </div>
          <a href="/report/${report.id}" class="map-popup-link" data-report-id="${report.id}" style="color: white;">
            ดูรายละเอียดเพิ่มเติม
          </a>
        </div>
      `;

            marker.bindPopup(popupContent, {
                maxWidth: 350,
                className: 'custom-popup',
            });

            // Handle link clicks in popup
            marker.on('popupopen', () => {
                const linkElement = document.querySelector(
                    `[data-report-id="${report.id}"]`
                ) as HTMLAnchorElement;
                if (linkElement) {
                    linkElement.onclick = (e) => {
                        e.preventDefault();
                        navigate(`/report/${report.id}`);
                    };
                }
            });

            // Add marker to cluster
            markers.addLayer(marker);
        });

        // Set the ref BEFORE adding to map
        markersRef.current = markers;

        // Add to map
        mapRef.current.addLayer(markers);

        // Force cluster to update
        if (markers.refreshClusters) {
            markers.refreshClusters();
        }

        // Markers automatically stay on top via markerPane (z-index = 600)
        // No need for bringToFront() - panes handle layer ordering!

        // DON'T auto-fit bounds - let user control the view
        // Only set initial view if this is the first load (no previous markers)
        // This prevents the map from resetting when changing basemap or toggling layers
    }, [reports, navigate]);

    const hasValidReports = reports.some(
        (r) => r.location_lat !== null && r.location_long !== null
    );

    return (
        <div className="relative h-full w-full">
            <div ref={mapContainerRef} className="map-container" style={{ height: '100%', width: '100%' }} />
            {!hasValidReports && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
                    <div className="text-center p-6 bg-card rounded-lg shadow-lg">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-lg font-medium text-foreground">ไม่มีข้อมูลตำแหน่งในแผนที่</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            ข้อมูลที่บันทึกไม่มีพิกัดละติจูด/ลองจิจูด
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveMap;
