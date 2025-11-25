import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { PhoneList } from "@/components/PhoneList";

interface DuplicateReport {
  id: string;
  name: string;
  address: string;
  phone: string[];
  raw_message: string;
  similarity: number;
}

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicateReport[];
  onSaveAnyway: () => void;
  onCancel: () => void;
}

export const DuplicateDialog = ({
  open,
  onOpenChange,
  duplicates,
  onSaveAnyway,
  onCancel,
}: DuplicateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <DialogTitle>พบข้อมูลที่อาจซ้ำ</DialogTitle>
          </div>
          <DialogDescription>
            ระบบพบ {duplicates.length} รายการที่มีข้อมูลคล้ายกับรายงานนี้
            กรุณาตรวจสอบว่าเป็นข้อมูลเดียวกันหรือไม่
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {duplicates.map((duplicate, index) => (
            <Card key={duplicate.id} className="border-warning/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg">
                        {duplicate.name || '(ไม่ระบุชื่อ)'}
                      </span>
                      <Badge variant="outline">
                        {Math.round(duplicate.similarity * 100)}% คล้ายกัน
                      </Badge>
                    </div>
                    
                    {duplicate.address && (
                      <div className="text-sm">
                        <span className="font-medium">ที่อยู่:</span>{' '}
                        <span className="text-muted-foreground">{duplicate.address}</span>
                      </div>
                    )}
                    
                    {duplicate.phone && duplicate.phone.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">เบอร์:</span>{' '}
                        <PhoneList phones={duplicate.phone} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 rounded p-3 text-sm">
                  <div className="font-medium mb-1">ข้อความต้นฉบับ:</div>
                  <div className="text-muted-foreground line-clamp-3">
                    {duplicate.raw_message}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={onSaveAnyway} variant="default">
            <CheckCircle className="mr-2 h-4 w-4" />
            บันทึกเป็นรายการใหม่
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
