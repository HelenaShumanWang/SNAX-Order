import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useCart } from "@/lib/cart";

const navItems = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/catalog", label: "Catalog", icon: ShoppingBag },
  { path: "/cart", label: "Cart", icon: ShoppingCart },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const [location] = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border" data-testid="bottom-nav">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location === path || (path === "/home" && location === "/");
          return (
            <Link key={path} href={path}>
              <button
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors relative ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {label === "Cart" && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" data-testid="cart-badge">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
