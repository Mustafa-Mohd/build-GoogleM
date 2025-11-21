import { useEffect, useState } from "react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Entry = {
  id: string;
  created_at: string;
  full_name?: string | null;
  company?: string | null;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  notes?: string | null;
  front_image_url?: string | null;
  back_image_url?: string | null;
};

const STORAGE_KEY = "business_cards_local";

const Data = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Entry[];
        setEntries(parsed.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-primary">Saved Data</h1>
            <p className="text-sm text-muted-foreground mt-1">Your locally saved business cards</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/upload")} className="border-primary/30 hover:border-primary">Add New</Button>
            <Button variant="destructive" onClick={clearAll}>Clear All</Button>
          </div>
        </div>
        {entries.length === 0 ? (
          <Card className="border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-ai opacity-10 pointer-events-none" />
            <CardContent className="p-8">
              <p className="text-lg">No entries yet. Upload a card to see it here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {entries.map((e) => (
              <Card
                key={e.id}
                className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 bg-gradient-upload/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-ai opacity-10 pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl font-bold text-foreground">
                    {e.full_name || "Unknown"}
                  </CardTitle>
                  <div className="text-sm font-medium text-primary/90">{e.company || "—"}</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {e.designation && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                        {e.designation}
                      </span>
                    )}
                    {e.website && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent-foreground border border-accent/20">
                        Website
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  {e.front_image_url && (
                    <div className="group relative overflow-hidden rounded-xl border border-primary/20">
                      <img
                        src={e.front_image_url}
                        alt="Front"
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full bg-black/50 text-white">Front</div>
                    </div>
                  )}
                  {e.back_image_url && (
                    <div className="group relative overflow-hidden rounded-xl border border-primary/20">
                      <img
                        src={e.back_image_url}
                        alt="Back"
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full bg-black/50 text-white">Back</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {e.email && (
                      <div className="rounded-lg border border-primary/20 bg-white/60 px-3 py-2">
                        <span className="font-semibold text-primary">Email:</span> <span className="break-all">{e.email}</span>
                      </div>
                    )}
                    {e.phone && (
                      <div className="rounded-lg border border-accent/20 bg-white/60 px-3 py-2">
                        <span className="font-semibold text-accent">Phone:</span> <span className="font-mono">{e.phone}</span>
                      </div>
                    )}
                    {e.address && (
                      <div className="rounded-lg border border-primary/20 bg-white/60 px-3 py-2">
                        <span className="font-semibold text-primary">Address:</span> <span className="whitespace-pre-wrap">{e.address}</span>
                      </div>
                    )}
                    {e.notes && (
                      <div className="rounded-lg border border-primary/20 bg-white/60 px-3 py-2">
                        <span className="font-semibold text-primary">Notes:</span>
                        <div className="whitespace-pre-wrap mt-1">{e.notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground pt-1">
                    Saved: {new Date(e.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Data;

