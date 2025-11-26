import type { Report } from "@/types/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface MapProps {
  reports: Report[];
}

/**
 * Lightweight placeholder map component
 *
 * react-leaflet was causing a Context.Consumer runtime error in this
 * environment ("render2 is not a function"). To keep the dashboard
 * working and data visible, we render a simple summary + CTA instead
 * of an interactive map for now.
 */
const Map: React.FC<MapProps> = ({ reports }) => {
  const reportsWithLocation = reports.filter(
    (r) => r.location_lat !== null && r.location_long !== null
  );

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          แผนที่ผู้ประสบภัย (โหมดเบื้องต้น)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          ขณะนี้ปิดการใช้งานแผนที่แบบโต้ตอบชั่วคราวเพื่อป้องกันข้อผิดพลาดบนหน้า Dashboard
        </p>
        <p className="text-sm">
          มีเคสที่มีพิกัดแผนที่ทั้งหมด
          <span className="font-semibold mx-1">{reportsWithLocation.length}</span>
          เคส
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          คุณยังสามารถดูรายละเอียดแต่ละเคสและเปิด Google Maps จากปุ่มในตารางข้อมูลได้
        </p>
      </CardContent>
    </Card>
  );
};

export default Map;
