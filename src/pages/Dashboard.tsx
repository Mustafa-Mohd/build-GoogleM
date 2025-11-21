import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBusinessCards } from "@/integrations/firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Building2, User, Sparkles, Brain } from "lucide-react";
import { BusinessCard } from "@/types/businessCard";
import { CardDetailDialog } from "@/components/CardDetailDialog";
import { SidebarLayout } from "@/components/SidebarLayout";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);

  const { data: cards, isLoading } = useQuery({
    queryKey: ["business-cards"],
    queryFn: async () => {
      return await getBusinessCards();
    },
  });

  const filteredCards = cards?.filter((card) => {
    const query = searchQuery.toLowerCase();
    return (
      card.full_name.toLowerCase().includes(query) ||
      card.company?.toLowerCase().includes(query) ||
      card.phone?.toLowerCase().includes(query) ||
      card.email?.toLowerCase().includes(query)
    );
  });

  return (
    <SidebarLayout>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <Brain className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold text-primary">My Business Cards</h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Manage and search your AI-extracted business cards
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Search by name, company, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-primary/20 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-muted rounded-md mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCards && filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                className="cursor-pointer transition-all hover:shadow-hover border-2 border-primary/10 hover:border-primary/30 overflow-hidden group"
                onClick={() => setSelectedCard(card)}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden bg-gradient-card">
                    <img
                      src={card.front_image_url}
                      alt={card.full_name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-ai/0 group-hover:bg-gradient-ai/10 transition-colors" />
                  </div>
                  <div className="p-4 space-y-2 bg-gradient-upload/20">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="font-bold truncate text-foreground">{card.full_name}</h3>
                    </div>
                    {card.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-3 w-3 text-accent" />
                        <span className="truncate font-medium">{card.company}</span>
                      </div>
                    )}
                    {card.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-primary" />
                        <span className="truncate text-primary">{card.email}</span>
                      </div>
                    )}
                    {card.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-accent" />
                        <span className="truncate text-accent">{card.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "No cards found matching your search." : "No business cards yet. Upload your first card!"}
              </p>
            </div>
          </Card>
        )}
      </div>

      <CardDetailDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </SidebarLayout>
  );
};

export default Dashboard;
