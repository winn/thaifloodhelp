import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface MapControlPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedUrgencyLevels: number[];
  onUrgencyToggle: (level: number) => void;
  selectedStatuses: string[];
  onStatusToggle: (status: string) => void;
  urgencyCounts: Record<number, number>;
  statusCounts: Record<string, number>;
  totalCount: number;
  visibleCount: number;
  allReportsWithLocationCount: number;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ', color: '#EF4444' },
  { value: 'processed', label: 'กำลังดำเนินการ', color: '#F59E0B' },
  { value: 'completed', label: 'เสร็จสิ้น', color: '#10B981' },
];

const URGENCY_LEVELS = [
  { level: 5, color: '#DC2626' },
  { level: 4, color: '#EA580C' },
  { level: 3, color: '#CA8A04' },
  { level: 2, color: '#2563EB' },
  { level: 1, color: '#16A34A' },
];

const MapControlPanel = ({
  searchQuery,
  onSearchChange,
  selectedUrgencyLevels,
  onUrgencyToggle,
  selectedStatuses,
  onStatusToggle,
  urgencyCounts,
  statusCounts,
  totalCount,
  visibleCount,
  allReportsWithLocationCount,
  onReset,
}: MapControlPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile: Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 left-4 z-[1000] bg-white hover:bg-gray-100 text-gray-900 shadow-lg rounded-full p-4 transition-all"
        aria-label="เปิด/ปิดเมนู"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <Card className={`
        fixed bottom-4 left-4 z-[999] shadow-xl bg-white/95 backdrop-blur-sm
        ${isOpen ? 'block' : 'hidden md:block'}
        w-[calc(100vw-2rem)] md:w-80 max-h-[calc(100vh-5rem)] overflow-y-auto
      `}>
        <div className="p-4 space-y-4">
          {/* ค้นหา */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">ค้นหา</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="ชื่อ, ที่อยู่, ความช่วยเหลือ..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-8 h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* สถานะ */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">สถานะ</Label>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={() => onStatusToggle(status.value)}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor={`status-${status.value}`}
                      className="cursor-pointer flex items-center gap-2 text-sm"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.label}</span>
                    </Label>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    ({statusCounts[status.value] || 0})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ระดับความเร่งด่วน */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">ระดับความเร่งด่วน</Label>
            <div className="space-y-1.5">
              {URGENCY_LEVELS.map(({ level, color }) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`urgency-${level}`}
                      checked={selectedUrgencyLevels.includes(level)}
                      onCheckedChange={() => onUrgencyToggle(level)}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor={`urgency-${level}`}
                      className="cursor-pointer flex items-center gap-2 text-sm"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>Level {level}</span>
                    </Label>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    ({urgencyCounts[level] || 0})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* สถิติ */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">สถิติ</Label>
            <div className="space-y-1 text-sm font-sans">
              <div className="flex justify-between">
                <span className="text-gray-600">ทั้งหมด:</span>
                <span className="font-semibold font-sans">{totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">มีตำแหน่ง:</span>
                <span className="font-semibold font-sans">{allReportsWithLocationCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">แสดงบนแผนที่:</span>
                <span className="font-semibold text-blue-600 font-sans">{visibleCount}</span>
              </div>
            </div>
          </div>

          {/* รีเซ็ตตัวกรอง */}
          <Button
            variant="outline"
            className="w-full h-9 text-sm"
            onClick={onReset}
          >
            รีเซ็ตตัวกรอง
          </Button>
        </div>
      </Card>
    </>
  );
};

export default MapControlPanel;
