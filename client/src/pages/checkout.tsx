import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Shield, Clock } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [pledged, setPledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link href="/catalog">
            <Button>Browse Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast({ title: "Address required", description: "Please enter a delivery address", variant: "destructive" });
      return;
    }
    if (!deliveryTime) {
      toast({ title: "Time required", description: "Please select a delivery time", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        deliveryAddress: address,
        deliveryTime: new Date(`${new Date().toISOString().split("T")[0]}T${deliveryTime}`).toISOString(),
        pledgeConfirmed: pledged,
        items: items.map((ci) => ({ itemId: ci.item.id, quantity: ci.quantity })),
        totalCost: total.toFixed(2),
      };

      const res = await apiRequest("POST", "/api/orders", orderData);
      const order = await res.json();
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      navigate(`/confirmation/${order.id}`);
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-muted-foreground mb-4" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-6" data-testid="text-checkout-title">Checkout</h1>

        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name} x{quantity}</span>
                  <span className="font-medium">${(parseFloat(item.price) * quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary" data-testid="text-total">${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Delivery Details</h3>
            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Input
                id="address"
                placeholder="e.g., Room 204, West Hall"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                data-testid="input-address"
              />
            </div>
            <div>
              <Label htmlFor="time">Scheduled Delivery Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  className="pl-10"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  data-testid="input-time"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Make Your Pledge</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Pre-committing increases your chance of sticking to healthy choices by up to 80%.
                </p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pledge"
                    checked={pledged}
                    onCheckedChange={(checked) => setPledged(checked === true)}
                    data-testid="checkbox-pledge"
                  />
                  <Label htmlFor="pledge" className="text-sm cursor-pointer">
                    I pledge to eat this healthy snack tonight instead of ordering junk food.
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          data-testid="button-place-order"
        >
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
