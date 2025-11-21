import { BusinessCard } from "@/types/businessCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, Building2, Briefcase, Globe, MapPin, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CardDetailDialogProps {
  card: BusinessCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CardDetailDialog = ({ card, open, onOpenChange }: CardDetailDialogProps) => {
  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{card.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Front Image</p>
              <div className="relative h-64 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={card.front_image_url}
                  alt="Front"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            {card.back_image_url && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Back Image</p>
                <div className="relative h-64 overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={card.back_image_url}
                    alt="Back"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            
            {card.company && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{card.company}</p>
                </div>
              </div>
            )}

            {card.designation && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{card.designation}</p>
                </div>
              </div>
            )}

            {card.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${card.email}`} className="font-medium text-accent hover:underline">
                    {card.email}
                  </a>
                </div>
              </div>
            )}

            {card.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${card.phone}`} className="font-medium text-accent hover:underline">
                    {card.phone}
                  </a>
                </div>
              </div>
            )}

            {card.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a 
                    href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent hover:underline"
                  >
                    {card.website}
                  </a>
                </div>
              </div>
            )}

            {card.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{card.address}</p>
                </div>
              </div>
            )}

            {card.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium whitespace-pre-wrap">{card.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
