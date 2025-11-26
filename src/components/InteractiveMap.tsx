import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import '../styles/map.css';
import { Report } from '@/types/report';
import { useNavigate } from 'react-router-dom';

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
}: InteractiveMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<any>(null);
    const navigate = useNavigate();

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

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

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

            // Strict filter: Only locations within Thailand bounds
            // Thailand: roughly 5.6°N to 20.5°N, 97.3°E to 105.6°E
            return (
                !isNaN(lat) &&
                !isNaN(lng) &&
                lat >= 5.6 && lat <= 20.5 &&
                lng >= 97.3 && lng <= 105.6
            );
        });

        validReports.forEach((report) => {
            const { location_lat, location_long, urgency_level } = report;

            if (location_lat === null || location_long === null) return;

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

            markers.addLayer(marker);
        });

        markersRef.current = markers;
        mapRef.current.addLayer(markers);

        // Fit bounds to show all markers if there are any, but stay within Thailand
        if (validReports.length > 0 && mapRef.current) {
            const bounds = markers.getBounds();
            if (bounds.isValid()) {
                // Ensure bounds are within Thailand
                const thailandBounds = L.latLngBounds([5.6, 97.3], [20.5, 105.6]);
                const constrainedBounds = bounds.pad(0.1);
                
                // Only fit if bounds are reasonable
                if (thailandBounds.contains(constrainedBounds.getCenter())) {
                    mapRef.current.fitBounds(constrainedBounds, { 
                        padding: [50, 50], 
                        maxZoom: 15,
                        animate: false 
                    });
                } else {
                    // Default to Thailand center if bounds are outside
                    mapRef.current.setView([13.7563, 100.5018], 6);
                }
            }
        } else if (mapRef.current) {
            // No valid reports, show Thailand center
            mapRef.current.setView([13.7563, 100.5018], 6);
        }
    }, [reports, navigate]);

    return <div ref={mapContainerRef} className="map-container" style={{ height: '100%', width: '100%' }} />;
};

export default InteractiveMap;
