import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Report } from "@/types/report";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  reports: Report[];
}

const customDivIcon = new L.DivIcon({
  className: "custom-div-icon", // Add a custom class
  html: `<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [20, 20], // Size of the icon
  iconAnchor: [10, 10], // Anchor point of the icon
});

const getCustomIcon = (urgencyLevel: number) => {
  let color = "gray"; // Default color
  if (urgencyLevel <= 3) color = "yellow";
  else if (urgencyLevel === 4) color = "orange";
  else if (urgencyLevel >= 5) color = "red";

  return new L.DivIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const Map: React.FC<MapProps> = ({ reports }) => {
  return (
    <MapContainer
      center={[7.0142, 100.4712]} // Hat Yai, Thailand
      zoom={13}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.location_lat, report.location_long]}
          icon={getCustomIcon(report.urgency_level)}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{report.id}</h3>
              <p>
                <b>ที่อยู่:</b> <br />
                {report.address}
              </p>
              <p>
                <b>ข้อความต้นฉบับ:</b> <br />
                {report.raw_message}
              </p>
              <p className="text-sm text-gray-500">
                รายงานโดย: {report.reporter_name} <br />
                วันที่: {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
