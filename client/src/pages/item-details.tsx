import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { ArrowLeft, ShoppingCart, MessageCircle, Flame, Wheat, Droplets, Beef } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Item } from "@shared/schema";

export default function ItemDetailsPage() {
  const [, params] = useRoute("/item/:id");
  const { addItem } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const itemId = params?.id;

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ["/api/items", itemId],
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <Skeleton className="w-full aspect-square rounded-xl mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Item not found</p>
      </div>
    );
  }

  const nutrition = item.nutritionalInfo as { calories: number; protein: number; carbs: number; fat: number } | null;

  const handleAddToCart = () => {
    addItem(item);
    toast({ title: "Added to cart", description: `${item.name} has been added to your cart` });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto">
        <div className="px-4 pt-4 mb-4">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="px-4">
          <img
            src={item.imageUrl || "/images/lemon-almond-bar.png"}
            alt={item.name}
            className="w-full aspect-square object-cover rounded-xl mb-4"
            data-testid="img-item-detail"
          />

          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-xl font-bold" data-testid="text-item-name">{item.name}</h1>
            <Badge variant="secondary">{item.category}</Badge>
          </div>

          <p className="text-primary text-xl font-bold mb-4" data-testid="text-item-price">
            ${parseFloat(item.price).toFixed(2)}
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-item-desc">
            {item.description}
          </p>

          {nutrition && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">Nutrition Facts</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Flame, label: "Calories", value: `${nutrition.calories}`, color: "text-orange-500" },
                    { icon: Beef, label: "Protein", value: `${nutrition.protein}g`, color: "text-red-500" },
                    { icon: Wheat, label: "Carbs", value: `${nutrition.carbs}g`, color: "text-yellow-600" },
                    { icon: Droplets, label: "Fat", value: `${nutrition.fat}g`, color: "text-blue-500" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="text-center">
                      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                      <p className="text-sm font-bold" data-testid={`text-${label.toLowerCase()}`}>{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleAddToCart} data-testid="button-add-to-cart">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Link href={`/chatbot/${item.id}`}>
              <Button variant="outline" className="w-full" size="lg" data-testid="button-ask">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask About This Item
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
