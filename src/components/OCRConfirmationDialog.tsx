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
import { CheckCircle2, X, Sparkles, Brain } from "lucide-react";
import { ParsedCardData } from "@/lib/dataParser";

interface OCRConfirmationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  data: ParsedCardData;
  dynamicFields?: Record<string, string>;
  isLoading?: boolean;
}

export function OCRConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  data,
  dynamicFields = {},
  isLoading = false,
}: OCRConfirmationDialogProps) {
  const allData = { ...data, ...dynamicFields };
  const hasData = Object.values(allData).some(value => value && value.trim() !== '');
  
  // Field labels mapping
  const fieldLabels: Record<string, string> = {
    full_name: "Full Name",
    company: "Company",
    designation: "Designation",
    email: "Email",
    phone: "Phone",
    website: "Website",
    address: "Address",
    purpose: "Purpose",
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <Brain className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl text-primary font-bold">AI Extracted Data</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Review the extracted information. You can edit any fields before saving.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!hasData ? (
            <div className="text-center py-8 text-muted-foreground">
              <X className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p>No information could be extracted from the images.</p>
              <p className="text-sm mt-2">Please fill in the details manually.</p>
            </div>
          ) : (
            <Card className="border-2 border-primary/10 bg-gradient-upload/30">
              <CardContent className="pt-6 space-y-4">
                {/* Standard Fields - Show all extracted data */}
                {allData.full_name && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-primary/20 shadow-sm">
                    <label className="text-xs font-bold text-primary uppercase tracking-wide mb-2 block">Full Name</label>
                    <p className="text-lg font-bold text-foreground">{allData.full_name}</p>
                  </div>
                )}
                
                {allData.company && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-primary/20 shadow-sm">
                    <label className="text-xs font-bold text-primary uppercase tracking-wide mb-2 block">Company</label>
                    <p className="text-base font-semibold">{allData.company}</p>
                  </div>
                )}
                
                {allData.designation && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-accent/20 shadow-sm">
                    <label className="text-xs font-bold text-accent uppercase tracking-wide mb-2 block">Designation</label>
                    <p className="text-base font-semibold">{allData.designation}</p>
                  </div>
                )}
                
                {allData.email && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-primary/20 shadow-sm">
                    <label className="text-xs font-bold text-primary uppercase tracking-wide mb-2 block">Email</label>
                    <p className="text-base font-medium text-primary break-all">{allData.email}</p>
                  </div>
                )}
                
                {allData.phone && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-accent/20 shadow-sm">
                    <label className="text-xs font-bold text-accent uppercase tracking-wide mb-2 block">Phone</label>
                    <p className="text-base font-medium text-accent font-mono">{allData.phone}</p>
                  </div>
                )}
                
                {allData.website && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-primary/20 shadow-sm">
                    <label className="text-xs font-bold text-primary uppercase tracking-wide mb-2 block">Website</label>
                    <p className="text-base font-medium text-primary break-all">{allData.website}</p>
                  </div>
                )}
                
                {allData.address && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-accent/20 shadow-sm">
                    <label className="text-xs font-bold text-accent uppercase tracking-wide mb-2 block">Address</label>
                    <p className="text-base font-medium whitespace-pre-line">{allData.address}</p>
                  </div>
                )}
                
                {allData.purpose && (
                  <div className="p-4 rounded-lg bg-white/60 border-2 border-primary/20 shadow-sm">
                    <label className="text-xs font-bold text-primary uppercase tracking-wide mb-2 block">Purpose</label>
                    <p className="text-base font-medium text-primary">{allData.purpose}</p>
                  </div>
                )}
                
                {/* Dynamic Fields - Show any additional fields found */}
                {Object.entries(dynamicFields).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-lg bg-white/60 border-2 border-accent/20 shadow-sm">
                    <label className="text-xs font-bold text-accent uppercase tracking-wide mb-2 block">
                      {fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <p className="text-base font-medium break-words">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="border-primary/20">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading || !hasData}
            className="bg-gradient-ai hover:opacity-90 text-white font-semibold shadow-lg glow-effect"
          >
            {isLoading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Use This Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

