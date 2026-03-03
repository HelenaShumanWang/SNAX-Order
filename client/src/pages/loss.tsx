import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { CloudRain, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function LossPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <CloudRain className="w-12 h-12 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-2" data-testid="text-loss">Better luck next time</h1>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
          It's okay! Building healthy habits takes time. Tomorrow is a fresh start.
        </p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-muted rounded-2xl px-8 py-6 mb-8 max-w-xs mx-auto"
        >
          <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Tip: Try ordering snacks you're excited about to increase your follow-through!
          </p>
        </motion.div>

        <div className="space-y-3 w-full max-w-sm">
          <Link href="/catalog">
            <Button className="w-full" data-testid="button-try-again">Order Again</Button>
          </Link>
          <Link href="/home">
            <Button variant="outline" className="w-full" data-testid="button-go-home">Back to Home</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
