import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold mb-6" data-testid="text-cart-title">Cart</h1>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-muted-foreground mb-2" data-testid="text-empty-cart">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-6">Add some healthy snacks to get started</p>
            <Link href="/catalog">
              <Button data-testid="button-browse">Browse Catalog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" data-testid="text-cart-title">Cart</h1>
          <span className="text-sm text-muted-foreground">{itemCount} items</span>
        </div>

        <div className="space-y-3 mb-6">
          <AnimatePresence mode="popLayout">
            {items.map(({ item, quantity }) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <img
                      src={item.imageUrl || "/images/lemon-almond-bar.png"}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" data-testid={`text-cart-name-${item.id}`}>{item.name}</h3>
                      <p className="text-primary font-bold text-sm">${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center font-semibold text-sm" data-testid={`text-qty-${item.id}`}>{quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold" data-testid="text-subtotal">${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Link href="/checkout">
          <Button className="w-full" size="lg" data-testid="button-checkout">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
