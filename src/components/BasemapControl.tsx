import { useState, useEffect, useRef } from 'react';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BASEMAP_OPTIONS } from '@/types/map';

interface BasemapControlProps {
  selectedBasemap: string;
  onBasemapChange: (basemapId: string) => void;
}

const BasemapControl = ({
  selectedBasemap,
  onBasemapChange,
}: BasemapControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={cardRef} className="fixed top-20 right-4 z-[1000]">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
        size="icon"
        className="bg-white hover:bg-gray-100 text-gray-900 shadow-lg h-10 w-10"
        aria-label="เลือกแผนที่ฐาน"
      >
        <Layers className="h-5 w-5" />
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 p-2 w-40 shadow-xl bg-white/95 backdrop-blur-sm">
          <div className="space-y-1">
            {BASEMAP_OPTIONS.map((basemap) => (
              <button
                key={basemap.id}
                onClick={() => {
                  onBasemapChange(basemap.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                  selectedBasemap === basemap.id
                    ? 'bg-blue-500 text-white font-medium'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                {basemap.name}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BasemapControl;
