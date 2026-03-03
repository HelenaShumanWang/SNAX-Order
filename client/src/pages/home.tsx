import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StreakBadge } from "@/components/streak-badge";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ShoppingBag, ClipboardCheck, Lightbulb, TrendingUp, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const healthTips = [
  { title: "Hydration Matters", tip: "Drink water before snacking. Often, thirst is mistaken for hunger." },
  { title: "Protein Power", tip: "Snacks with protein keep you full longer and help maintain energy levels." },
  { title: "Mindful Eating", tip: "Take your time eating. It takes 20 minutes for your brain to register fullness." },
  { title: "Smart Timing", tip: "Pre-ordering in the morning leverages your peak decision-making hours." },
];

export default function HomePage() {
  const { user } = useAuth();

  const { data: pendingOrders } = useQuery<any[]>({
    queryKey: ["/api/orders", "pending"],
    enabled: !!user,
  });

  const hasPendingTracker = pendingOrders && pendingOrders.length > 0;
  const randomTip = healthTips[Math.floor(Date.now() / 86400000) % healthTips.length];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-sm">Good {getTimeOfDay()},</p>
              <h1 className="text-2xl font-bold" data-testid="text-greeting">
                {user?.username || "Snacker"}
              </h1>
            </div>
            <div className="bg-primary/10 rounded-xl px-4 py-2">
              <StreakBadge count={user?.streakCount || 0} size="sm" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Link href="/tracker">
            <Card className="hover-elevate cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm" data-testid="link-tracker">Tracker</p>
                  <p className="text-xs text-muted-foreground">Log your eats</p>
                </div>
                {hasPendingTracker && (
                  <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                    Pending
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/catalog">
            <Card className="hover-elevate cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm" data-testid="link-catalog">Catalog</p>
                  <p className="text-xs text-muted-foreground">Browse snacks</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" data-testid="text-tip-title">{randomTip.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{randomTip.tip}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Progress</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-streak-count">{user?.streakCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ClipboardCheck className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-eat-rate">{parseFloat(user?.avgEatRate || "0").toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Eat Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6"
        >
          <Link href="/catalog">
            <Button className="w-full" size="lg" data-testid="button-order-now">
              Order Healthy Snacks
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
