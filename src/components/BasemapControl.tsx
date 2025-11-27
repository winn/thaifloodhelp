import { Layers } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BASEMAP_OPTIONS } from '@/types/map'

interface BasemapControlProps {
  selectedBasemap: string
  onBasemapChange: (basemapId: string) => void
  showFloodLayer: boolean
  onFloodLayerToggle: (show: boolean) => void
  showRescueZoneLayer: boolean
  onRescueZoneLayerToggle: (show: boolean) => void
}

const BasemapControl = ({
  selectedBasemap,
  onBasemapChange,
  showFloodLayer,
  onFloodLayerToggle,
  showRescueZoneLayer,
  onRescueZoneLayerToggle,
}: BasemapControlProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
        <Card className="absolute top-12 right-0 p-2 w-48 shadow-xl bg-white/95 backdrop-blur-sm">
          <div className="space-y-1">
            {BASEMAP_OPTIONS.map((basemap) => (
              <button
                key={basemap.id}
                onClick={() => {
                  onBasemapChange(basemap.id)
                  setIsOpen(false)
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

          {/* Flood Layer Toggle */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2 px-3 py-2">
              <Checkbox
                id="flood-layer"
                checked={showFloodLayer}
                onCheckedChange={(checked) =>
                  onFloodLayerToggle(checked === true)
                }
              />
              <Label
                htmlFor="flood-layer"
                className="text-sm font-normal cursor-pointer text-gray-900"
              >
                พื้นที่น้ำท่วม
              </Label>
            </div>

            {/* Rescue Zone Layer Toggle */}
            <div className="flex items-start space-x-2 px-3 py-2">
              <Checkbox
                id="rescue-zone-layer"
                checked={showRescueZoneLayer}
                onCheckedChange={(checked) =>
                  onRescueZoneLayerToggle(checked === true)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="rescue-zone-layer"
                  className="text-sm font-normal cursor-pointer text-gray-900 leading-tight"
                >
                  โซนช่วยเหลือหาดใหญ่
                </Label>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                  25/11/2568 โดย GISTDA
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default BasemapControl
