import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Trophy, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function RewardPage() {
  const { user } = useAuth();
  const streak = user?.streakCount || 0;

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center"
      >
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-green-500" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold mb-2" data-testid="text-congrats">Congrats!</h1>
        <p className="text-muted-foreground mb-6">You stuck with your healthy choice. Your future self thanks you!</p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-primary/10 rounded-2xl px-8 py-6 mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-3xl font-bold" data-testid="text-streak">{streak}</span>
          </div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="w-3 h-3 rounded-full bg-green-500"
            />
          ))}
        </div>

        <div className="space-y-3 w-full max-w-sm">
          <Link href="/home">
            <Button className="w-full" data-testid="button-go-home">Back to Home</Button>
          </Link>
          <Link href="/feedback">
            <Button variant="outline" className="w-full" data-testid="button-feedback">Leave Feedback</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
