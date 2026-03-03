import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { ClipboardCheck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const eatRateOptions = [
  { value: 100, label: "100%", desc: "Ate everything" },
  { value: 75, label: "75%", desc: "Most of it" },
  { value: 50, label: "50%", desc: "About half" },
  { value: 25, label: "25%", desc: "Just a bit" },
  { value: 0, label: "0%", desc: "Didn't eat" },
];

export default function TrackerPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedRate, setSelectedRate] = useState<number | null>(null);

  const { data: deliveredOrders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders", "pending"],
    enabled: !!user,
  });

  const confirmMutation = useMutation({
    mutationFn: async ({ orderId, percentage }: { orderId: number; percentage: number }) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/confirm-eat-rate`, {
        percentageEaten: percentage,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      if (selectedRate !== null && selectedRate >= 50) {
        navigate("/reward");
      } else {
        navigate("/loss");
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const latestOrder = deliveredOrders?.[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!latestOrder) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold mb-6" data-testid="text-tracker-title">Tracker</h1>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ClipboardCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-muted-foreground mb-2" data-testid="text-no-orders">No orders to track</p>
            <p className="text-sm text-muted-foreground text-center">
              Your delivered orders will appear here for eat-rate confirmation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-2" data-testid="text-tracker-title">Tracker</h1>
        <p className="text-muted-foreground text-sm mb-6">Did you eat your food?</p>

        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Order #{latestOrder.id}</p>
            <p className="font-semibold text-sm mb-2">
              {latestOrder.items?.map((i: any) => i.itemName).join(", ")}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3 mb-8">
          {eatRateOptions.map((opt) => (
            <motion.div key={opt.value} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer hover-elevate transition-all ${
                  selectedRate === opt.value ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedRate(opt.value)}
                data-testid={`option-${opt.value}`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      selectedRate === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {opt.label}
                    </div>
                    <span className="text-sm font-medium">{opt.desc}</span>
                  </div>
                  {selectedRate === opt.value && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={selectedRate === null || confirmMutation.isPending}
          onClick={() => {
            if (selectedRate !== null && latestOrder) {
              confirmMutation.mutate({ orderId: latestOrder.id, percentage: selectedRate });
            }
          }}
          data-testid="button-submit-tracker"
        >
          {confirmMutation.isPending ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
