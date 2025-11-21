import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBusinessCards, deleteBusinessCard } from "@/integrations/firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BusinessCard } from "@/types/businessCard";
import { CardDetailDialog } from "@/components/CardDetailDialog";
import { Trash2, Eye, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const { data: cards, isLoading } = useQuery({
    queryKey: ["admin-business-cards"],
    queryFn: async () => {
      return await getBusinessCards();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteBusinessCard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business-cards"] });
      toast({
        title: "Success",
        description: "Card deleted successfully.",
      });
      setCardToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete card.",
        variant: "destructive",
      });
    },
  });

  const filteredCards = cards?.filter((card) => {
    const query = searchQuery.toLowerCase();
    return (
      card.full_name.toLowerCase().includes(query) ||
      card.company?.toLowerCase().includes(query) ||
      card.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredCards && filteredCards.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.full_name}</TableCell>
                        <TableCell>{card.company || "-"}</TableCell>
                        <TableCell>{card.email || "-"}</TableCell>
                        <TableCell>{card.phone || "-"}</TableCell>
                        <TableCell>{new Date(card.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCard(card)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCardToDelete(card.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No cards found." : "No cards available."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CardDetailDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />

      <AlertDialog open={!!cardToDelete} onOpenChange={() => setCardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the business card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cardToDelete && deleteMutation.mutate(cardToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
