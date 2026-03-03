import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { CheckCircle, Package, Truck, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const statusSteps = [
  { key: "placed", label: "Order Placed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

export default function ConfirmationPage() {
  const [, params] = useRoute("/confirmation/:id");
  const orderId = params?.id;
  const [simulatedStatus, setSimulatedStatus] = useState(0);

  const { data: order } = useQuery<any>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => setSimulatedStatus(1), 5000),
      setTimeout(() => setSimulatedStatus(2), 15000),
      setTimeout(() => setSimulatedStatus(3), 30000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const currentStep = Math.max(
    simulatedStatus,
    statusSteps.findIndex((s) => s.key === order?.status) || 0
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-1" data-testid="text-confirmation-title">Order Confirmed!</h1>
          <p className="text-muted-foreground text-sm">
            Order #{orderId}
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">Order Status</h3>
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                         data-testid={`text-status-${step.key}`}>
                        {step.label}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant="default" className="text-[10px]">Current</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {order && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Order Details</h3>
              {order.items?.map((oi: any) => (
                <div key={oi.id} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{oi.itemName} x{oi.quantity}</span>
                  <span className="font-medium">${parseFloat(oi.itemPrice || "0").toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-sm">Total</span>
                <span className="font-bold text-sm text-primary">${parseFloat(order.totalCost || "0").toFixed(2)}</span>
              </div>
              {order.deliveryAddress && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{order.deliveryAddress}</span>
                </div>
              )}
              {order.deliveryTime && (
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(order.deliveryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Link href="/home">
            <Button className="w-full" data-testid="button-go-home">Back to Home</Button>
          </Link>
          <Link href="/tracker">
            <Button variant="outline" className="w-full" data-testid="button-go-tracker">Go to Tracker</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
