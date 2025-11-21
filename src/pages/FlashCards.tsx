import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles, Loader2, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Plus } from "lucide-react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { toast } from "@/hooks/use-toast";
import { callGeminiAPI } from "@/lib/gemini";

interface FlashCard {
  id: string;
  front: string;
  back: string;
  color: string;
}

const CARD_COLORS = [
  "bg-gradient-to-br from-blue-500 to-blue-600",
  "bg-gradient-to-br from-purple-500 to-purple-600",
  "bg-gradient-to-br from-pink-500 to-pink-600",
  "bg-gradient-to-br from-green-500 to-green-600",
  "bg-gradient-to-br from-yellow-500 to-yellow-600",
  "bg-gradient-to-br from-red-500 to-red-600",
  "bg-gradient-to-br from-indigo-500 to-indigo-600",
  "bg-gradient-to-br from-teal-500 to-teal-600",
];

const FlashCards = () => {
  const [topic, setTopic] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMode, setInputMode] = useState<"topic" | "text">("topic");

  const generateFlashCards = async () => {
    if (inputMode === "topic" && !topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate flash cards.",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "text" && !pastedText.trim()) {
      toast({
        title: "Text Required",
        description: "Please paste or type information to create flash cards.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setIsFlipped(false);
    setCurrentIndex(0);

    try {
      const prompt = inputMode === "topic"
        ? `Create educational flash cards about "${topic}". Generate 8-12 flash cards. For each card:
- Front side: A question or key term
- Back side: A clear, concise answer or definition

Format as JSON array with this structure:
[
  {"front": "Question 1", "back": "Answer 1"},
  {"front": "Question 2", "back": "Answer 2"}
]

Only return the JSON array, no additional text.`
        : `Create flash cards from the following information. Extract key concepts and create 8-12 flash cards. For each card:
- Front side: A question or key term
- Back side: A clear, concise answer or definition

Information:
${pastedText}

Format as JSON array with this structure:
[
  {"front": "Question 1", "back": "Answer 1"},
  {"front": "Question 2", "back": "Answer 2"}
]

Only return the JSON array, no additional text.`;

      const response = await callGeminiAPI(prompt, {
        temperature: 0.7,
        maxTokens: 2048,
      });

      // Parse the JSON response
      let cards: { front: string; back: string }[] = [];
      
      try {
        // Try to extract JSON array from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cards = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the whole response
          cards = JSON.parse(response.trim());
        }
        
        // Validate cards structure
        if (!Array.isArray(cards)) {
          throw new Error("Response is not an array");
        }
        
        // Filter and validate each card
        cards = cards
          .filter(card => card && typeof card === 'object' && card.front && card.back)
          .map(card => ({
            front: String(card.front).trim(),
            back: String(card.back).trim(),
          }))
          .filter(card => card.front && card.back);
          
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        // Fallback: create cards from structured text
        const lines = response.split('\n').filter(line => line.trim() && line.length > 10);
        const questionAnswerPairs: { front: string; back: string }[] = [];
        
        for (let i = 0; i < lines.length && questionAnswerPairs.length < 12; i++) {
          const line = lines[i].trim();
          // Look for Q: or Question patterns
          if (line.match(/^(Q:|Question|Front):/i)) {
            const front = line.replace(/^(Q:|Question|Front):\s*/i, '').trim();
            const back = lines[i + 1]?.replace(/^(A:|Answer|Back):\s*/i, '').trim() || "Answer not provided";
            if (front) {
              questionAnswerPairs.push({ front, back });
              i++; // Skip the answer line
            }
          }
        }
        
        if (questionAnswerPairs.length > 0) {
          cards = questionAnswerPairs;
        } else {
          // Last resort: create simple cards from lines
          cards = lines.slice(0, 12).map((line, index) => ({
            front: `Key Point ${index + 1}`,
            back: line.substring(0, 200), // Limit length
          }));
        }
      }

      // Create flash cards with colors
      const coloredCards: FlashCard[] = cards.map((card, index) => ({
        id: `card-${index}`,
        front: card.front.trim(),
        back: card.back.trim(),
        color: CARD_COLORS[index % CARD_COLORS.length],
      }));

      if (coloredCards.length === 0) {
        throw new Error("No flash cards were generated. Please try again.");
      }

      setFlashCards(coloredCards);
      toast({
        title: "Flash Cards Generated!",
        description: `Created ${coloredCards.length} flash cards. Start studying!`,
      });
    } catch (error) {
      console.error("Flash card generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate flash cards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < flashCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashCards].sort(() => Math.random() - 0.5);
    setFlashCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast({
      title: "Cards Shuffled!",
      description: "Flash cards have been shuffled.",
    });
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCard = flashCards[currentIndex];

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Flash Cards</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Create and study with AI-powered flash cards
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        {flashCards.length === 0 && (
          <Card className="shadow-card border-2 border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Create Flash Cards</CardTitle>
              <CardDescription>
                Enter a topic or paste information to generate flash cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={inputMode === "topic" ? "default" : "outline"}
                  onClick={() => setInputMode("topic")}
                  className="flex-1"
                >
                  Enter Topic
                </Button>
                <Button
                  variant={inputMode === "text" ? "default" : "outline"}
                  onClick={() => setInputMode("text")}
                  className="flex-1"
                >
                  Paste Text
                </Button>
              </div>

              {/* Topic Input */}
              {inputMode === "topic" && (
                <div>
                  <Input
                    placeholder="e.g., JavaScript Basics, World History, Biology Terms..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="text-lg py-6"
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        generateFlashCards();
                      }
                    }}
                  />
                </div>
              )}

              {/* Text Input */}
              {inputMode === "text" && (
                <div>
                  <Textarea
                    placeholder="Paste or type information here. The AI will extract key concepts and create flash cards..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="min-h-[200px] text-base"
                    disabled={isGenerating}
                  />
                </div>
              )}

              <Button
                onClick={generateFlashCards}
                disabled={isGenerating || (inputMode === "topic" ? !topic.trim() : !pastedText.trim())}
                className="w-full bg-gradient-ai text-white hover:opacity-90 font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Flash Cards...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Generate Flash Cards
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Flash Cards Display */}
        {flashCards.length > 0 && (
          <div className="space-y-6">
            {/* Card Counter and Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Card {currentIndex + 1} of {flashCards.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFlashCards([]);
                    setTopic("");
                    setPastedText("");
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Set
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shuffleCards}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle
                </Button>
              </div>
            </div>

            {/* Flash Card */}
            <div className="relative">
              <div
                className={`relative w-full h-[400px] cursor-pointer perspective-1000 ${isFlipped ? 'flipped' : ''}`}
                onClick={flipCard}
              >
                <div className="absolute inset-0 preserve-3d transition-transform duration-500" style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  {/* Front of Card */}
                  <div className={`absolute inset-0 backface-hidden rounded-2xl shadow-2xl flex items-center justify-center p-8 ${currentCard.color} text-white`}>
                    <div className="text-center">
                      <div className="text-sm font-semibold mb-4 opacity-80">Question</div>
                      <h2 className="text-3xl md:text-4xl font-bold leading-tight">{currentCard.front}</h2>
                      <div className="mt-6 text-sm opacity-70">Click to flip</div>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-2xl flex items-center justify-center p-8 ${currentCard.color} text-white`} style={{ transform: 'rotateY(180deg)' }}>
                    <div className="text-center">
                      <div className="text-sm font-semibold mb-4 opacity-80">Answer</div>
                      <p className="text-xl md:text-2xl leading-relaxed">{currentCard.back}</p>
                      <div className="mt-6 text-sm opacity-70">Click to flip back</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="px-6"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={flipCard}
                className="px-6"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                {isFlipped ? "Show Question" : "Show Answer"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={nextCard}
                disabled={currentIndex === flashCards.length - 1}
                className="px-6"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2 justify-center flex-wrap">
              {flashCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsFlipped(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default FlashCards;

