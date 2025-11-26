export interface BasemapOption {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom?: number;
  isWMS?: boolean;
  layers?: string;
}

export interface MapConfig {
  defaultLat: number;
  defaultLng: number;
  defaultZoom: number;
  useDefaultLocation: boolean;
}

export const getMapConfig = (): MapConfig => {
  const defaultLat = import.meta.env.VITE_MAP_DEFAULT_LAT;
  const defaultLng = import.meta.env.VITE_MAP_DEFAULT_LNG;
  const defaultZoom = import.meta.env.VITE_MAP_DEFAULT_ZOOM;
  const useDefaultLocation = import.meta.env.VITE_MAP_USE_DEFAULT_LOCATION;

  return {
    defaultLat: defaultLat ? parseFloat(defaultLat) : 13.7563,
    defaultLng: defaultLng ? parseFloat(defaultLng) : 100.5018,
    defaultZoom: defaultZoom ? parseInt(defaultZoom, 10) : 6,
    useDefaultLocation: useDefaultLocation === 'true',
  };
};

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  {
    id: 'topo',
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    maxZoom: 17,
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
];

