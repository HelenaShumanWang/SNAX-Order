import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { useState } from "react";
import type { Item } from "@shared/schema";

interface Message {
  role: "user" | "bot";
  text: string;
}

const FAQ_RESPONSES: Record<string, (item: Item) => string> = {
  ingredients: (item) => `${item.name} is made with high-quality, natural ingredients. ${item.description || ""}`,
  allergens: (item) => `For allergen information about ${item.name}, please check the packaging. Common allergens may include nuts, dairy, gluten, and soy depending on the product.`,
  nutrition: (item) => {
    const n = item.nutritionalInfo as any;
    if (n) return `${item.name} contains ${n.calories} calories, ${n.protein}g protein, ${n.carbs}g carbs, and ${n.fat}g fat.`;
    return `Nutritional information for ${item.name} is available on the product page.`;
  },
  vegan: (item) => `Please check the product label of ${item.name} for vegan certification. Some items may contain dairy or honey.`,
  calories: (item) => {
    const n = item.nutritionalInfo as any;
    if (n) return `${item.name} has ${n.calories} calories per serving.`;
    return `Calorie information is available on the product packaging.`;
  },
};

function getResponse(input: string, item: Item): string {
  const lower = input.toLowerCase();
  if (lower.includes("ingredient")) return FAQ_RESPONSES.ingredients(item);
  if (lower.includes("allergen") || lower.includes("allergy")) return FAQ_RESPONSES.allergens(item);
  if (lower.includes("nutrition") || lower.includes("nutrient")) return FAQ_RESPONSES.nutrition(item);
  if (lower.includes("vegan") || lower.includes("vegetarian") || lower.includes("gluten")) return FAQ_RESPONSES.vegan(item);
  if (lower.includes("calorie") || lower.includes("cal")) return FAQ_RESPONSES.calories(item);
  if (lower.includes("price") || lower.includes("cost")) return `${item.name} is priced at $${parseFloat(item.price).toFixed(2)}.`;
  return `Great question about ${item.name}! For detailed information, you can check the product page or contact our support team. Try asking about ingredients, allergens, nutrition, or calories.`;
}

export default function ChatbotPage() {
  const [, params] = useRoute("/chatbot/:id");
  const itemId = params?.id;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi there! What would you like to know about this item? Try asking about ingredients, allergens, nutrition, or calories." },
  ]);

  const { data: item } = useQuery<Item>({
    queryKey: ["/api/items", itemId],
    enabled: !!itemId,
  });

  const sendMessage = () => {
    if (!input.trim() || !item) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: getResponse(userMsg, item) }]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col px-4 pt-4">
        <div className="mb-4">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-lg font-bold mt-3" data-testid="text-chatbot-title">
            Ask about {item?.name || "this item"}
          </h1>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
                <CardContent className="p-3">
                  <p className="text-sm" data-testid={`text-message-${i}`}>{msg.text}</p>
                </CardContent>
              </Card>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pb-4">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            data-testid="input-chat"
          />
          <Button size="icon" onClick={sendMessage} data-testid="button-send">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
