import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Apple, Leaf, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Apple className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2" data-testid="text-app-title">
            SN<span className="text-primary">A</span>X
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-tagline">
            Future Me Ordered This
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full space-y-3 mb-12"
        >
          <Link href="/signup">
            <Button className="w-full" size="lg" data-testid="button-signup">
              Sign Up
            </Button>
          </Link>
          <Link href="/login">
            <Button className="w-full" variant="outline" size="lg" data-testid="button-login">
              Log In
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-6 w-full"
        >
          {[
            { icon: Leaf, label: "Healthy", color: "text-green-500" },
            { icon: Zap, label: "Pre-Order", color: "text-orange-500" },
            { icon: Heart, label: "Habits", color: "text-pink-500" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
